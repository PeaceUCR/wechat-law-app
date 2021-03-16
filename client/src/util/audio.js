import Taro from '@tarojs/taro';

export const audio = Taro.createInnerAudioContext();
audio.src = 'https://res.cloudinary.com/mini-store-2020/video/upload/v1615566664/RSP_-_%E3%81%95%E3%81%8F%E3%82%89__%E3%81%82%E3%81%AA%E3%81%9F%E3%81%AB%E5%87%BA%E4%BC%9A%E3%81%88%E3%81%A6%E3%82%88%E3%81%8B%E3%81%A3%E3%81%9F__pcwpzo.mp3';
audio.loop = true;

// at page
//audio.play()
//audio.stop()

