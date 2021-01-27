import Taro, { useState} from '@tarojs/taro'
import { AtAccordion } from 'taro-ui'
import './index.scss'
import TextSection from "../textSection/index.weapp";

const YiBenTongSection = (props) => {
  let {data, title, keyword, zoomIn} = props;
  data = data ? data : '';
  const [isOpen, setIsOpen] = useState(false);

  return (<AtAccordion
    open={isOpen}
    onClick={() => {
      const status = !isOpen;
      setIsOpen(status)
    }}
    title={title}
    isAnimation={false}
  >
    <TextSection data={data} zoomIn={zoomIn} keyword={keyword} />
  </AtAccordion>)
}

export default YiBenTongSection;
