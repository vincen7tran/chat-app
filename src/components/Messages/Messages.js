import React from 'react';
import firebase from '../../firebase';
import { Segment, Comment } from 'semantic-ui-react';
import MessagesHeader from './MessagesHeader';
import MessageForm from './MessagesForm';
import Message from './Message';

class Messages extends React.Component {
  state = {
    messagesRef: firebase.database().ref('messages'),
    channel: this.props.currentChannel,
    user: this.props.currentUser,
    messages: [],
    messagesLoading: true
  }

  componentDidMount() {
    const { channel, user } = this.state;

    if (channel && user) {
      this.addListeners(channel.id);
    }
  }

  addListeners = channelId => {
    this.addMessageListener(channelId);
  }

  addMessageListener = channelId => {
    const loadedMessages = [];
    const { messagesRef } = this.state;

    messagesRef.child(channelId).on('child_added', snap => {
      loadedMessages.push(snap.val());

      this.setState({ messages: loadedMessages, messagesLoading: false });
    });
  }

  displayMessages = () => {
    const { messages } = this.state;
    console.log('messages', messages);
    return messages.length > 0 && messages.map(message => {
      const { timestamp } = message;
      const { user } = this.state;

      return (
        <Message 
          key={timestamp}
          message={message}
          user={user}
        />
      );
    });
  }

  render() {
    const { messagesRef, channel, user} = this.state;

    return (
      <React.Fragment>
        <MessagesHeader />

        <Segment>
          <Comment.Group className="messages">
            {this.displayMessages()}
          </Comment.Group>
        </Segment>

        <MessageForm messagesRef={messagesRef} currentChannel={channel} currentUser={user} />
      </React.Fragment>
    );
  }
}

export default Messages;