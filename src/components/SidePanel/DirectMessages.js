import React from 'react';
import firebase from '../../firebase';
import { connect } from 'react-redux';
import { setCurrentChannel, setPrivateChannel } from '../../actions';
import { Menu, Icon } from 'semantic-ui-react';

class DirectMessages extends React.Component {
  state = {
    user: this.props.currentUser,
    users: [],
    usersRef: firebase.database().ref('users'),
    connectedRef: firebase.database().ref('.info/connected'),
    presenceRef: firebase.database().ref('presence')
  }

  componentDidMount() {
    const { user } = this.state;

    if (user) this.addListeners(user.uid);
  }

  addListeners = uid => {
    const loadedUsers = [];
    const { usersRef, connectedRef, presenceRef } = this.state;

    usersRef.on('child_added', snap => {
      if (uid !== snap.key) {
        const user = snap.val();

        user['uid'] = snap.key;
        user['status'] = 'offline';
        loadedUsers.push(user);

        this.setState({ users: loadedUsers });
      }
    });

    connectedRef.on('value', snap => {
      if (snap.val() === true) {
        const ref = presenceRef.child(uid);

        ref.set(true);
        ref.onDisconnect().remove(err => {
          if (err !== null) console.error(err);
        }) ;
      }
    });

    presenceRef.on('child_added', snap => {
      if (uid !== snap.key) this.addStatusToUser(snap.key);
    });

    presenceRef.on('child_removed', snap => {
      if (uid !== snap.key) this.addStatusToUser(snap.key, false);
    });
  }

  addStatusToUser = (userId, connected = true) => {
    const { users } = this.state;

    const updatedUsers = users.reduce((acc, user) => {
      if (user.uid === userId) {
        user['status'] = `${connected ? 'online' : 'offline'}`;
      }

      return acc.concat(user)
    }, []);

    this.setState({ users: updatedUsers });
  }

  isUserOnline = user => user.status === 'online';

  changeChannel = user => {
    const { setCurrentChannel, setPrivateChannel } = this.props;
    const channelId = this.getChannelId(user.uid);
    const channelData = {
      id: channelId,
      name: user.name
    }

    setCurrentChannel(channelData);
    setPrivateChannel(true);
  }

  getChannelId = userId => {
    const { user } = this.state;
    const currentUserId = user.uid;

    return userId < currentUserId ? 
      `${userId}/${currentUserId}` : `${currentUserId}/${userId}`;
  }
 
  render() {
    const { users } = this.state;
    
    return(
      <Menu.Menu className="menu">
        <Menu.Item>
          <span>
            <Icon name="mail" /> DIRECT MESSAGES
          </span>{' '}
          ({ users.length })
        </Menu.Item>
        {users.map(user => (
          <Menu.Item
            key={user.id}
            onClick={() => this.changeChannel(user)}
            style={{ opacity: 0.7, fontStyle: 'italic'}}
          >
            <Icon name="circle" color={this.isUserOnline(user) ? 'green' : 'red'} />
            @ {user.name}
          </Menu.Item>
        ))}
      </Menu.Menu>
    );
  }
}

export default connect(null, { setCurrentChannel, setPrivateChannel })(DirectMessages);