// pages/ai-painter/index.js

const app = getApp();
const author = require('../../utils/author.js');

const authorUrl =  'https://cube123-9gs5oit6f40a9a64-1312906436.tcloudbaseapp.com/author.json'


Page({
  /**
   * 页面的初始数据
   */
  data: {
    author: []
  },
  close: function () {
    this.setData({
      showActionsheet: false
    })
  },
  jump(e){
    console.log(e)
    var author = this.data.author[e.currentTarget.id]
    wx.navigateTo({
      url: `../base/index?name=${author.name}&model_url=${author.model_url}&text_url=${author.text_url}`,
    })
  },
  jumpLx(e) {
    wx.navigateTo({
      url: '../lx/index',
    })
  },

  jumpSsby(e) {
    wx.navigateTo({
      url: '../ssby/index',
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {


  },

  
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: async function () {
    var data = await author.requestFunc(authorUrl)
    this.setData({
      author:data.data,
    })
  },

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


  /*---------------------end of 界面绑定的函数------------------------------------------ */

  // 初始化
  init: function () {

  },








})