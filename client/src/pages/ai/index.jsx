import Taro, { Component } from '@tarojs/taro'
import { View, Text, Image } from '@tarojs/components'
import { AtInput, AtButton, AtBadge, AtIcon } from 'taro-ui'
import {addScore, aiRecordClick} from "../../util/userCollection";
import 'taro-ui/dist/style/index.scss'
import './index.scss'
import Fuse from 'fuse.js';
import {
  allCrimes,
  avatarUrl,
  civilLawRegulationIdMap,
  getLawItemFromCrime,
  lawMap,
  litigationLawIdMap
} from "../../util/util";
import RenderLabel from "../../components/renderLabel/index.weapp";

const REFINED_CHATS = [
  {
    q: '交通肇事后未逃离事故现场，默许他人顶包的行为是否构成逃逸？',
    a: '交通肇事的逃逸行为，通常情况下表现为“逃跑”，但其并不是一个事实性的空间概念，而是一个规范性的概念，其本质是逃避法律责任追究。 \n\n' +
      '- 从体系解释角度分析，结合我国刑法关于“逃税罪”“逃避追缴欠税罪”“逃汇罪”等相关规定，可以看到对我国刑法中的“逃”字可以有三种理解方式：一种是空间上的含义，即“逃跑”，例如“叛逃罪”“逃离部队罪”等；另一种是规范论上的含义，即“逃避”，例如“逃避商检罪”“逃税罪”等；还有一种就是兼具前两种含义的理解，例如“脱逃罪”，即表示依法被关押的罪犯、被告人、犯罪嫌疑人从公检法等机关控制下“跑”出来，同时也表示行为人对刑事责任的逃避。\n\n' +
      '- 从目的解释角度分析，如上所说，刑法规定对交通肇事逃逸升格法定刑，主要是为防止被告人逃避法律追究，降低司法成本。而本案中被告人在事故发生时虽然没有离开现场，但同样否认自己的肇事者身份，并默许他人顶包，逃避法律追究，增加了司法成本。如果对此类情形不以肇事逃逸论处，甚至会起到纵容肇事车主案发后不予积极配合交警调查的负面效应，违背立法目的。\n\n' +
      '- 综上，对于交通肇事逃逸行为的认定，通常情况下表现为逃离事故现场。但根据体系解释和目的解释可以得出，此处的“逃逸”不应作为一个事实性的空间概念，而应该视为规范性的概念，其本质是逃避法律责任。据此，除了逃离事故现场外，“非典型”逃逸行为还应包含下列情形：行为人在事故中受伤被送往医院治疗，后擅自离开医院；行为人将被害人送到医院后再从医院逃跑；行为人在事故现场或医院但隐瞒自己的肇事者身份；行为人藏匿在事故现场附近；行为人让他人顶包等情形。',
    links: [{
      title: '李某政交通肇事案——交通肇事后找人顶包但本人未离开现场的，构成“逃逸”',
      url: '/pages/exampleDetail/index?type=example&id=a14c5bc667d9b74a001088fd38402e00'
    },{
      title: '金某交通肇事、危险驾驶案——交通肇事后指使他人顶包的，属于肇事后逃逸',
      url: '/pages/exampleDetail/index?type=example&id=1b5dc65c67dabc6c0034a80d0c4d75f2'
    }]
  },
  {
    q: '滥伐林木',
    a: '123',
    links: [{
      title: '伊某滥伐林木案--“补植复绿”在环境资源刑事案件中的运用',
      url: '/pages/exampleDetail/index?type=example&id=c9e0aec667dabacb005e8e0117a67d01'
    },{
      title: '陈某滥伐林木案--自愿承担碳汇赔偿弥补生态损害情节的处理',
      url: '/pages/exampleDetail/index?type=example&id=c9e0aec667dabacb005e8e022b4300e2'
    }]
  },
]

const checkSimilarRefinedChat = (input) => {
  const questions = REFINED_CHATS.map(c => c.q);
  const fuse = new Fuse(questions, { includeScore: true, threshold: 0.4 });
  const results = fuse.search(input);
  if (results && results.length > 0) {
    const matched = results[0].item;
    return REFINED_CHATS.find(c => c.q === matched);
  }
  return undefined;
}
function getMostRelevantString(target) {
  let finalResult = {};
  const fuse = new Fuse(allCrimes, { includeScore: true, threshold: 0.4 });
  fuse.search(target).slice(0, 3).forEach(result => {
    const obj = getLawItemFromCrime(result.item)
    finalResult = {
      ...finalResult,
      ...obj
    }
  });
  return finalResult;
}

class ChatbotPage extends Component {

  config = {
    navigationBarTitleText: '搜法AI小助理'
  };

  onShareAppMessage() {
    return {
      path: `pages/ai/index`
    };
  }
  constructor(props) {
    super(props)
    // Define initial state
    this.state = {
      messages: [],      // List of chat messages
      input: '滥伐林木', // User's input text
      isStreaming: false, // Streaming flag for bot's response
      streamingReasoning: '',
      streamingMessage: '',
      version: '',
      enabled: false
    }
    // Instance variable to accumulate bot response content
    this.chatbotContent = ''
  }

  componentWillMount () {
    Taro.setNavigationBarColor({
      frontColor: '#000000',
      backgroundColor: '#F4ECD8'
    });
  }
  componentDidMount () {
    const that = this;
    wx.getSystemInfo({
      success: function(res) {
        console.log('微信版本：', res.version);
        that.setState({ version: res.version, enabled: !!wx.cloud.extend.AI })
      }
    });

  }

  // Update input state
  handleInputChange = (value) => {
    this.setState({ input: value })
  }

  // Add the bot's message to the chat window
  addBotMessage = (content, sofaItemObj) => {
    console.log('sofaItemObj', sofaItemObj);
    const getKeysByValues = (obj, value) => {
      return Object.keys(obj).filter(key => value === obj[key])[0];
    }

    const keys = Object.values(sofaItemObj).sort((a, b) => a.length - b.length).map(v => getKeysByValues(sofaItemObj, v));

    if (keys && keys.length === 0) {
      console.log('keys', keys);

      const { messages } = this.state
      let lastMessg = messages.findLast(m => m.sofaItemKeys && m.sofaItemKeys.length > 0);
      if (lastMessg) {
        console.log('lastMessg', lastMessg);
        const botMessage = { id: Date.now() + 1, role: 'assistant', content, sofaItemObj: lastMessg.sofaItemObj, sofaItemKeys: lastMessg.sofaItemKeys }
        this.setState(prevState => ({
          messages: [...prevState.messages, botMessage]
        }));
      } else {
        const botMessage = { id: Date.now() + 1, role: 'assistant', content, sofaItemObj: {}, sofaItemKeys: [] }
        this.setState(prevState => ({
          messages: [...prevState.messages, botMessage]
        }));
      }
      return;
    }

    const botMessage = { id: Date.now() + 1, role: 'assistant', content, sofaItemObj: sofaItemObj, sofaItemKeys: keys }
    this.setState(prevState => ({
      messages: [...prevState.messages, botMessage]
    }))
  }

  handleRefined = (obj) => {
    console.log('matched', obj);
    const {q, a, links} = obj
    this.setState({ isStreaming: true });

    const that = this;
    setTimeout(() => {
      const interval = setInterval(() => {
        const index = that.state.streamingMessage.length;
        if (index === a.length - 1) {
          clearInterval(interval);
          const botMessage = { id: Date.now() + 1, role: 'assistant', content: a, sofaItemObj: {}, sofaItemKeys: [], links: links }
          this.setState({ isStreaming: false, input: '', streamingReasoning: '', streamingMessage: '' });
          this.setState(prevState => ({
            messages: [...prevState.messages, botMessage]
          }));
        } else {
          that.setState(prevState => ({
            ...prevState,
            streamingMessage: a.substring(0, index + 1)
          }))
        }

        Taro.pageScrollTo({
          selector: `#category-0`,
          duration: 40
        })
      }, 50);
    }, 5000)
    return;
  }
  // Handle sending the message
  handleSend = async () => {
    const { input, messages, version, isStreaming, enabled } = this.state
    if (!input.trim()) return
    if (isStreaming) return

    if (!enabled){
      return;
    }

    aiRecordClick(input.trim());

    // Append the user's message
    const userMessage = { id: Date.now(), role: 'user', content: input }
    console.log('getMostRelevantString', getMostRelevantString(input));
    this.setState({
      messages: [...messages, userMessage],
      input: ''
    })

    // TODO check
    const matchedResult = checkSimilarRefinedChat(input);
    if (matchedResult) {
      this.handleRefined(matchedResult);
      return;
    }

    // Call the bot API using wx.cloud.extend.AI.bot.sendMessage
    let res
    try {
      const records = messages.map(m => {
        return {
          role: m.role,
          content: m.content
        }
      })
      // // TODO search ONLY works for HTTP request!
      // res = await wx.cloud.extend.AI.bot.sendMessage({
      //   data: {
      //     botId: 'bot-dc1f297a',
      //     msg: input,
      //     history: records
      //   }
      // })
      const model = wx.cloud.extend.AI.createModel("deepseek");
      res = await model.streamText({
        data: {
          model: "deepseek-r1",
          messages: [
            ...records,
            {
              role: 'user',
              content: input
            }
          ]
        }
      });
    } catch (err) {
      Taro.showToast({
        title: `0获取数据失败: ${err}`,
        icon: 'none',
        duration: 3000
      })
      console.error('Error calling sendMessage:', err)
      return
    }

    // Reset bot content and indicate streaming has started
    this.chatbotContent = ''
    this.setState({ isStreaming: true })

    // Get the async iterator for the event stream
    const iterator = res.eventStream[Symbol.asyncIterator]()

    // Recursively process each event from the stream
    const processNext = () => {
      iterator.next().then(({ value, done }) => {
        // If done or if '[DONE]' is received, complete the stream
        if (done || (value && value.data === '[DONE]')) {
          console.log('processNext DONE')
          this.addBotMessage(this.chatbotContent.trimStart(), getMostRelevantString(input))
          this.setState({ isStreaming: false, input: '', streamingReasoning: '', streamingMessage: '' })
          return
        }
        try {
          const data = JSON.parse(value.data)
          // Log the reasoning chain if available
          const think = (data.choices[0].delta).reasoning_content
          if (think) {
            console.log('think',think)
            this.setState(prev => ({
              ...prev,
              streamingReasoning: prev.streamingReasoning + think.replace(/[#*]/g, '')
            }))
          }
          // Log and append the content
          const content = data.choices[0].delta.content
          if (content) {
            this.chatbotContent += content.replace(/[#*]/g, '')
            this.setState(prev => ({
              ...prev,
              streamingMessage: prev.streamingMessage + content.trimStart().replace(/[#*]/g, '')
            }))
          }
        } catch (err) {
          Taro.showToast({
            title: `1获取数据失败: ${err}`,
            icon: 'none',
            duration: 3000
          })
          console.error('Error processing event stream:', err)
        }
        processNext()
      }).catch(err => {
        Taro.showToast({
          title: `2获取数据失败: ${err}`,
          icon: 'none',
          duration: 3000
        })
        console.error('Iterator error:', err)
        this.setState({ isStreaming: false })
      })
    }
    processNext()
  }

  render() {
    const { messages, input, isStreaming, version, enabled, streamingReasoning, streamingMessage } = this.state
    return (
      <View className='chatbot-page'>
        {/*<View className='back' onClick={() => {*/}
        {/*  Taro.navigateTo({*/}
        {/*    url: '/pages/index/index'*/}
        {/*  })*/}
        {/*}}*/}
        {/*>*/}
        {/*  <AtBadge value='返回'>*/}
        {/*    <AtIcon value='arrow-left' size='40' color='#000'></AtIcon>*/}
        {/*  </AtBadge>*/}
        {/*</View>*/}
        <View className='chat-window'>
          {messages.map(message => (
            <View key={message.id} className={`message ${message.role ===  'user' ?  'user' : 'bot'}`}>
              <Text>{message.content}</Text>
              {message.sofaItemObj && <View className='sofa-title'>相关搜法内部资源</View>}
              {message.sofaItemObj && message.sofaItemKeys.map(key => (
                <RenderLabel key={key} label={message.sofaItemObj[key]} onClick={() => {
                  Taro.navigateTo({
                    url: `/pages/termDetail/index?id=${key}`,
                  })
                }}
                />
              ))}
              {message.links && message.links.map(link => (
                <RenderLabel key={link.title} label={link.title} onClick={() => {
                  Taro.navigateTo({
                    url: link.url,
                  })
                }}
                />
              ))}
            </View>
          ))}
          {isStreaming && (
            <View className='message thinking'>
              <Image src={avatarUrl} className='avatar' />
              <Text>{streamingReasoning ? streamingReasoning : '小助理思考中...'}</Text>
            </View>
          )}
          {isStreaming && streamingMessage && (
            <View className='message bot'>
              <Text>{streamingMessage}</Text>
            </View>
          )}
          <View id='category-0'></View>
        </View>
        <View className='footer'>
          <AtInput
            name='message'
            type='text'
            placeholder={enabled ? '我是搜法AI小助理, 有问题, 尽管问' : '微信版本过低，请升级微信至8.0.56+'}
            value={input}
            onChange={this.handleInputChange}
          />
          {enabled && <AtButton type='primary' onClick={this.handleSend}>
            发送
          </AtButton>}
          <Text className={enabled ? 'version' : 'version disabled'}>当前微信版本: {version}</Text>
        </View>
      </View>
    )
  }
}

export default ChatbotPage
