import React, { useState, useEffect } from 'react';
import { Button, TextField, ImageList, ImageListItem } from '@mui/material';
import axios from 'axios';
import './userPhotos.css';

/**
 * Define UserPhotos, a React component for displaying user photos.
 */
const UserPhotos = ({ match, changeMainContent }) => {
  const [userId, setUserId] = useState(undefined);
  const [photos, setPhotos] = useState([]);
  const [comments, setComments] = useState({});
  const [currentUserId, setCurrentUserId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCurrentUserId();
    const newUserId = match.params.userId;
    if (newUserId) {
      handleUserChange(newUserId);
    } else {
      console.error("User ID is missing");
    }
  }, [match.params.userId]);

  const fetchCurrentUserId = () => {
    axios.get('/admin/current_user')
      .then(response => setCurrentUserId(response.data._id))
      .catch(error => console.error("Error fetching current user:", error))
      .finally(() => setLoading(false));
  };

  const handleUserChange = (userId) => {
    setUserId(userId);
    axios.get(`/photosOfUser/${userId}`)
      .then(response => setPhotos(response.data))
      .catch(error => console.error("Error fetching photos:", error));

    axios.get(`/user/${userId}`)
      .then(response => {
        const newUser = response.data;
        const mainContent = `User Photos for ${newUser.first_name} ${newUser.last_name}`;
        changeMainContent(mainContent);
      })
      .catch(error => console.error("Error fetching user data:", error));
  };

  const handleCommentSubmit = (photoId) => {
    if (!comments[photoId] || !comments[photoId].trim()) {
      console.error("Comment cannot be empty");
      return; // No alert here
    }

    axios.post(`/photos/${photoId}/comments`, {
      comment: comments[photoId],
      user_id: currentUserId,
    })
      .then(response => {
        const newComment = {
          _id: response.data._id,
          comment: comments[photoId],
          user: { _id: currentUserId, first_name: 'John', last_name: 'Doe' }, // Replace with actual user data if needed
          date_time: new Date().toISOString(),
        };
        setPhotos(prevPhotos => prevPhotos.map(photo =>
          photo._id === photoId
            ? { ...photo, comments: [...photo.comments, newComment] }
            : photo
        ));
        setComments(prev => ({ ...prev, [photoId]: '' }));
      })
      .catch(error => console.error("Error adding comment:", error));
  };

  const handleCommentChange = (photoId, value) => {
    setComments(prev => ({ ...prev, [photoId]: value }));
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return userId ? (
    <div>
      <div>
        <Button variant="contained" component="a" href={`#/users/${userId}`}>
          User Detail
        </Button>
      </div>
      <ImageList variant="masonry" cols={1} gap={8}>
        {photos.map(item => (
          <div key={item._id}>
            <TextField
              label="Photo Date"
              variant="outlined"
              disabled
              fullWidth
              margin="normal"
              value={item.date_time}
            />
            <ImageListItem key={item.file_name}>
              <img
                src={`images/${item.file_name}`}
                alt={item.file_name}
                loading="lazy"
              />
            </ImageListItem>

            <TextField
              label="Add a Comment"
              variant="outlined"
              fullWidth
              margin="normal"
              value={comments[item._id] || ''}
              onChange={(e) => handleCommentChange(item._id, e.target.value)}
            />
            <Button
              variant="contained"
              onClick={() => handleCommentSubmit(item._id)}
            >
              Submit Comment
            </Button>

            {item.comments && item.comments.length > 0 ? (
              item.comments.map(comment => (
                <div key={comment._id}>
                  <TextField
                    label="Comment Date"
                    variant="outlined"
                    disabled
                    fullWidth
                    margin="normal"
                    value={new Date(comment.date_time).toLocaleString()}
                  />
                  <TextField
                    label="User"
                    variant="outlined"
                    disabled
                    fullWidth
                    margin="normal"
                    value={`${comment.user.first_name} ${comment.user.last_name}`}
                    component="a"
                    href={`#/users/${comment.user._id}`}
                  />
                  <TextField
                    label="Comment"
                    variant="outlined"
                    disabled
                    fullWidth
                    margin="normal"
                    multiline
                    rows={4}
                    value={comment.comment}
                  />
                </div>
              ))
            ) : (
              <TextField
                label="No Comments"
                variant="outlined"
                disabled
                fullWidth
                margin="normal"
              />
            )}
          </div>
        ))}
      </ImageList>
    </div>
  ) : <div />;
};

export default UserPhotos;
