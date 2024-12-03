import React from 'react';
import {
  Typography, 
  Grid, 
  Paper,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Button
} from '@mui/material';
import { Container } from '@mui/system';
import { styled } from '@mui/material/styles';
import { Link } from 'react-router-dom';
import './userDetail.css';
import axios from 'axios';
import { withRouter } from "react-router";


/**
 * Define UserDetail, a React component of project #5
 */
class UserDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      isSettingsDialogOpen: false,
      isDeleteDialogOpen: false
    };
  }

  componentDidMount() {
    this.getUserData();
  }

  componentDidUpdate(prevProps){
    if (this.props.match.params.userId !== prevProps.match.params.userId){
      this.getUserData();
    }
  }

  getUserData() {
    axios.get("http://localhost:3000/user/" + this.props.match.params.userId).then((response) => {
      this.setState({ user: response.data });
    });
  }

  handleSettingsDialogOpen = () => {
    this.setState({isSettingsDialogOpen: true});
  };

  handleSettingsDialogClose = () => {
    this.setState({isSettingsDialogOpen: false});
  };

  handleDeleteDialogOpen = () => {
    this.setState({isDeleteDialogOpen: true});
  };

  handleDeleteDialogClose = () => {
    this.setState({isDeleteDialogOpen: false});
  };

  handleSettingsToDeleteDialog = () => {
    this.setState({isSettingsDialogOpen: false});
    this.setState({isDeleteDialogOpen: true});
  };

  handleDeleteToSettingsDialog = () => {
    this.setState({isDeleteDialogOpen: false});
    this.setState({isSettingsDialogOpen: true});
  };

  handleAccountDelete = e => {
    e.preventDefault();
    axios.delete("http://localhost:3000/deleteUser/" + this.state.user._id).then(() => {
      localStorage.removeItem("uid");
      this.props.setLogout();
      if (this.props.location.pathname.split("/")[1] !== "login-register"){
        this.props.history.push("/login-register");
      }
    });
  };
 
  render() {
    const Item = styled(Paper)(({ theme }) => ({
      backgroundColor: theme.palette.mode === 'dark' ? '' : '#fff',
      ...theme.typography.body2,
      padding: theme.spacing(1),
      textAlign: 'center',
      color:'#004643'
    }));


    return (
      <div>
        {this.state.user && (
          <Container>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Item>
                  <Typography variant='h4' className="details-title-edit">
                    {this.state.user.first_name + " " + this.state.user.last_name}
                  </Typography>
                </Item>
              </Grid>
              <Grid item xs={4} lg={12}>
                <Item>
                  <Typography className="details-list-edit">
                    Location: {this.state.user.location}
                  </Typography>
                </Item>
              </Grid>
              <Grid item xs={4} lg={12}>
                <Item>
                  <Typography className="details-list-edit">
                      Description: {this.state.user.description}
                  </Typography>
                </Item>
              </Grid>
              <Grid item xs={4} lg={12}>
                <Item>
                  <Typography className="details-list-edit">
                      Occupation: {this.state.user.occupation}
                  </Typography>
                </Item>
              </Grid>
              <Grid item xs={12}>
                <Item>
                  <Typography className="user-photos-link">
                    <Link className="user-photos-link-font" to={"/photos/" + this.state.user._id}>Go to user photos</Link>
                  </Typography>
                </Item>
              </Grid>
              {
                localStorage.getItem("uid") === this.state.user._id && (
                  <Grid item xs={12}>
                    <Item>
                      <Button className="user-settings-button" onClick={this.handleSettingsDialogOpen}>Settings</Button>
                    </Item>
                  </Grid>
                )
              }
            </Grid>
          </Container>
        )}
        <Dialog className="settings-dialog" open={this.state.isSettingsDialogOpen} onClose={this.handleSettingsDialogClose}>
          <DialogTitle>Settings</DialogTitle>
          <Divider/>
          <DialogContent className="delete-container">
            <Typography className="delete-text">Delete Account</Typography>
            <Button className="delete-button" onClick={this.handleSettingsToDeleteDialog}>Delete</Button>
          </DialogContent>
          <Divider/>
          <DialogActions>
            <Button onClick={this.handleSettingsDialogClose}>Back</Button>
          </DialogActions>
        </Dialog>

        <Dialog className="delete-dialog" open={this.state.isDeleteDialogOpen} onClose={this.handleDeleteDialogClose}>
          <DialogTitle>Delete Account?</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete your account?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleDeleteToSettingsDialog}>No</Button>
            <Button onClick={this.handleAccountDelete}>Yes</Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}
const userDetailComponent = withRouter(UserDetail);

export default userDetailComponent;

