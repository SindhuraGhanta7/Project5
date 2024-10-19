import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Typography, Button } from '@mui/material';
import './userDetail.css';
import FetchModel from '../../lib/fetchModelData';

function UserDetail({ match }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const history = useHistory();

  useEffect(() => {
    const userID = match.params.userId;

    const fetchUserData = async () => {
      try {
        const response = await FetchModel(`/user/${userID}`);
        setUser(response.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load user details.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [match.params.userId]);

  const handleViewPhotosClick = (userId) => {
    history.push(`/photos/${userId}`);
  };

  if (loading) {
    return <Typography variant="body1">Loading user details...</Typography>;
  }

  if (error) {
    return <Typography variant="body1" color="error">{error}</Typography>;
  }

  if (!user) {
    return <Typography variant="body1">User not found.</Typography>;
  }

  return (
    <div className="user-detail-container">
      <Typography variant="body1" className="user-name">
        User Details for: {user.first_name} {user.last_name}<br />
      </Typography>
      <Typography variant="body1" className="user-info">
        Location: {user.location}<br />
        Description: {user.description}<br />
        Occupation: {user.occupation}<br />
        <Button 
          variant="contained" 
          className="view-photos-button" 
          onClick={() => handleViewPhotosClick(user._id)}
        >
          View Photos
        </Button>
      </Typography>
    </div>
  );
}

export default UserDetail;
