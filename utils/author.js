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
  'lx': 'https://cube123-9gs5oit6f40a9a64-1312906436.tcloudbaseapp.com/lx-model/model.json',

  'ssby': 'https://cube123-9gs5oit6f40a9a64-1312906436.tcloudbaseapp.com/ssby-model/model.json',
}

const TEXT_URL = {
  // 'flower': 'file://images/flower-model.json',
  'lx': 'https://cube123-9gs5oit6f40a9a64-1312906436.tcloudbaseapp.com/lx-model/lx',

  'ssby': 'https://cube123-9gs5oit6f40a9a64-1312906436.tcloudbaseapp.com/ssby-model/ssby',
}

/* 全局变量 */
// 所有的模型
let models = {

};
let curModelType = 'lx'; // 当前模型类型

function requestFunc(url, data, method = 'GET', dataType = 'json', responseType = 'text', header, abortTime = 5) {
  wx.showLoading({
      title: '',
  });
  return new Promise(function (resolve, reject) {
      // let defaultHeader = {
      //     'content-type': 'application/json',
      // };
      // header = Object.assign(defaultHeader, header);
      let requestObject = {
          url: url || '',
          data: data || {},
          header: {},
          method: method ,
          // dataType: 'json',
          success: success,
          fail: fail,
          complete: complete,
      };

      /**
       * 成功方法
       * @param {Object} res -参数
       * @returns {undefined} -
       */
      function success(res) {
          resolve(res);
      }

      /**
       * 失败方法
       * @param {Error} err -错误
       * @returns {undefined} -
       */
      function fail(err) {
          wx.showToast({
              title: '网络异常，请稍后重试',
              icon: 'none',
              duration: 2000,
          });
          reject(err);
      }

      /**
       * 完成方法
       * @returns {undefined} -
       */
      function complete() {
          wx.hideLoading();
      }
      let requestTask = wx.request(requestObject);
      // 超时中断
      setTimeout(function () {
          requestTask && requestTask.abort();
          reject('请求超时');
      }, Number.parseInt(abortTime, 10) * 1000);
  });
}


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
async function loadModels(modelUrl,textUrl) {


  if (models[modelUrl]) { // 模型已加载
    return true;
  }

  console.log('Loading models...');




  /* 加载并预热模型 */
  try {
    models[curModelType] = await tfLayers.loadLayersModel(modelUrl);
  } catch (err) {
    console.log(err);
    return false;
  }


  var dat = await requestFunc(textUrl)
    console.log(dat)
    var model = models[curModelType]
    // await models[curModelType].predict(strokeTensor);
         var sampleLen = model.inputs[0].shape[1];

      var textData = new data.TextData('text-data', dat.data, sampleLen, 3);

    return {
      "model":model,
      "text":textData
    } 
//   var r = wx.request({
//     url: "https://aidraw-6gmdpk1q1d0cf4c4-1312936391.tcloudbaseapp.com/lx-model/lx",
//     success: async function (e) {
//       console.log(r)
//       var model = models[curModelType]
//       // await models[curModelType].predict(strokeTensor);
//       var sampleLen = model.inputs[0].shape[1];

//       var textData = new data.TextData('text-data', e.data, sampleLen, 3);

//       // Get a seed text from the text data object.
//       const [seed, seedIndices] = textData.getRandomSlice();

//       var seedSentence = "已开启代码文件保存后自动热重载"
//   seedSentence = seedSentence.slice(
//     seedSentence.length - textData.sampleLen(), seedSentence.length);
// var seedSentenceIndices = textData.textToIndices(seedSentence);


//       console.log(`Seed text:\n"${seedSentence}"\n`);
//       console.log(`Seed seedIndices:\n"${seedSentenceIndices}"\n`);

//       const generated = await generateText(
//         model, textData, seedSentenceIndices, 250, 0.6);


//       console.log(`Generated text:\n"${generated}"\n`);
//     }
//   })




  

//   return r

//   console.log(r)
//   var model = models[curModelType]
//   // await models[curModelType].predict(strokeTensor);
//   var sampleLen = model.inputs[0].shape[1];

//   var textData = new data.TextData('text-data', txt.Txt, sampleLen, args.sampleStep);

//   // Get a seed text from the text data object.
//   const [seed, seedIndices] = textData.getRandomSlice();

//   console.log(`Seed text:\n"${seed}"\n`);

//   const generated = await generateText(
//     model, textData, seedIndices, args.genLength, args.temperature);

//   console.log(`Generated text:\n"${generated}"\n`);
//   return true;
}

function randText(model,data){
  var sampleLen = model.inputs[0].shape[1];

  var textData = new data.TextData('text-data', data, sampleLen, 3);

  // Get a seed text from the text data object.
  var [seed, seedIndices] = textData.getRandomSlice();
  return seed,seedIndices
}

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

function sample(probs, temperature) {
  return tf.tidy(() => {
    const logits = tf.div(tf.log(probs), Math.max(temperature, 1e-6));
    const isNormalized = false;
    // `logits` is for a multinomial distribution, scaled by the temperature.
    // We randomly draw a sample from the distribution.
    return tf.multinomial(logits, 1, null, isNormalized).dataSync()[0];
  });
}




let autoPainter = {
  loadModels: loadModels,
  generateText: generateText,
  requestFunc:requestFunc

};

module.exports = autoPainter;