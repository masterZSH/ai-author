// compoents/aiModels/autoPainter/autoPainter.js
// Auto painter模型推理库

/* 加载tensorflow库 */
const tf = require('@tensorflow/tfjs-core')
const tfLayers = require('@tensorflow/tfjs-layers');
const {
  async
} = require('regenerator-runtime');
const data = require('./data')



const MODELS_URL = {
  // 'flower': 'file://images/flower-model.json',
  'lx': 'https://aidraw-6gmdpk1q1d0cf4c4-1312936391.tcloudbaseapp.com/lx-model/model.json',

}

/* 全局变量 */
// 所有的模型
let models = {
  'flower': null,
  'butterfly': null,
  'apple': null,
  'sun': null
};
let curModelType = 'lx'; // 当前模型类型


/**
 * 数组转成tensor
 */
async function tensorPreprocess(inks) {
  return tf.tidy(() => {
    //convert to a tensor
    let tensor = tf.tensor(inks);
    return tensor.expandDims(0);
  })
}

/**
 * 加载模型
 * @param {string} modelType 模型类型
 * @returns true for success, false for failed.
 */
async function loadModels(modelType) {
  if (modelType) {
    curModelType = modelType;
  }

  if (models[curModelType]) { // 模型已加载
    return true;
  }

  console.log('Loading models...');




  /* 加载并预热模型 */
  try {
    models[curModelType] = await tfLayers.loadLayersModel(MODELS_URL[curModelType]);
  } catch (err) {
    console.log(err);
    return false;
  }


  var r = wx.request({
    url: "https://aidraw-6gmdpk1q1d0cf4c4-1312936391.tcloudbaseapp.com/lx-model/lx",
    success: async function (e) {
      console.log(r)
      var model = models[curModelType]
      // await models[curModelType].predict(strokeTensor);
      const sampleLen = model.inputs[0].shape[1];

      const textData = new data.TextData('text-data', e.data, sampleLen, 3);

      // Get a seed text from the text data object.
      const [seed, seedIndices] = textData.getRandomSlice();

      console.log(`Seed text:\n"${seed}"\n`);

      const generated = await generateText(
        model, textData, seedIndices, 250, 0.6);


      console.log(`Generated text:\n"${generated}"\n`);
    }
  })
  async function generateText(
    model, textData, sentenceIndices, length, temperature,
    onTextGenerationChar) {
    const sampleLen = model.inputs[0].shape[1];
    const charSetSize = model.inputs[0].shape[2];

    // Avoid overwriting the original input.
    sentenceIndices = sentenceIndices.slice();

    let generated = '';
    while (generated.length < length) {
      // Encode the current input sequence as a one-hot Tensor.
      const inputBuffer =
        new tf.TensorBuffer([1, sampleLen, charSetSize]);

      // Make the one-hot encoding of the seeding sentence.
      for (let i = 0; i < sampleLen; ++i) {
        inputBuffer.set(1, 0, i, sentenceIndices[i]);
      }
      const input = inputBuffer.toTensor();

      // Call model.predict() to get the probability values of the next
      // character.
      const output = model.predict(input);

      // Sample randomly based on the probability values.
      const winnerIndex = sample(tf.squeeze(output), temperature);
      const winnerChar = textData.getFromCharSet(winnerIndex);
      if (onTextGenerationChar != null) {
        await onTextGenerationChar(winnerChar);
      }

      generated += winnerChar;
      sentenceIndices = sentenceIndices.slice(1);
      sentenceIndices.push(winnerIndex);

      // Memory cleanups.
      input.dispose();
      output.dispose();
    }
    return generated;
  }

  return

  console.log(r)
  var model = models[curModelType]
  // await models[curModelType].predict(strokeTensor);
  const sampleLen = model.inputs[0].shape[1];

  const textData = new data.TextData('text-data', txt.Txt, sampleLen, args.sampleStep);

  // Get a seed text from the text data object.
  const [seed, seedIndices] = textData.getRandomSlice();

  console.log(`Seed text:\n"${seed}"\n`);

  const generated = await generateText(
    model, textData, seedIndices, args.genLength, args.temperature);

  console.log(`Generated text:\n"${generated}"\n`);
  return true;
}

function sample(probs, temperature) {
  return tf.tidy(() => {
    const logits = tf.div(tf.log(probs), Math.max(temperature, 1e-6));
    const isNormalized = false;
    // `logits` is for a multinomial distribution, scaled by the temperature.
    // We randomly draw a sample from the distribution.
    return tf.multinomial(logits, 1, null, isNormalized).dataSync()[0];
  });
}


/**
 * 根据当前起始笔画预测并生成后续笔画
 * @param {Array} beginStroke 起始笔画
 * @returns 二维数组代表预测的后续笔画
 */
async function generate(beginStroke) {
  if (models[curModelType] === null) {
    console.log("Model unloaded.!");
    return null;
  }

  // The initial inks len.
  const initialLen = beginStroke.length;
  console.log("The initial inks len: " + initialLen);
  // Enter the initial inks.
  models[curModelType].resetStates();
  let strokeTensor = await tensorPreprocess(beginStroke);
  let predTf = await models[curModelType].predict(strokeTensor);
  let pred = await predTf.dataSync();
  predTf.dispose();
  // Find the last ink.
  const index = (initialLen - 1) * 4;
  let pred_ = [pred[index], pred[index + 1], pred[index + 2], pred[index + 3]];
  // Save the new ink.
  beginStroke.push(pred_);
  // Pred the left inks.
  let inp = null;
  do {
    // Use the last ink as input.
    inp = [beginStroke[beginStroke.length - 1]];
    // Enter the initial inks.
    let inpTensor = await tensorPreprocess(inp);
    predTf = await models[curModelType].predict(inpTensor);
    pred = await predTf.dataSync();
    predTf.dispose();
    // Find he last ink.
    pred_ = [pred[0], pred[1], pred[2] >= 0.5 ? 1.0 : 0.0, pred[3] >= 0.5 ? 1.0 : 0.0];
    // Save the new ink.
    beginStroke.push(pred_);
  } while (pred[3] < 0.5 && beginStroke.length <= MAX_LEN[curModelType] - initialLen);
  // console.log(beginStroke);
  // Pop the initial inks.
  let followStroke = beginStroke.splice(initialLen, beginStroke.length - initialLen);

  return followStroke;
}

let autoPainter = {
  loadModels: loadModels,
  generate: generate,
};

module.exports = autoPainter;