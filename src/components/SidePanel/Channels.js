import React from 'react';
import firebase from '../../firebase';
import { Menu, Icon, Modal, Form, Input, Button} from 'semantic-ui-react';
import { connect } from 'react-redux'
import { setCurrentChannel } from '../../actions';

class Channels extends React.Component {
  state = {
    channels: [],
    modal: false,
    channelName: '',
    channelDetails: '',
    channelsRef: firebase.database().ref('channels'),
    user: this.props.currentUser,
    firstLoad: true
  }

  componentDidMount() {
    this.addListeners();
  }

  addListeners = () => {
    const loadedChannels = [];
    const { channelsRef } = this.state;

    channelsRef.on('child_added', snap => {
      loadedChannels.push(snap.val());
      this.setState({ channels: loadedChannels }, () => this.setFirstChannel());
    });
  }

  setFirstChannel = () => {
    const { firstLoad, channels } = this.state;
    const { setCurrentChannel } = this.props;

    if (firstLoad && channels.length > 0) setCurrentChannel(channels[0]);

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
    const { setCurrentChannel } = this.props;

    setCurrentChannel(channel);
  }

  displayChannels = () => {
    const { channels } = this.state;

    return channels.length > 0 && channels.map(channel => {
      const { id, name } = channel;

      return (
        <Menu.Item
          key={id}
          onClick={() => this.changeChannel(channel)}
          name={name}
          style={{ opacity: 0.7 }}
        >
          #{name}
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
        <Menu.Menu style={{ paddingBottom: '2em' }}>
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

export default connect(null, { setCurrentChannel })(Channels);