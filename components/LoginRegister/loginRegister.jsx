import React from 'react';
import { Button, TextField, Typography, Paper } from '@mui/material';
import axios from 'axios';
import './loginRegister.css';

class LoginRegister extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loginName: '',
      password: '',
      firstName: '',
      lastName: '',
      location: '',
      description: '',
      occupation: '',
      isLogin: true,
      errorMessage: '',
      successMessage: '',
      loading: false,
    };
  }

  // Login method
  handleLogin = async (e) => {
    e.preventDefault();
    this.setState({ loading: true, errorMessage: '', successMessage: '' });
    const { loginName, password } = this.state;

    try {
      const response = await axios.post('/admin/login', { login_name: loginName, password });
      this.props.changeUser(response.data); // Pass logged-in user data to parent component
      this.setState({ successMessage: 'Login successful!', loading: false });
    } catch (error) {
      console.error(error);
      this.setState({
        errorMessage: error.response?.data?.message || 'Login failed. Please check your credentials.',
        loading: false,
      });
    }
  };

  // Register method
  handleRegister = async (e) => {
    e.preventDefault();
    this.setState({ loading: true, errorMessage: '', successMessage: '' });
    const { password, firstName, lastName, location, description, occupation } = this.state;
    const loginName = lastName.toLowerCase();

    try {
      await axios.post('/user', {
        login_name: loginName,
        password,
        first_name: firstName,
        last_name: lastName,
        location,
        description,
        occupation,
      });
      this.setState({
        successMessage: 'Registration successful! You can now log in.',
        isLogin: true,
        loading: false,
      });
    } catch (error) {
      console.error(error);
      this.setState({
        errorMessage: error.response?.data?.message || 'Registration failed. Please check your input.',
        loading: false,
      });
    }
  };

  // Logout method
  handleLogout = async () => {
    try {
      await axios.post('/admin/logout');
      this.props.changeUser(undefined); // Clear the user data in parent component (via props)
      this.setState({ successMessage: 'Logged out successfully.', errorMessage: '' });
      // Optionally, you can redirect or clear the state here
      window.location.href = '/login-register';  // Redirect to login page (optional)
    } catch (error) {
      console.error(error);
      this.setState({ errorMessage: 'Logout failed.', successMessage: '' });
    }
  };

  render() {
    const {
      loginName,
      password,
      firstName,
      lastName,
      location,
      description,
      occupation,
      isLogin,
      errorMessage,
      successMessage,
      loading,
    } = this.state;

    return (
      <Paper className="login-register">
        <Typography variant="h4">{isLogin ? 'Login' : 'Register'}</Typography>
        {errorMessage && <Typography color="error">{errorMessage}</Typography>}
        {successMessage && <Typography color="primary">{successMessage}</Typography>}
        <form onSubmit={isLogin ? this.handleLogin : this.handleRegister}>
          <TextField
            label="Login Name"
            value={loginName}
            onChange={(e) => this.setState({ loginName: e.target.value })}
            required
          />
          <TextField
            type="password"
            label="Password"
            value={password}
            onChange={(e) => this.setState({ password: e.target.value })}
            required
          />
          {!isLogin && (
            <>
              <TextField
                label="First Name"
                value={firstName}
                onChange={(e) => this.setState({ firstName: e.target.value })}
                required
              />
              <TextField
                label="Last Name"
                value={lastName}
                onChange={(e) => this.setState({ lastName: e.target.value })}
                required
              />
              <TextField
                label="Location"
                value={location}
                onChange={(e) => this.setState({ location: e.target.value })}
              />
              <TextField
                label="Description"
                value={description}
                onChange={(e) => this.setState({ description: e.target.value })}
              />
              <TextField
                label="Occupation"
                value={occupation}
                onChange={(e) => this.setState({ occupation: e.target.value })}
              />
            </>
          )}
          <Button type="submit" variant="contained" disabled={loading}>
            {isLogin ? (loading ? 'Logging in...' : 'Login') : (loading ? 'Registering...' : 'Register')}
          </Button>
          <Button onClick={() => this.setState({ isLogin: !isLogin })}>
            {isLogin ? 'Switch to Register' : 'Switch to Login'}
          </Button>
        </form>
        {isLogin && (
          <Button onClick={this.handleLogout} variant="contained">
            Logout
          </Button>
        )}
      </Paper>
    );
  }
}

export default LoginRegister;
