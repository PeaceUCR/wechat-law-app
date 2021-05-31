import Taro, {setStorageSync, useState, useEffect} from '@tarojs/taro'
import {Image, Text, View, Button} from "@tarojs/components";
import {AtModal, AtModalHeader, AtModalContent, AtModalAction,AtImagePicker} from "taro-ui";

import './index.scss'

const ImageRecoginzer = (props) => {
  const {open, close} = props
  const [images, setImages] = useState([]);
  const [results, setResults] = useState([]);

  const onSelect = (files) => {
    setImages(files)
  }

  const convertToBase64AndRecognize = () => {
    console.log('images[0].url', images[0].url)
    Taro.showLoading({
      title: '识别中',
    })
    Taro.getFileSystemManager().readFile({
      filePath: images[0].url,
      encoding: 'base64',
      success: (res) => {
        console.log(res)
        const base64 = res.data
        Taro.request({
          url: 'https://aip.baidubce.com/rest/2.0/ocr/v1/accurate_basic?access_token=24.2e43887f1ccb1c43e794b32371b4d302.2592000.1624889669.282335-24272803',
          method: 'post',
          data: {
            image: `data:image/png;base64,${base64}`
          },
          header: {
            'content-type': 'application/x-www-form-urlencoded'
          },
          success: function (r) {
            setResults(r.data.words_result)
            Taro.hideLoading()
            Taro.showToast({
              title: '识别成功，点击复制',
              icon: 'none',
              duration: 2000
            })
          }
        })
      }
    })
  }

  const copyToClipboard = (text) => {

    Taro.setClipboardData({
      data: text,
      success: function (res) {
        Taro.showToast({
          title: '复制成功',
          icon: 'none',
          duration: 2000
        })
      }
    });
  }
  return (<AtModal isOpened>
    <AtModalHeader>人工智能图片识别</AtModalHeader>
    <AtModalContent>
      <AtImagePicker
        length={1}
        showAddBtn={images.length === 0}
        files={images}
        onChange={onSelect}
      />
      <View className='results'>
        {results.map((result, index) => (<View key={`result-${index}`} className='result' onClick={() => copyToClipboard(result.words)}>
          {result.words}
        </View>))}
      </View>
    </AtModalContent>
    <AtModalAction><Button onClick={convertToBase64AndRecognize}>识别</Button><Button onClick={close}>返回</Button></AtModalAction>
  </AtModal>)
}

export default ImageRecoginzer;
