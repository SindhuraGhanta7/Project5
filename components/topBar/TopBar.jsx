import React, { useEffect, useState } from 'react';
import { AppBar, Toolbar, Typography } from '@mui/material';
import './TopBar.css';
import FetchModel from '../../lib/fetchModelData';

function TopBar() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch the current user data
    const fetchCurrentUser = async () => {
      try {
        const response = await FetchModel('/admin/current_user');
        setUser(response.data);
      } catch (error) {
        console.error("Error fetching current user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  const userName = user ? `${user.first_name} ${user.last_name}` : 'Unknown User';
  const occupation = user ? user.occupation || 'Occupation not specified' : 'Occupation not specified';
  const currentPath = window.location.href;
  const headingText = currentPath.includes('/photos/')
    ? `Photos of ${userName}`
    : `Details of ${userName}`;

  return (
    <AppBar className="topbar-appBar" position="absolute">
      <Toolbar className="topbar-centered" style={{ justifyContent: 'space-between' }}>
        <div className="left-content topbar-left">
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
          <Typography variant="h6">Version: 0</Typography>
        </div>
      </Toolbar>
    </AppBar>
  );
}

export default TopBar;
