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
import LoginRegister from "./components/loginRegister/loginRegister";

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
    this.setState({ selectedUser: user });
  }

  render() {
    return (
      <HashRouter>
        <div>
          <Grid container spacing={8}>
            <Grid item xs={12}>
              {/* TopBar - Displays the top navigation bar */}
              <TopBar 
                main_content={this.state.main_content} 
                user={this.state.user} 
                selectedUser={this.state.selectedUser}  // Pass selectedUser to TopBar
                changeUser={this.changeUser} 
              />
            </Grid>
            <div className="main-topbar-buffer" />
            <Grid item sm={3}>
              <Paper className="main-grid-item">
                {/* Only show UserList if user is logged in */}
                {this.userIsLoggedIn() ? (
                  <UserList selectUser={this.selectUser} /> // Pass selectUser to UserList for user selection
                ) : (
                  <div />
                )}
              </Paper>
            </Grid>
            <Grid item sm={9}>
              <Paper className="main-grid-item">
                <Switch>
                  {/* Protected Routes: Only accessible if logged in */}
                  <Route path="/users/:userId" render={(props) => 
                    this.userIsLoggedIn() ? (
                      <UserDetail {...props} changeMainContent={this.changeMainContent} />
                    ) : (
                      <Redirect to="/login-register" />
                    )
                  } />
                  
                  <Route path="/photos/:userId" render={(props) => 
                    this.userIsLoggedIn() ? (
                      <UserPhotos {...props} changeMainContent={this.changeMainContent} />
                    ) : (
                      <Redirect to="/login-register" />
                    )
                  } />

                  {/* Login/Register Route */}
                  <Route path="/login-register" render={(props) => 
                    this.userIsLoggedIn() ? (
                      <Redirect to="/" />
                    ) : (
                      <LoginRegister {...props} changeUser={this.changeUser} />
                    )
                  } />

                  {/* Default Route: Redirects to login if not logged in */}
                  <Route path="/" render={() => 
                    this.userIsLoggedIn() ? <div /> : <Redirect to="/login-register" />
                  } />
                </Switch>
              </Paper>
            </Grid>
          </Grid>
        </div>
      </HashRouter>
    );
  }
}

ReactDOM.render(
  <PhotoShare />,
  document.getElementById('photoshareapp')
);
