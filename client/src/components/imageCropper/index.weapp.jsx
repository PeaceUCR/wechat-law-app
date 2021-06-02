import Taro, {setStorageSync, useState, useEffect, useRef} from '@tarojs/taro'
import {Image, Text, View, Button} from "@tarojs/components";
import {
  TaroCropper
} from 'taro-cropper';
import './index.scss'

const ImageCropper = (props) => {
  const {open, close} = props
  const [imageSrc, setImageSrc] = useState('');
  const [cutPath, setCutPath] = useState('');

  const cropper =useRef('cropper')
  const onSelect = () => {
    Taro.chooseImage({
      count: 1
    })
      .then(res => {
        setImageSrc(res.tempFilePaths[0])
      })
  }
  const onCrop = () => {

    cropper.current && cropper.current.cut()
      .then(res => {
        setCutPath(res.filePath)
        Taro.previewImage({
          current: res.filePath,
          urls: [res.filePath]
        })
        console.log(res);
      })
      .catch(err => {
        console.log(err);
      })
  }

  return (<View>
    <View>
      <TaroCropper
        height={1000} src={imageSrc}
        cropperWidth={400}
        cropperHeight={400}
        ref={cropper}
        onCut={res => {
          setCutPath(res)
        }
        }
      />
    </View>
    <View>
      <Button onClick={onCrop}>
      裁剪
      </Button>
      <Button onClick={onSelect}>
        选择图片
      </Button>
    </View>
  </View>)
}

export default ImageCropper;
