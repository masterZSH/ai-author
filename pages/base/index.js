// pages/ai-painter/index.js

const app = getApp();

const author = require('../../utils/author.js');
const fetchWechat = require('fetch-wechat');
const tf = require('@tensorflow/tfjs-core');
const cpu = require('@tensorflow/tfjs-backend-cpu');
const webgl = require('@tensorflow/tfjs-backend-webgl');
const plugin = requirePlugin('tfjsPlugin');
let videoAd = null

var model;
var dat;

Page({
  /**
   * 页面的初始数据
   */
  data: {
    seedText:"",
    seedIndices:[],
    generatedText:"",
    name:"",
    text_url:"",
    model_url:""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    wx.setNavigationBarTitle({
      title: "AI写作大师-"+options.name,
    })
    this.setData({
      "model_url":options.model_url,
      "text_url":options.text_url,
      "name":options.name
    })



    wx.showShareMenu({
      withShareTicket: true
    });

    plugin.configPlugin({
      // polyfill fetch function
      fetchFunc: fetchWechat.fetchFunc(),
      // inject tfjs runtime
      tf,
      // inject backend
      webgl,
      // provide webgl canvas
      canvas: wx.createOffscreenCanvas()
    });
    var that = this;

    if (wx.createRewardedVideoAd) {
      videoAd = wx.createRewardedVideoAd({
        adUnitId: 'adunit-fa5f16f6c284e3d3'
      })
      videoAd.onLoad(() => {})
      videoAd.onError((err) => {})
      videoAd.onClose((res) => {
        if (res && res.isEnded) {
          that.generateText()
          // 正常播放结束，可以下发游戏奖励
        } else {
          console.log("close")
          // 播放中途退出，不下发游戏奖励
        }
      })
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.context = wx.createCanvasContext("firstCanvas");
    this.init();
    let that = this;
    wx.showLoading({
      title: `加载${that.data.name}模型...`,
      mask: true,
    });
    author.loadModels(that.data.model_url,that.data.text_url).then((res) => {
      console.log(res)
      model=res.model
      dat = res.text
      wx.hideLoading();
    });
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {},

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {

  },

  randText(){
    var [seed, seedIndices] = dat.getRandomSlice();
    this.setData({
      seedIndices:seedIndices,
    })
    var that = this

    var i = 0
  var len = seed.length
  var t = setInterval(function e(){
        if(i>=len){
            clearInterval(t)
            return 
        }
        that.setData({
          seedText:seed.substr(0,i+1)
        })
        i++
    },50)
  },

  generate(){
    if (videoAd) {
      videoAd.show().catch(() => {
        // 失败重试
        videoAd.load()
          .then(() => videoAd.show())
          .catch(err => {
            console.log('激励视频 广告显示失败')
          })
      })
    }
  },

  async generateText(){
    var seedSentence = this.data.seedText
  seedSentence = seedSentence.slice(
    seedSentence.length - dat.sampleLen(), seedSentence.length);
var seedSentenceIndices = dat.textToIndices(seedSentence);

wx.showLoading({
  title: '生成中...',
  mask: true,
});


let generated = await author.generateText(
  model,
  dat, 
  seedSentenceIndices, 
  250,
   0.6
   );
   wx.hideLoading()
   var that = this

   var i = 0
  var len = generated.length
  var t = setInterval(function e(){
        if(i>=len){
            clearInterval(t)
            return 
        }
        that.setData({
          generatedText:generated.substr(0,i+1)
        })
        i++
    },50)
  
  },


  modelChange: async function (e) {
    this.setData({
      status: '正在努力加载模型ᕙ༼ ͝°益° ༽ᕗ'
    });

    console.log(e.detail.value);
    wx.showLoading({
      title: '加载模型...',
      mask: true,
    });
    await autoPainter.loadModels(e.detail.value).then((res) => {
      wx.hideLoading();

    });
  },

  /*---------------------end of 界面绑定的函数------------------------------------------ */

  // 初始化
  init: function () {
   
  },
  handleTap(e){
    this.setData({ evt: e })
  }

})