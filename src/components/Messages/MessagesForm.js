import React from 'react';
import firebase from '../../firebase';
import { Segment, Button, Input } from 'semantic-ui-react';

class MessagesForm extends React.Component {
  state = {
    message: '',
    loading: false,
    channel: this.props.currentChannel,
    user: this.props.currentUser,
    errors: []
  }

  handleChange = e => {
    const { name, value } = e.target;

    this.setState({ [name]: value });
  }

  createMessage = () => {
    const { message, user } = this.state;
    const { uid, displayName, photoURL } = user;

    const newMessage = {
      content: message,
      timestamp: firebase.database.ServerValue.TIMESTAMP,
      user: {
        id: uid,
        name: displayName,
        avatar: photoURL
      }
    };

    return newMessage;
  }

  sendMessage = () => {
    const { messagesRef } = this.props;
    const { message, channel } = this.state;

    if (message) {
      this.setState({ loading: true });
      messagesRef
        .child(channel.id)
        .push()
        .set(this.createMessage())
        .then(() => {
          this.setState({ loading: false, message: '', errors: [] });
        })
        .catch(err => {
          const { errors } = this.state;
          console.error(err);
          this.setState({
            loading: false,
            errors: [...errors, err]
          });
        });
    } else {
      const { errors } = this.state;
      console.log('empty message');
      this.setState({ errors: [...errors, { message: 'Add a message' }] });
    }
  }

  render() {
    const { errors } = this.state;

    return (
      <Segment className="message__form">
        <Input
          fluid
          name="message"
          style={{ marginBottom: '0.7em' }}
          label={<Button icon="add" />}
          labelPosition="left"
          placeholder="Write your message"
          onChange={this.handleChange}
          className={errors.some(error => error.message.includes('message')) ? 'error' : ''}
        />
        <Button.Group icon widths="2">
          <Button 
            color="orange"
            content="Add Reply"
            labelPosition="left"
            icon="edit"
            onClick={this.sendMessage}
          />

          <Button
            color="teal"
            content="Upload Media"
            labelPosition="right"
            icon="cloud upload"
          />
        </Button.Group>
      </Segment>
    );
  }
}

export default MessagesForm;