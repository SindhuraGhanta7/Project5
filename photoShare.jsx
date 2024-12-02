import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter, Route, Switch, Redirect } from 'react-router-dom';
import { Grid, Paper } from '@mui/material';
import './styles/main.css';

// Import necessary components
import TopBar from './components/topBar/TopBar';
import UserDetail from './components/userDetail/userDetail';
import UserList from './components/userList/userList';
import UserPhotos from './components/userPhotos/userPhotos';
import LoginRegister from './components/loginRegister/loginRegister';

class PhotoShare extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      main_content: undefined,
      user: undefined,  // Logged-in user
      selectedUser: undefined,  // Track selected user for photos
    };

    this.changeMainContent = this.changeMainContent.bind(this);
    this.changeUser = this.changeUser.bind(this);
    this.selectUser = this.selectUser.bind(this);  // Function to handle user selection
    this.handleLogout = this.handleLogout.bind(this);
  }

  // Check if the user is logged in
  userIsLoggedIn() {
    return this.state.user !== undefined;
  }

  // Change the main content displayed
  changeMainContent(main_content) {
    this.setState({ main_content: main_content });
  }

  // Update the logged-in user state
  changeUser(user) {
    this.setState({ user: user });
    if (user === undefined) this.changeMainContent(undefined);
  }

  // Select a user from the user list
  selectUser(user) {
    this.setState({ selectedUser: user }); // Update the selected user
  }

  // Logout the user
  handleLogout() {
    this.setState({ user: undefined, selectedUser: undefined });
  }

  render() {
    return (
      <HashRouter basename="/">
        <div>
          <Grid container spacing={8}>
            <Grid item xs={12}>
              <TopBar
                user={this.state.user}
                selectedUser={this.state.selectedUser}
                changeUser={this.changeUser}
                handleLogout={this.handleLogout}
              />
            </Grid>
            <div className="main-topbar-buffer" />
            <Grid item sm={3}>
              <Paper className="main-grid-item">
                {this.userIsLoggedIn() ? (
                  <UserList selectUser={this.selectUser} />
                ) : (
                  <div />
                )}
              </Paper>
            </Grid>
            <Grid item sm={9}>
              <Paper className="main-grid-item">
                <Switch>
                  <Route
                    path="/users/:userId"
                    render={(props) =>
                      this.userIsLoggedIn() ? (
                        <UserDetail {...props} changeMainContent={this.changeMainContent} />
                      ) : (
                        <Redirect to="/login-register" />
                      )
                    }
                  />
                  <Route
                    path="/photos/:userId"
                    render={(props) =>
                      this.userIsLoggedIn() ? (
                        <UserPhotos {...props} changeMainContent={this.changeMainContent} />
                      ) : (
                        <Redirect to="/login-register" />
                      )
                    }
                  />
                  <Route
                    path="/login-register"
                    render={(props) =>
                      this.userIsLoggedIn() ? (
                        <Redirect to="/" />
                      ) : (
                        <LoginRegister {...props} changeUser={this.changeUser} />
                      )
                    }
                  />
                  <Route
                    path="/"
                    render={() =>
                      this.userIsLoggedIn() ? <div /> : <Redirect to="/login-register" />
                    }
                  />
                </Switch>
              </Paper>
            </Grid>
          </Grid>
        </div>
      </HashRouter>
    );
  }
}

ReactDOM.render(<PhotoShare />, document.getElementById('photoshareapp'));
