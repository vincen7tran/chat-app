import React from 'react';
import firebase from '../../firebase';
import { connect } from 'react-redux';
import { Grid, Header, Icon, Dropdown } from 'semantic-ui-react';

class UserPanel extends React.Component {
  state = {
    user: this.props.currentUser
  }

  componentWillReceiveProps(nextProps) {
    console.log(nextProps);
    this.setState({ user: nextProps.currentUser });
  }

  dropdownOptions = () => {
    const { displayName } = this.state.user;
 
    return [
      {
        key: 'user',
        text: <span>Signed in as <strong>{displayName}</strong></span>,
        disabled: true
      },
      {
        key: 'avatar',
        text: <span>Change Avatar</span>
      },
      {
        key: 'signout',
        text: <span onClick={this.handleSignout}>Sign Out</span>
      }
    ]
  }

  handleSignout = () => {
    firebase
      .auth()
      .signOut()
      .then(() => console.log('Signed out!'));
  }

  render() {
    const { displayName } = this.state.user;

    return (
      <Grid style={{ background: '#4c3c4c' }}>
        <Grid.Column>
          <Grid.Row style={{ padding: '1.2em', margin: 0 }}>
            {/* App Header */}
            <Header inverted floated="left" as="h2">
              <Icon name="code" />
              <Header.Content>DevChat</Header.Content>
            </Header>
          </Grid.Row>

          {/* User Dropdown */}
          <Header style={{ padding: '0.25em' }} as="h4" inverted>
            <Dropdown trigger={
              <span>{displayName}</span>
            } options={this.dropdownOptions()} />
          </Header> 
        </Grid.Column>
      </Grid>
    );
  }
}

const mapStateToProps = state => {
  const { currentUser } = state.user;

  return {
    currentUser
  };
};

export default connect(mapStateToProps)(UserPanel);