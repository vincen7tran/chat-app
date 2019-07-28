import React from "react";
import firebase from "../../firebase";
import {
  Grid,
  Form,
  Segment,
  Button,
  Header,
  Message,
  Icon
} from "semantic-ui-react";
import { Link } from "react-router-dom";

class Register extends React.Component {
  state = {
    username: "",
    email: "",
    password: "",
    passwordConfirmation: "",
    errors: [],
    loading: false
  };

  isFormValid = () => {
    const errors = [];
    let error;

    if (this.isFormEmpty()) {
      error = { message: "Fill in all fields" };

      this.setState({ errors: [...errors, error] });

      return false;
    } else if (!this.isPasswordValid()) {
      error = { message: "Password is invalid" };

      this.setState({ errors: [...errors, error] });

      return false;
    }

    return true;
  };

  isFormEmpty = () => {
    const { username, email, password, passwordConfirmation } = this.state;

    return (
      !username.length ||
      !email.length ||
      !password.length ||
      !passwordConfirmation
    );
  };

  isPasswordValid = () => {
    const { password, passwordConfirmation } = this.state;

    if (password.length < 6 || passwordConfirmation < 6) return false;
    if (password !== passwordConfirmation) return false;

    return true;
  };

  handleInputError = inputName => {
    const { errors } = this.state;

    return errors.some(error => error.message.toLowerCase().includes(inputName)) ? 'error' : '';
  }

  displayErrors = () => {
    const { errors } = this.state;

    return errors.map((error, i) => {
      return <p key={i}>{error.message}</p>;
    });
  };

  handleChange = e => {
    const { name, value } = e.target;

    this.setState({ [name]: value });
  };

  handleSubmit = e => {
    e.preventDefault();

    if (this.isFormValid()) {
      this.setState({ errors: [], loading: true });

      const { email, password } = this.state;

      firebase
        .auth()
        .createUserWithEmailAndPassword(email, password)
        .then(createdUser => {
          console.log(createdUser);
          this.setState({ loading: false });
        })
        .catch(err => {
          console.error(err);
          const { errors } = this.state;
          this.setState({ errors: [...errors, err], loading: false });
        });
    }
  };

  render() {
    const {
      username,
      email,
      password,
      passwordConfirmation,
      errors,
      loading
    } = this.state;

    return (
      <Grid textAlign="center" verticalAlign="middle" className="app">
        <Grid.Column style={{ maxWidth: 450 }}>
          <Header as="h2" icon color="orange" textAlign="center">
            <Icon name="puzzle piece" color="orange" />
            Register for DevChat
          </Header>
          <Form size="large" onSubmit={this.handleSubmit}>
            <Segment stacked>
              <Form.Input
                fluid
                name="username"
                icon="user"
                iconPosition="left"
                placeholder="Username"
                onChange={this.handleChange}
                type="text"
                value={username}
                className={this.handleInputError('username')}
              />

              <Form.Input
                fluid
                name="email"
                icon="mail"
                iconPosition="left"
                placeholder="Email Address"
                onChange={this.handleChange}
                type="email"
                value={email}
                className={this.handleInputError('email')}
              />

              <Form.Input
                fluid
                name="password"
                icon="lock"
                iconPosition="left"
                placeholder="Password"
                onChange={this.handleChange}
                type="password"
                value={password}
                className={this.handleInputError('password')}
              />

              <Form.Input
                fluid
                name="passwordConfirmation"
                icon="repeat"
                iconPosition="left"
                placeholder="Password Confirmation"
                onChange={this.handleChange}
                type="password"
                value={passwordConfirmation}
                className={this.handleInputError('password')}
              />

              <Button
                disabled={loading}
                className={loading ? "loading" : ""}
                color="orange"
                fluid
                size="large"
              >
                Submit
              </Button>
            </Segment>
          </Form>
          {this.state.errors.length > 0 && (
            <Message error>
              <h3>Error</h3>
              {this.displayErrors()}
            </Message>
          )}
          <Message>
            Already a user? <Link to="/login">Login</Link>
          </Message>
        </Grid.Column>
      </Grid>
    );
  }
}

export default Register;
