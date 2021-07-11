let interstitialAd = null

// NOT WORK!
export const loadContext = () => {
  if (wx.createInterstitialAd) {
    interstitialAd = wx.createInterstitialAd({
      adUnitId: 'adunit-25f5d95e7a759687'
    })
    interstitialAd.onLoad(() => {
      console.log('load')
      interstitialAd.show().catch((err) => {
        console.error(err)
      })
    })
    interstitialAd.onError((err) => {console.log('err', err)})
    interstitialAd.onClose(() => {})
  }
}


export default interstitialAd;
