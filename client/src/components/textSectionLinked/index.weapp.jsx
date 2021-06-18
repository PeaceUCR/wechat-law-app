import Taro, { Component } from '@tarojs/taro'
import {RichText, View, Button} from "@tarojs/components";
import {AtModal, AtModalHeader, AtModalContent, AtModalAction} from "taro-ui";

import './index.scss'

// data is text (with \n), type is string

export default class TextSectionLinked extends Component {

  state = {
    showModal: false,
    links: [],
    matchesObject: {}
  }

  close = () => {
    this.setState({
      showModal: false
    })
  }
  redirectTo = (chnNumber) => {
    Taro.navigateTo({
      url: `/pages/termDetail/index?chnNumber=${chnNumber}`,
    })
  }

  handleClickLink = (index) => {
    const {matchesObject} = this.state
    const matches = matchesObject[index]
    console.log('index',index)
    console.log('matchesObject',matchesObject)
    if (!matches) {
      return ;
    }
    if (matches.length === 1) {
      this.redirectTo(matches[0])
    } else if (matches.length > 1) {
      this.setState({
        showModal: true,
        links: matches
      })
    }
  }
  renderFindAndHighlight = (str, index) => {
    const {keywords} = this.props
    const {matchesObject} = this.state

    const regexAll = new RegExp(keywords.join('|'),"g")

    if (keywords && keywords.length > 0 && regexAll.test(str)) {
      let r = str
      let matches = [];

      keywords.forEach(keyword => {
        const regex = new RegExp(keyword,"g")

        if (regex.test(r)) {
          matches.push(keyword)
        }

        r = r.replace(regex, `<span class='highlight-keyword'>${keyword}</span>`)
      })

      matchesObject[index] = matches

      return (<RichText nodes={'<div>' + r + '</div>'} ></RichText>)
    }

    return (<RichText nodes={'<div>' + str + '</div>'} ></RichText>)
  }

  renderModal = () => {
    const {links} = this.state
    return (
      <AtModal isOpened>
        <AtModalHeader>关联刑法链接</AtModalHeader>
        <AtModalContent>
          {links.map((word, index) => {
            return (<View key={`link-term-${index}`} onClick={() => this.redirectTo(word)} className='highlight-keyword in-modal'>
              {word}
            </View>)
          })}
        </AtModalContent>
        <AtModalAction><Button onClick={this.close}>确定</Button></AtModalAction>
      </AtModal>
    )
  }

  render () {
    const { data, zoomIn } = this.props
    const { showModal } = this.state
    return (<View  className={`text-section-linked ${zoomIn ? 'zoom-in' : ''}`}>
      {data &&
      <View className='content'>{data.split('\n').filter(line => line.trim() && line.trim().length > 0).map((line, index) => {
        return (<View className='line' key={`text-example-detail-${index}`} >
          <View onClick={() => {
            this.handleClickLink(index)
          }}
          >
            {this.renderFindAndHighlight(line, index)}
          </View>

        </View>)
      })}</View>}

      {showModal && this.renderModal()}
    </View>)
  }
}

