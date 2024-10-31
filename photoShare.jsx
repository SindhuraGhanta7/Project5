import React from 'react';
import ReactDOM from 'react-dom';
import {
  HashRouter, Route, Switch
} from 'react-router-dom';
import {
  Grid, Typography, Paper
} from '@mui/material';
import './styles/main.css';
import TopBar from './components/topBar/TopBar';
import UserDetail from './components/userDetail/userDetail';
import UserList from './components/userList/userList';
import UserPhotos from './components/userPhotos/userPhotos';
import LoginRegister from './components/LoginRegister/loginRegister';
import FetchModel from './lib/fetchModelData';

class PhotoShare extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentUser: null,
      loading: true,
    };
  }

  componentDidMount() {
    this.fetchCurrentUser();
  }

  fetchCurrentUser = () => {
    FetchModel('/admin/current_user')
      .then(response => {
        this.setState({ currentUser: response, loading: false });
      })
      .catch(error => {
        console.error("Error fetching current user:", error);
        this.setState({ loading: false });
      });
  };

  handleLoginSuccess = (userData) => {
    console.log('Logged in:', userData);
    this.setState({ currentUser: userData });
    // Update your application state or redirect after login here
  };

  handleLogout = () => {
    console.log('Logged out');
    // Handle logout logic here (e.g., API call to logout)
    // After logout, clear currentUser state
    this.setState({ currentUser: null });
  };

  render() {
    const { loading, currentUser } = this.state;

    return (
      <HashRouter>
        <div>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TopBar onLogout={this.handleLogout} user={currentUser} />
            </Grid>
            <div className="main-topbar-buffer" />
            <Grid item sm={3}>
              <Paper className="main-grid-item">
                <UserList />
              </Paper>
            </Grid>
            <Grid item sm={9}>
              <Paper className="main-grid-item">
                {loading ? (
                  <Typography variant="body1">Loading...</Typography>
                ) : (
                  <Switch>
                    <Route exact path="/" component={PhotoShare.renderWelcome} />
                    <Route 
                      path="/login" 
                      render={(props) => <LoginRegister {...props} onLoginSuccess={this.handleLoginSuccess} />} 
                    />
                    <Route 
                      path="/users/:userId" 
                      render={PhotoShare.renderUserDetail} 
                    />
                    <Route 
                      path="/photos/:userId" 
                      render={PhotoShare.renderUserPhotos} 
                    />
                    <Route path="/users" component={UserList} />
                  </Switch>
                )}
              </Paper>
            </Grid>
          </Grid>
        </div>
      </HashRouter>
    );
  }

  static renderWelcome() {
    return (
      <Typography variant="body1">
        Welcome to your photosharing app!
      </Typography>
    );
  }

  static renderUserDetail(props) {
    return <UserDetail {...props} />;
  }

  static renderUserPhotos(props) {
    return <UserPhotos {...props} />;
  }
}

ReactDOM.render(
  <PhotoShare />,
  document.getElementById('photoshareapp'),
);
