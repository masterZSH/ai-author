// pages/ai-painter/index.js

const app = getApp();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    showActionsheet: false,
    groups: [{
        text: '示例菜单',
        value: 1
      },
      {
        text: '示例菜单',
        value: 2
      },
      {
        text: '负向菜单',
        type: 'warn',
        value: 3
      }
    ]
  },
  close: function () {
    this.setData({
      showActionsheet: false
    })
  },
  jumpLx(e) {
    wx.navigateTo({
      url: '../lx/index',
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


  /*---------------------end of 界面绑定的函数------------------------------------------ */

  // 初始化
  init: function () {

  },








})