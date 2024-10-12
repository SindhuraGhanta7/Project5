import React, { useEffect, useState } from 'react';
import {
  Typography, Card, CardContent, CardMedia, Button
} from '@mui/material';
import './userPhotos.css';
import FetchModel from '../../lib/fetchModelData';

/**
 * Define UserPhotos, a React functional component
 */
function UserPhotos({ match }) {
  const [userPhotos, setUserPhotos] = useState([]);

  useEffect(() => {
    const userId = match.params.userId;

    // Use FetchModel to get user photos.
    const fetchUserPhotos = async () => {
      try {
        const response = await FetchModel(`/photosOfUser/${userId}`);
        setUserPhotos(response.data);
      } catch (error) {
        console.error("Error fetching user photos:", error);
      }
    };

    fetchUserPhotos();
  }, [match.params.userId]);

  const handleViewBackToList = () => {
    const userId = match.params.userId;
    window.location.href = `/photo-share.html#/users/${userId}`;
  };

  return (
    <div className="root">
      <Button
        className="back-button"
        color="primary"
        onClick={handleViewBackToList}
      >
        Back to User Info
      </Button>
      <div className="photo-grid">
        {userPhotos.map((photo, index) => (
          <Card key={index} className="card">
            <CardMedia
              className="media contain-background"
              image={`images/${photo.file_name}`}
              title={`Photo ${index + 1}`}
            />
            <CardContent>
              <Typography variant="caption">Photo {index + 1}</Typography>
              <Typography variant="body2">Date: {photo.date_time}</Typography>
              {photo.comments && photo.comments.length > 0 && (
                <div className="comment-list">
                  {photo.comments.map((comment, commentIndex) => (
                    <div key={commentIndex} className="comment">
                      <strong>{comment.user.first_name} {comment.user.last_name}:</strong> {comment.comment}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default UserPhotos;
