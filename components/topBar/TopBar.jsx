import React from 'react';
import {
  AppBar, Toolbar, Typography
} from '@mui/material';
import './TopBar.css';
import FetchModel from '../../lib/fetchModelData';

class TopBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
    };
  }

  componentDidMount() {
    const currentPath = window.location.href;
    const userId = currentPath.split('/').pop(); // Extract userId from the URL

    // Use FetchModel to get user data
    FetchModel(`/user/${userId}`)
      .then((response) => {
        const user = response.data;
        this.setState({
          user: user,
        });
      })
      .catch((error) => {
        console.error(error);
      });
  }

  render() {
    const { user } = this.state;
    const userName = user ? `${user.first_name} ${user.last_name}` : 'Unknown User';
    const occupation = user ? user.occupation : 'Occupation not specified';
    const currentPath = window.location.href;
    let headingText = ''; // Default heading text

    if (currentPath.includes('/photos/')) {
      headingText = `Photos of ${userName}`;
    } else if (currentPath.includes('/users/')) {
      headingText = `Details of ${userName}`;
    }

    return (
      <AppBar className="topbar-appBar" position="absolute">
        <Toolbar className="topbar-centered" style={{ justifyContent: 'space-between' }}>
          <div className="left-content topbar-left"> {/* Add the "topbar-left" class */}
            <Typography variant="h4" color="inherit" className="topbar-app-name">
              GROUP 7
            </Typography>
          </div>
          <div className="user-info-topbar">
            <Typography variant="h6" color="inherit" className="topbar-heading">
              {headingText}
            </Typography>
            <Typography variant="caption" color="inherit" className="user-occupation-topbar">
              {occupation}
            </Typography>
            <Typography variant="h6">
              Version:0
            </Typography>
          </div>
        </Toolbar>
      </AppBar>
    );
  }
}

export default TopBar;
