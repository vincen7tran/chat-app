import React from 'react';
import firebase from '../../firebase';
import { Grid, Form, Segment, Button, Header, Message, Icon } from 'semantic-ui-react';
import { Link } from 'react-router-dom';

class Register extends React.Component {
  state = {
    username: '',
    email: '',
    password: '',
    passwordConfirmation: '',
    errors: []
  }

  isFormValid = () => {
    const errors = [];
    let error;

    if (this.isFormEmpty()) {
      error = { message: 'Fill in all fields' };

      this.setState({ errors: [...errors, error]});

      return false;
    } else if (!this.isPasswordValid()) {
      error = { message: 'Password is invalid'};

      this.setState({ errors: [...errors, error] });

      return false;
    }

    return true;
  }

  isFormEmpty = () => {
    const { username, email, password, passwordConfirmation } = this.state;

    return !username.length || !email.length || !password.length || !passwordConfirmation;
  }

  isPasswordValid = () => {
    const { password, passwordConfirmation } = this.state;

    if (password.length < 6 || passwordConfirmation < 6) return false;
    if (password !== passwordConfirmation) return false;

    return true;
  }

  displayErrors = () => {
    const { errors } = this.state;
    
    return errors.map((error, i) => {
      return <p key={i}>{error.message}</p>
    });
  }

  handleChange = e => {
    const { name, value } = e.target;

    this.setState({ [name]: value });
  }

  handleSubmit = e => {
    if (this.isFormValid()) {
      const { email, password } = this.state;
  
      e.preventDefault();
      firebase
        .auth()
        .createUserWithEmailAndPassword(email, password)
        .then(createdUser => {
          console.log(createdUser);
        })
        .catch(err => {
          console.error(err);
        });
    }
  }

  render() {
    const { username, email, password, passwordConfirmation } = this.state;

    return(
      <Grid textAlign="center" verticalAlign="middle" className="app">
        <Grid.Column style={{maxWidth: 450}}>
          <Header as="h2" icon color="orange" textAlign="center">
            <Icon name="puzzle piece" color="orange"/>
            Register for DevChat
          </Header>
          <Form size="large" onSubmit={this.handleSubmit}>
            <Segment stacked>
              <Form.Input fluid name="username" icon="user" iconPosition="left"
              placeholder="Username" onChange={this.handleChange} type="text" value={username} />

              <Form.Input fluid name="email" icon="mail" iconPosition="left"
              placeholder="Email Address" onChange={this.handleChange} type="email" value={email} />

              <Form.Input fluid name="password" icon="lock" iconPosition="left"
              placeholder="Password" onChange={this.handleChange} type="password" value={password}/>

              <Form.Input fluid name="passwordConfirmation" icon="repeat" iconPosition="left"
              placeholder="Password Confirmation" onChange={this.handleChange} type="password" value={passwordConfirmation} />

              <Button color="orange" fluid size="large">Submit</Button>
            </Segment>
          </Form>
          {this.state.errors.length > 0 && (
            <Message error>
              <h3>Error</h3>
              {this.displayErrors()}
            </Message>
          )}
          <Message>Already a user? <Link to="/login">Login</Link></Message>
        </Grid.Column>
      </Grid>
    );
  }
}

export default Register;