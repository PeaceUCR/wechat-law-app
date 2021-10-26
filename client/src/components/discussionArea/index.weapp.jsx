import Taro, { useState, useEffect } from '@tarojs/taro'
import {View} from "@tarojs/components";
import {AtAvatar, AtActivityIndicator} from "taro-ui";
import {getUserOpenId} from '../../util/login';
import './index.scss'
import moment from "moment";

const DiscussionArea = (props) => {
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const {topicId, isSent, handleCommentsLoaded} = props;

  const fetchData = () => {
    setIsLoading(true)
    Taro.cloud.callFunction({
      name: 'getComments',
      data: {
        topicId,
        page: '',
        type: ''
      },
      complete: (r) => {
        if (r && r.errMsg !== 'cloud.callFunction:ok') {
          Taro.showToast({
            title: `获取讨论数据失败:${r.result.errMsg}`,
            icon: 'none',
            duration: 3000
          })
          setIsLoading(false)
          return ;
        }
        console.log(r.result)
        const currentOpenId = getUserOpenId()
        const validComments = r.result.filter(item => {
          return (item.hasChecked !== false) || (currentOpenId === item.openId)
        })
        setComments(validComments)
        if (isSent) {
          handleCommentsLoaded()
        }
        setIsLoading(false)
      }
    })
  }

  // console.log(topicId)
  useEffect(()=> {
    if ((topicId && comments.length === 0) || isSent) {
      fetchData()

    }
  }, [topicId, isSent])

  return (<View className='discussion-area' >
    <View className='title'>
      讨论区
      {isLoading && <View className='loading-container'>
        <AtActivityIndicator mode='center' color='black' content='加载讨论区数据中...' size={42}></AtActivityIndicator>
      </View>}
    </View>
    {comments && comments.length === 0 && <View>暂无记录</View>}
    {comments && comments.length > 0 && <View>{
      comments.map((comment, index) => {
        return (<View key={`comment-${index}`} className='comment-line' id={`comment-${index}`}>
          <View className='comment-avatar'>
            <AtAvatar circle size='small' image={comment.user.avatarUrl}></AtAvatar>
          </View>
          <View className='comment-text'>
            <View className='comment-name'>{comment.user.nickName}</View>
            <View className='comment-content'>{comment.content}</View>
            <View className='comment-time'>{moment(comment.time).format('YYYY-MM-DD HH:MM')}</View>
          </View>
        </View>)
      })
    }</View>}
  </View>)
}

export default DiscussionArea;
