import Taro, { useState } from '@tarojs/taro'
import { View, RichText} from '@tarojs/components'
import { AtAccordion } from 'taro-ui'
import './index.scss'

const CivilLawLinkExplanation = (props) => {
  const {link} = props;
  const title = link ? link.title.replace('<br/>', '') : ''
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
    <View className='link' >
      <RichText nodes={link.content}></RichText>
    </View>
  </AtAccordion>)
}

export default CivilLawLinkExplanation;
