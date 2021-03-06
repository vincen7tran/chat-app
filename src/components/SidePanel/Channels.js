import React from 'react';
import firebase from '../../firebase';
import { Menu, Icon, Modal, Form, Input, Button, Label } from 'semantic-ui-react';
import { connect } from 'react-redux'
import { setCurrentChannel, setPrivateChannel } from '../../actions';

class Channels extends React.Component {
  state = {
    channels: [],
    activeChannel: '',
    channel: null,
    modal: false,
    channelName: '',
    channelDetails: '',
    channelsRef: firebase.database().ref('channels'),
    messagesRef: firebase.database().ref('messages'),
    notifications: [],
    user: this.props.currentUser,
    firstLoad: true
  }

  componentDidMount() {
    this.addListeners();
  }

  componentWillUnmount() {
    this.removeListeners();
  }

  addListeners = () => {
    const loadedChannels = [];
    const { channelsRef } = this.state;

    channelsRef.on('child_added', snap => {
      loadedChannels.push(snap.val());
      this.setState({ channels: loadedChannels }, () => this.setFirstChannel());
      this.addNotificationListener(snap.key);
    });
  }

  addNotificationListener = channelId => {
    const { messagesRef, notifications } = this.state;

    messagesRef.child(channelId).on('value', snap => {
      const { channel } = this.state;

      if (channel) {
        this.handleNotifcations(channelId, channel.id, notifications, snap);
      }
    });
  }

  handleNotifcations = (channelId, currentChannelId, notifications, snap) => {
    let lastTotal = 0;

    let idx = notifications.findIndex(notification => notification.id === channelId);

    if (idx !== -1) {
      if (channelId !== currentChannelId) {
        lastTotal = notifications[idx].total;

        if (snap.numChildren() - lastTotal > 0) {
          notifications[idx].count = snap.numChildren() - lastTotal;
        }
      }

      notifications[idx].lastKnownTotal = snap.numChildren();
    } else {
       notifications.push({
        id: channelId,
        total: snap.numChildren(),
        lastKnownTotal: snap.numChildren(),
        count: 0
      });
    }

    this.setState({ notifications });
  }

  removeListeners = () => {
    const { channelsRef } = this.state;

    channelsRef.off();
  }

  setFirstChannel = () => {
    const { firstLoad, channels } = this.state;
    const { setCurrentChannel } = this.props;

    if (firstLoad && channels.length > 0) {
      setCurrentChannel(channels[0]);
      this.setActiveChannel(channels[0]);
      this.setState({ channel: channels[0] })
    }

    this.setState({ firstLoad: false });
  }

  addChannel = () => {
    const { channelsRef, channelName, channelDetails } = this.state;
    const { displayName, photoURL } = this.state.user;

    const key = channelsRef.push().key;

    const newChannel = {
      id: key,
      name: channelName,
      details: channelDetails,
      createdBy: {
        name: displayName,
        avatar: photoURL
      }
    };

    channelsRef
      .child(key)
      .update(newChannel)
      .then(() => {
        this.setState({ channelName: '', channelDetails: '' });
        this.closeModal();
        console.log('channel added');
      })
      .catch(err => {
        console.error(err);
      });
  }

  handleSubmit = e => {
    e.preventDefault();

    if (this.isFormValid()) {
      this.addChannel();
    }
  }

  changeChannel = channel => {
    const { setCurrentChannel, setPrivateChannel } = this.props;

    this.setActiveChannel(channel);
    setCurrentChannel(channel);
    this.clearNotifications();
    setPrivateChannel(false);

    this.setState({ channel });
  }

  clearNotifications = () => {
    const { notifications } = this.state;

    let idx = notifications.findIndex(notification => {
      const { activeChannel } = this.state;
      console.log(notification.id, activeChannel);
      return notification.id === activeChannel;
    });

    console.log('clear', idx);
    if (idx !== -1) {
      const updatedNotifications = [...notifications];

      updatedNotifications[idx].total = notifications[idx].lastKnownTotal;
      updatedNotifications[idx].count = 0;

      this.setState({ notifications: updatedNotifications });
    }
  }

  setActiveChannel = channel => {
    this.setState({ activeChannel: channel.id });
  }

  getNotificationCount = channel => {
    const { notifications } = this.state;
    let count = 0;

    notifications.forEach(notification => {
      if (notification.id === channel.id) count = notification.count;
    });

    if (count > 0) return count;
  }

  displayChannels = () => {
    const { channels, activeChannel } = this.state;

    return channels.length > 0 && channels.map(channel => {
      const { id, name } = channel;

      return (
        <Menu.Item
          key={id}
          onClick={() => this.changeChannel(channel)}
          name={name}
          style={{ opacity: 0.7 }}
          active={channel.id === activeChannel}
        >
          {this.getNotificationCount(channel) && (
            <Label color="red">{this.getNotificationCount(channel)}</Label>
          )}
          # {name}
        </Menu.Item>
      )
    });
  }

  isFormValid = () => {
    const { channelName, channelDetails } = this.state;

    return channelName && channelDetails;
  }

  handleChange = e => {
    const { name, value } = e.target;

    this.setState({  [name]: value });
  }

  closeModal = () => this.setState({ modal: false });

  openModal = () => this.setState({  modal: true });

  render() {
    const { channels, modal } = this.state;

    return (
      <React.Fragment>
        <Menu.Menu className="menu">
          <Menu.Item>
            <span>
              <Icon name="exchange" /> CHANNELS
            </span>{' '}
            ({ channels.length }) <Icon name="add" onClick={this.openModal} />
          </Menu.Item>
          {/* Channels */}
          {this.displayChannels()}
        </Menu.Menu>

        {/* Add Channel Modal*/}
        <Modal basic open={modal} onClose={this.closeModal}>
          <Modal.Header>Add a Channel</Modal.Header>
          <Modal.Content>
            <Form onSubmit={this.handleSubmit}>
              <Form.Field>
                <Input 
                  fluid
                  label="Name of Channel"
                  name="channelName"
                  onChange={this.handleChange}
                />
              </Form.Field>

              <Form.Field>
                <Input 
                  fluid
                  label="About the Channel"
                  name="channelDetails"
                  onChange={this.handleChange}
                />
              </Form.Field>
            </Form>

            <Modal.Actions>
              <Button color="green" inverted onClick={this.handleSubmit}>
                <Icon name="checkmark" /> Add
              </Button>
              <Button color="red" inverted onClick={this.closeModal}>
                <Icon name="remove" /> Cancel
              </Button>
            </Modal.Actions>
          </Modal.Content>
        </Modal>
      </React.Fragment>
    );
  }
}

export default connect(null, { setCurrentChannel, setPrivateChannel })(Channels);