import Taro, {setStorageSync, useState, useEffect} from '@tarojs/taro'
import {Image, Text, View, Button} from "@tarojs/components";
import {AtModal, AtModalHeader, AtModalContent, AtModalAction,AtImagePicker} from "taro-ui";

import './index.scss'
import {getUserNickname} from "../../util/login";

const token = '24.c87ea0d91b322a76c1ade23a4eea3001.2592000.1625305895.282335-24304397'

const ImageRecoginzer = (props) => {
  const {close} = props
  const [images, setImages] = useState([]);
  const [results, setResults] = useState([]);
  const [broders, setBroders] = useState([]);

  const [ratio, setRatio] = useState(1)
  const [loaded, setLoaded] = useState(false)

  const onSelect = (files) => {
    setImages(files)
  }

  const convertToBase64AndRecognize = () => {
    Taro.cloud.callFunction({
      name: 'record',
      data: {
        nickName: getUserNickname(),
        type: 'recognize'
      }
    })
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
          url: `https://aip.baidubce.com/rest/2.0/ocr/v1/general?access_token=${token}`,
          method: 'post',
          data: {
            image: `data:image/png;base64,${base64}`
          },
          header: {
            'content-type': 'application/x-www-form-urlencoded'
          },
          success: function (r) {

            setResults(r.data.words_result)

            const data = r.data.words_result.map(result => {
              const {top, left, width, height} =result.location
              return {
                top: parseInt(top * ratio),
                left: parseInt(left * ratio),
                width: parseInt(width * ratio),
                height: parseInt(height * ratio),
                word: result.words
              }
            })

            setBroders(data)

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

  const copyToClipboard = (text, isAll) => {

    Taro.setClipboardData({
      data: text,
      success: function (res) {
        Taro.showToast({
          title: isAll ? '全部文字已复制到剪贴板' : `'${text}'已复制到剪贴板`,
          icon: 'none',
          duration: 2000
        })
      }
    });
  }

  const copyAll = () => {
    copyToClipboard(results.map(result => result.words).join(''), true)
  }

  const onImageLoad = e => {
    setRatio(552 / parseInt(e.detail.width))
    setLoaded(true)
  }

  return (<AtModal isOpened>
    <AtModalHeader>人工智能图片识别</AtModalHeader>
    <AtModalContent>
      {!loaded && <AtImagePicker
        length={1}
        showAddBtn={images.length === 0}
        files={images}
        onChange={onSelect}
      />}
      { <View className={`cover-container ${loaded ? '': 'hidden'}`}>
        <Image src={images[0].url} className='full-image' mode='widthFix' onLoad={onImageLoad} />
        {broders.map((border, index) => {
          return (
            <View key={`border-${index}`} className='focus-view' onClick={() => copyToClipboard(border.word)}
                  style={{width: `${border.width}rpx`, height: `${border.height}rpx`, top: `${border.top}rpx`, left: `${border.left}rpx`}}></View>
          )
        })}
        {results.length > 0 && <View className='background'></View>}
      </View>}
      {/*<View className='results'>*/}
      {/*  {results.map((result, index) => (<View key={`result-${index}`} className='result' onClick={() => copyToClipboard(result.words)}>*/}
      {/*    {result.words}*/}
      {/*  </View>))}*/}
      {/*</View>*/}
    </AtModalContent>
    <AtModalAction>
      {results.length === 0 && <Button onClick={convertToBase64AndRecognize}>识别</Button>}
      {results.length > 0 && <Button onClick={copyAll}>复制全部</Button>}
      <Button onClick={close}>返回</Button>
    </AtModalAction>
  </AtModal>)
}

export default ImageRecoginzer;
