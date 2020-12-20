import Taro, { Component, setStorageSync, getStorageSync } from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import {AtActivityIndicator, AtIcon} from "taro-ui";
import DataPopup from '../../components/dataPopup/index.weapp'
import { db } from '../../util/db'
import './index.scss'

const getTermNumber = (text) => {
  return text.substring(0, text.indexOf('条') + 1);
}

export default class TermDetail extends Component {

  state = {
    term: {},
    examples: [],
    courtExamples: [],
    explanations: [],
    complements: [],
    courtComplementExamples: [],
    isProcuratorateExampleLoading: true,
    isCourtExampleLoading: true,
    isExplanationLoading: true,
    isComplementLoading: true,
    isCollected: false
  }

  config = {
    navigationBarTitleText: '刑法条文详情'
  }

  onShareAppMessage() {
    return {
      path: 'pages/index/index'
    };
  }

  componentWillMount () {
    const { id } = this.$router.params;
    const that = this;
    db.collection('terms').where({_id: id}).get({
      success: (res) => {
        const term = res.data[0];
        that.setState({term});
        db.collection('procuratorate-examples').where({terms: db.RegExp({
            regexp: '.*' + getTermNumber(term.text),
            options: 'i',
          })}).get({
          success: (res) => {
            that.setState({examples: res.data, isProcuratorateExampleLoading: false});
          }
        });

        db.collection('court-examples').where({criminalLaw: db.RegExp({
            regexp: '.*' + getTermNumber(term.text),
            options: 'i',
          })}).get({
          success: (res) => {
            that.setState({courtExamples: res.data, isCourtExampleLoading: false});
          }
        });

        db.collection('explanation').where({criminalLaw: db.RegExp({
            regexp: '.*' + getTermNumber(term.text),
            options: 'i',
          })}).get({
          success: (res) => {
            that.setState({explanations: res.data, isExplanationLoading: false});
          }
        });

        db.collection('complement').where({criminalLaw: db.RegExp({
            regexp: '.*' + getTermNumber(term.text),
            options: 'i',
          })}).get({
          success: (res) => {

            if (res.data.length > 0) {
              const courtComplementExamples = res.data.filter(item => item.title.indexOf('案例') !== -1)
              if(courtComplementExamples.length > 0) {
                const complements = res.data.filter(item => item.title.indexOf('案例') === -1)
                that.setState({complements, courtComplementExamples, isComplementLoading: false});

              } else {
                that.setState({complements: res.data, isComplementLoading: false});
              }
            } else {
              that.setState({isComplementLoading: false})
            }

          }
        })
      }
    })

    let collection = getStorageSync('collection');
    collection = collection ? collection : {};
    that.setState({
      isCollected: collection[id] === true
    })
  }

  componentDidMount () {
  }

  componentWillUnmount () { }

  componentDidShow () { }

  componentDidHide () { }

  renderSectionAndChapter = () => {
    const {term} = this.state;
    const {part, chapter, section} = term;
    return (
      <View className='header'>
        <View>{part}</View>
        <View>{chapter}</View>
        <View>{section}</View>
      </View>
    )
  }

  renderExample = () => {
    const {examples, term} = this.state;
    const num = getTermNumber(term.text).replace('第', '').replace('条', '');
    return (<View>
      {examples.map(example => (<View className='example' key={`example-${example._id}`}>
        <DataPopup data={example} type='procuratorate' num={num} />
      </View>))}
    </View>)
  }

  renderCourtExample = () => {
    const {courtExamples, term} = this.state;
    const num = getTermNumber(term.text).replace('第', '').replace('条', '');
    return (<View>
      {courtExamples.map(example => (<View className='example' key={`court-example-${example._id}`}>
        <DataPopup data={example} type='court' num={num} />
      </View>))}
    </View>)
  }

  renderExplanation = () => {
    const {explanations, term} = this.state;
    const num = getTermNumber(term.text).replace('第', '').replace('条', '');
    return (<View>
      {explanations.map(explanation => (<View className='example' key={`explanation-${explanation._id}`}>
        <DataPopup data={explanation} type='explanation' num={num} />
      </View>))}
    </View>)
  }

  renderComplement = () => {
    const { complements, term } = this.state;
    const num = getTermNumber(term.text).replace('第', '').replace('条', '');
    return (<View>
      {complements.map(complement => (<View className='example' key={`complement-${complement._id}`}>
        <DataPopup data={complement} type='complement' num={num} />
      </View>))}
    </View>)
  }

  renderCourtComplementExamples = () => {
    const { courtComplementExamples, term } = this.state;
    const num = getTermNumber(term.text).replace('第', '').replace('条', '');
    return (<View>
      {courtComplementExamples.map(complement => (<View className='example' key={`complement-${complement._id}`}>
        <DataPopup data={complement} type='complement' num={num} />
      </View>))}
    </View>)
  }

  handleCollect = () => {
    const { isCollected, term } = this.state;
    const {_id} = term
    let collection = getStorageSync('collection');
    collection = collection ? collection : {};
    if (isCollected) {
      collection[_id] = false
      setStorageSync('collection', collection)
    } else {
      collection[_id] = true
      setStorageSync('collection', collection)
    }
    Taro.showToast({
      title: isCollected ? '收藏取消' : '收藏成功',
      icon: 'none',
      duration: 1000
    })
    this.setState({isCollected : !isCollected})

  };

  render () {
    const {term, examples, explanations, courtExamples, complements, courtComplementExamples, isProcuratorateExampleLoading, isCourtExampleLoading, isExplanationLoading, isComplementLoading, isCollected} = this.state;
    return (
      <View className='term-detail-page'>
          <View className='main section'>
            <View>
              {this.renderSectionAndChapter()}
            </View>
            <View>
              {term.text}
            </View>
          </View>
          <View className='examples section'>
            <Text className='section-title'>相关法定解释、规定和指导意见：{complements.length ===0 && explanations.length ===0 ? '暂无' : ''}</Text>
            <View>
              {explanations.length > 0 && this.renderExplanation()}
              {complements.length > 0 && this.renderComplement()}
            </View>
          </View>
          <View className='examples section'>
            <Text className='section-title'>相关检察院案例：{examples.length ===0 ? '暂无' : ''}</Text>
            <View>
              {examples.length > 0 && this.renderExample()}
            </View>
          </View>
          <View className='examples section'>
            <Text className='section-title'>相关法院案例：{courtExamples.length ===0 && courtComplementExamples.length ===0 ? '暂无' : ''}</Text>
            <View>
              {courtExamples.length > 0 && this.renderCourtExample()}
              {courtComplementExamples.length > 0 && this.renderCourtComplementExamples()}
            </View>
          </View>
        {(isProcuratorateExampleLoading || isCourtExampleLoading || isExplanationLoading || isComplementLoading) && <View className='loading-container'>
          <AtActivityIndicator mode='center' color='black' content='加载中...' size={62}></AtActivityIndicator>
        </View>}
        <View className='favorite-container' onClick={this.handleCollect} >
          <AtIcon value={isCollected ? 'star-2' : 'star'} size='32' color={isCollected ? '#ffcc00' : 'rgba(0, 0, 0, 0.6)'}></AtIcon>
        </View>
      </View>
    )
  }
}
