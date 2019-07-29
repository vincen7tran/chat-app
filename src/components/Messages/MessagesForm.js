import React from 'react';
import uuid from 'uuid';
import firebase from '../../firebase';
import { Segment, Button, Input } from 'semantic-ui-react';
import FileModal from './FileModal';

class MessagesForm extends React.Component {
  state = {
    message: '',
    loading: false,
    channel: this.props.currentChannel,
    user: this.props.currentUser,
    errors: [],
    modal: false,
    uploadState: '',
    uploadTask: null,
    storageRef: firebase.storage().ref(),
    percentUpload: 0
  }

  openModal = () => this.setState({ modal: true });

  closeModal = () => this.setState({ modal: false });

  handleChange = e => {
    const { name, value } = e.target;

    this.setState({ [name]: value });
  }

  createMessage = (fileUrl = null) => {
    const { message, user } = this.state;
    const { uid, displayName, photoURL } = user;

    const newMessage = {
      timestamp: firebase.database.ServerValue.TIMESTAMP,
      user: {
        id: uid,
        name: displayName,
        avatar: photoURL
      }
    };

    if (fileUrl) newMessage['image'] = fileUrl;
    else newMessage['content'] = message;

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

  uploadFile = (file, metadata) => {
    const { channel, storageRef, uploadTask }  = this.state;
    const { messagesRef } = this.props;
    const filePath = `chat/public/${uuid().jpg}`;

    this.setState({
      uploadState: 'uploading',
      uploadTask: storageRef.child(filePath).put(file, metadata)
    }, () => {
      const { uploadTask } = this.state;


      uploadTask.on('state_changed', snap => {
        const { bytesTransferred, totalBytes } = snap;
        const percentUpload = Math.round((bytesTransferred / totalBytes) * 100);

        this.setState({ percentUpload });
      }, err => {
        const { errors } = this.state;
        console.error(err);

        this.setState({ errors: [...errors, err], uploadState: 'error', uploadTask: null });
      }, () => {
        const { uploadTask } = this.state;

        uploadTask.snapshot.ref.getDownloadURL().then(downloadUrl => {
          this.sendFileMessage(downloadUrl, messagesRef, channel.id)
        })
        .catch(err => {
          const { errors } = this.state;
          console.error(err);
  
          this.setState({ errors: [...errors, err], uploadState: 'error', uploadTask: null });
        })
      });
    });
  }

  sendFileMessage = (fileUrl, ref, pathToUpload) => {
    ref.child(pathToUpload)
      .push()
      .set(this.createMessage(fileUrl))
      .then(() => {
        this.setState({ uploadState: 'done' })
      })
      .catch(err => {
        const { errors } = this.state;
        console.error(err);

        this.setState({ errors: [...errors, err]});
      })
  }

  render() {
    const { errors, message, loading, modal } = this.state;

    return (
      <Segment className="message__form">
        <Input
          fluid
          name="message"
          value={message}
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
            disabled={loading}
          />

          <Button
            color="teal"
            content="Upload Media"
            labelPosition="right"
            icon="cloud upload"
            onClick={this.openModal}
          />

          <FileModal
            modal={modal}
            closeModal={this.closeModal}
            uploadFile={this.uploadFile}
          />
        </Button.Group>
      </Segment>
    );
  }
}

export default MessagesForm;