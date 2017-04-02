/* eslint-disable */
import React from 'react';
import { connect } from 'react-redux';
import { Route, NavLink } from 'react-router-dom';
import { connectScreenSize } from 'react-screen-size';
import { mapScreenSizeToProps } from '../../Navbar';
import axios from 'axios';
import { List, Set } from 'immutable';
import Modal from './ChatModal';
import EmojiInput from './EmojiInput';
import ChatMessages from './Chat';
import {
  addMessage,
  saveEdit,
  likeMessage,
  deleteMessage,
  broadcastEdit,
  fetchPrivateChat,
  clearNotifications,
  initiatePrivateChat
} from '../../../actions/chat';

class ChatController extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      input: '',
      messages: [],
      edit: null,
      editText: null,
      modal: false,
      privateChannels: false
    };
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.screen.isDesktop) {
      document.body.style.backgroundImage = "url('/images/fcc-banner.png')";
    } else {
      document.body.style.backgroundImage = null;
    }
  }
  componentDidMount() {
    if (this.props.screen.isDesktop) document.body.style.backgroundImage = "url('/images/fcc-banner.png')";
    this.chatContainer = document.getElementById('messageContainer');
    this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
  }
  componentDidUpdate(prevProps) {
    if (this.props.chat.size > prevProps.chat.size) {
      this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
    }
  }
  componentWillUnmount() {
    document.body.style.backgroundImage = null;
  }
  submitMessage = (text) => {
    const { conversant } = this.props;
    this.setState({ text: '' });
    this.props.addMessage({ author: this.props.user, text, conversant });
  }
  setEdit = (id) => {
    if (this.state.editText !== '') {
      const { edit, editText } = this.state;
      const { user, conversant } = this.props;
      if (this.state.edit) this.props.broadcastEdit(edit, editText, conversant, user.username);
      this.setState({
        edit: id,
        editText: this.props.chat.find(m => m.get('id') === id).get('text')
      });
    };
  }
  saveEdit = (e) => {
    const editText = e.target.value;
    this.setState({ editText });
    if (editText) {
      this.props.saveEdit(this.state.edit, this.state.editText, this.props.conversant);
    }
  }
  finishEdit = (e) => {
    e.preventDefault();
    if (this.state.editText) {
      const { edit, editText } = this.state;
      const { user, conversant } = this.props;
      this.props.broadcastEdit(edit, editText, conversant, user.username);
      this.setState({
        edit: null,
        editText: null
      });
    };
  }
  deleteMessage = (id) => {
    this.setState({
      edit: null,
      editText: null
    });
    this.props.deleteMessage(id, this.props.conversant, this.props.user.username);
  }
  toggleModal = () => {
    this.setState({
      modal: !this.state.modal
    });
  }
  togglePrivateChannels = () => {
    this.setState({
      privateChannels: !this.state.privateChannels
    });
  }
  initiatePrivateChat = (reciepient, notifcations) => {
    if (!this.props.privateChat.has(reciepient)) {
      this.props.initiatePrivateChat(reciepient);
    } else if (notifcations) {
      this.props.clearNotifications({
        author: this.props.user.username,
        reciepient
      });
    }
    this.props.history.push(`chat/${reciepient}`);
  }
  render() {

    const { conversant, privateChat, totalNotifications, screen } = this.props;

    const privateChannels = (
      <div id="privateChatChannels" className='privateChatChannelsBox'>
        <h3 className='privateChannelsTitle'>Private Chat Channels:</h3>
        {privateChat.size > 0 ? privateChat.keySeq().map(username => {
          const notifications = privateChat.getIn([username, 'notifications']);
          return (
            <div
              key={username}
              className='privateChannel'
              onClick={this.initiatePrivateChat.bind(this, username, notifications)}>
              <img src={privateChat.getIn([username, 'history'])
                .find(m => m.get('author') === username).get('avatar')} alt="User Avatar"/>
              {notifications > 0 &&
                <span className="notifications privateNotifications">{notifications}</span>}
              <span className="privateUsername">{username}</span>
            </div>
          );
        }) :
          <span>
            <b>No Private Chats yet!</b><br/>
            Click another user's name to start a chat with them.
          </span>}
          <i className="remove icon" id="closePrivateChat" onClick={this.togglePrivateChannels}></i>
      </div>
    );

    return (
      <div className="ui container segment" id="chat">
        <Modal size="large" open={this.state.modal} close={this.toggleModal} />
        <div>
          <div className="ui comments">
            <h2 className="ui dividing header">

            {conversant ?

              <span>
                <img src={this.props.conversantAvatar} className='privateAvatar' alt={`${conversant}'s Avatar'`} />
                Private Chat with <span className='conversant'> {conversant} </span>
                {screen.isDesktop &&
                <NavLink to='/dashboard/chat' className='linkHome'>
                  <i className="fa fa-arrow-left" aria-hidden="true"></i> <span>Back to Mess Hall</span>
                </NavLink>}
              </span>

              :

              'The Mess Hall is a place to connect with other members'

            }

            </h2>
            {!conversant && <div>
              {totalNotifications ? <div onClick={this.togglePrivateChannels} id="privateChatIconWrapper">
                <i className="comments teal icon" id="privateChatIcon"></i>
                <span className="notifications totalNotifications">{totalNotifications}</span>
              </div> : <div onClick={this.togglePrivateChannels}>
                <i className="comments teal icon" id="privateChatIcon"></i>
              </div>}
              <i onClick={this.toggleModal} className="info teal circle icon" id="infoIcon"></i>
            </div>}
            {this.state.privateChannels && privateChannels}
            <div id='messageContainer'>
              <ChatMessages
                user={this.props.user}
                chat={this.props.chat}
                edit={this.state.edit}
                setEdit={this.setEdit}
                saveEdit={this.saveEdit}
                finishEdit={this.finishEdit}
                mentors={this.props.mentors}
                like={this.props.likeMessage}
                editText={this.state.editText}
                reciepient={this.props.conversant}
                deleteMessage={this.deleteMessage}
                onlineStatus={this.props.onlineStatus}
                initiatePrivateChat={this.initiatePrivateChat}
                conversantAvatar={this.props.conversantAvatar}
                path={conversant ? null : this.props.match.url} />
            </div>
          </div>
        </div>
        <EmojiInput
          screen={screen}
          submit={this.submitMessage}
          placeholder={
            (this.props.chat.size === 0 ?
              "Start" : "Join" ) + " the conversation here..."} />
      </div>
    );
  }
};

ChatController.propTypes = {
  user: React.PropTypes.object.isRequired,
  chat: React.PropTypes.object.isRequired,
  addMessage: React.PropTypes.func.isRequired,
  saveEdit: React.PropTypes.func.isRequired,
  likeMessage: React.PropTypes.func.isRequired,
  deleteMessage: React.PropTypes.func.isRequired,
  broadcastEdit: React.PropTypes.func.isRequired,
  clearNotifications: React.PropTypes.func.isRequired,
  mentors: React.PropTypes.object.isRequired,
  onlineStatus: React.PropTypes.object.isRequired
};

export const findMentors = (community) => {
  return Set(community.map(user => {
    if (user.mentorship.isMentor) return user.username;
  }));
};

const mapStateToProps = ({ user, chat, privateChat, community, onlineStatus }, props) => {
  const { username } = props.match.params;
  if (username) {
    return {
      user,
      onlineStatus,
      privateChat: [],
      conversant: username,
      mentors: findMentors(community),
      chat: privateChat.getIn([username, 'history']),
      conversantAvatar: community.find(u => u.username === username).personal.avatarUrl
    }
  } else {
    return {
      user,
      chat,
      onlineStatus,
      conversant: null,
      conversantAvatar: null,
      mentors: findMentors(community),
      privateChat: privateChat,
      totalNotifications: privateChat.reduce((t,c) => t + c.get('notifications'), 0),
      privateChatSize: privateChat.size
    }
  }
};

const dispatch = {
  saveEdit,
  addMessage,
  likeMessage,
  deleteMessage,
  broadcastEdit,
  fetchPrivateChat,
  clearNotifications,
  initiatePrivateChat
};

export default connectScreenSize(mapScreenSizeToProps)(
  connect(mapStateToProps, dispatch)(ChatController));