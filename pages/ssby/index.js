// pages/ai-painter/index.js

const app = getApp();

const author = require('../../utils/author.js');
const fetchWechat = require('fetch-wechat');
const tf = require('@tensorflow/tfjs-core');
const cpu = require('@tensorflow/tfjs-backend-cpu');
const webgl = require('@tensorflow/tfjs-backend-webgl');
const plugin = requirePlugin('tfjsPlugin');


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
   
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
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
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.context = wx.createCanvasContext("firstCanvas");
    this.init();
    let that = this;
    wx.showLoading({
      title: '加载莎士比亚模型...',
      mask: true,
    });
    author.loadModels('ssby').then((res) => {
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