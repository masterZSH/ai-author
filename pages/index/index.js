// pages/ai-painter/index.js

const app = getApp();

const author = require('../../utils/author.js');
const fetchWechat = require('fetch-wechat');
const tf = require('@tensorflow/tfjs-core');
const cpu = require('@tensorflow/tfjs-backend-cpu');
const webgl = require('@tensorflow/tfjs-backend-webgl');
const plugin = requirePlugin('tfjsPlugin');




Page({
  /**
   * 页面的初始数据
   */
  data: {

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

    wx.showLoading({
      title: '加载模型...',
      mask: true,
    });
    author.loadModels('lx').then((res) => {
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

  






})