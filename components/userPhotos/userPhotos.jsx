import React from 'react';
import {
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Divider,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import './userPhotos.css';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';

class UserPhotos extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      photos: null,
      isDialogOpen: false,
      selectedPhotoId: null,
      loggedIn:null,
      alreadyLikedMap: {}

    };
  }

  componentDidMount() {
    this.getPhotoData();
    this.getLoggedInUser();
  }

  componentDidUpdate(prevProps){
    if (this.props.newPhotoAdded !== prevProps.newPhotoAdded && this.props.newPhotoAdded){
      this.getPhotoData();
      this.props.setNewPhotoAdded(false);
    }
    if (this.props.loggedIn !== prevProps.loggedIn && this.props.loggedIn){
      this.getLoggedInUser();
    }
  }
 
  getPhotoData() {
    axios.get("http://localhost:3000/photosOfUser/" + this.props.match.params.userId)
      .then((response) => {
        // Sort photos based on likes and timestamp
        const sortedPhotos = response.data.sort((a, b) => {
          // First, compare likes in descending order
          const likesComparison = b.likes.length - a.likes.length;
          if (likesComparison !== 0) {
            return likesComparison;
          }
  
          // If likes are the same, compare timestamps in reverse chronological order
          return new Date(b.date_time) - new Date(a.date_time);
        });
  
        this.setState({ photos: sortedPhotos });
      })
      .catch((error) => {
        console.error("Error fetching photos:", error);
      });
  
  
  }
  handleCommentDelete = (selectedPhotoId, selectedCommentId) => {
    axios.delete("http://localhost:3000/delete/" + selectedPhotoId + "/" + selectedCommentId).then(() => {
      this.getPhotoData();
    });
  };
 
  handleLike = async (photoId) => {
    console.log("Photo ID Details:", JSON.stringify(photoId, null, 2));
    try {
      // Check if the user has already liked the photo
      const alreadyLike = this.state.photos.some(photo => photo._id === photoId && photo.likes.includes(this.state.loggedIn._id));
  
      if (alreadyLike) {
        // If already liked, send an "unlike" request
        await axios.post(`http://localhost:3000/unlike/${photoId}`);
      } else {
        // If not liked, send a "like" request
        await axios.post(`http://localhost:3000/likes/${photoId}`);
      }
      this.setState((prevState) => ({
        alreadyLikedMap: {
          ...prevState.alreadyLikedMap,
          [photoId]: !alreadyLike,
        },
      }));      // After successfully updating likes, refresh the photo data
      this.getPhotoData();
    } catch (error) {
      console.error("Error handling like:", error);
    }
  };

  getLoggedInUser(){
    const userId = localStorage.getItem("uid");
    if(userId !== null){
      axios.get("http://localhost:3000/user/" + userId).then((response) =>{
        this.setState({loggedIn: response.data});
      });
    }
  }

  handlePostDelete = (photoId) => {
    axios.delete("http://localhost:3000/deletePhoto/" + photoId).then(() => {
      this.getPhotoData();
    });
  };
  handleDialogOpen = (selectedPhotoId) => {
    this.setState({isDialogOpen: true});
    this.setState({selectedPhotoId: selectedPhotoId});
  };

  handleDialogClose = () => {
    this.setState({isDialogOpen: false});
    this.setState({selectedPhotoId: null});
  };

  handleCommentSubmit = () => {
    console.log("photo id: ", this.state.selectedPhotoId);

    if (this.state.selectedPhotoId !== null){
      axios.post("http://localhost:3000/commentsOfPhoto/" + this.state.selectedPhotoId, {
        comment: document.getElementById("comment-text").value
      }).then(() => {
        this.getPhotoData();
        this.handleDialogClose();
      });
    }
  };

  handleViewBackToList() {
    const userId = this.props.match.params.userId;
    window.location.href = `/photo-share.html#/users/${userId}`;
  }

  render() {
    console.log(this.state.photos);
    return (
      <div>
        <Button
          className="back-button"
          variant="contained"
          onClick={() => this.handleViewBackToList()}
        >
          Back to User Info
        </Button>
        <Grid container spacing={6}>
          
          {this.state.photos && (
            this.state.photos.map((photo) => (
              <Grid item md={3} key={photo._id}>
                <Card sx={{ maxWidth: 500 }}>
                  <CardMedia
                    sx={{ height: 300 }}
                    image={"/images/" + photo.file_name}
                    title="green iguana"
                  />
                  <CardContent>
                  <IconButton
                        className="like-button"
                        variant="outlined"
                        onClick={() => this.handleLike(photo._id)}
                      >
                        {this.state.alreadyLikedMap[photo._id]? (
                          <>
                            <ThumbUpAltIcon fontSize="medium" />&nbsp;
                            Liked by: You & {photo.likes.length > 1 ? `${photo.likes.length-1} others` : `${photo.likes.length-1} other`} 
                            {/* {photo.likes && photo.likes.length > 2 ? `You and ${photo.likes.length} others` : `${photo.likes && photo.likes.length} like${photo.likes && photo.likes.length > 1 ? 's' : ''}`} */}
                          </>
                        ) : (
                          <>
                            <ThumbUpOffAltIcon fontSize="medium" />&nbsp;
                            Liked by: {photo.likes.length > 1 ? `${photo.likes.length} others` : `${photo.likes.length} other`} 
                          </>
                        )}
                  </IconButton>
                    <Typography gutterBottom variant="body1" component="div">
                      Created at: <i>{photo.date_time}</i>
                    </Typography>
                    <Divider/>
                    {
                      (photo.comments.length !== 0) ? photo.comments.map((comment) => (
                        <div key={comment._id}>
                          <Typography className="photos-comment-link" gutterBottom variant="body2" component="div">
                            <Link to={"/users/" + comment.user._id}>
                              <b>{comment.user.first_name + " " + comment.user.last_name}</b>
                            </Link>
                              {" @ "}
                              <i>{comment.date_time}</i>
                              {": "}
                              {comment.comment}
                          </Typography>
                          {
                            this.state.loggedIn && this.state.loggedIn._id === comment.user._id?
                            <DeleteIcon className="comment-delete-button" onClick={() => this.handleCommentDelete(photo._id, comment._id)}></DeleteIcon>
                            : null
                          }
                          <Divider/>
                        </div>
                      )) : null
                    }
                    <IconButton className="comment-plus-button" variant="outlined" onClick={() => this.handleDialogOpen(photo._id)}> + </IconButton>
                    {
                      this.state.loggedIn && this.state.loggedIn._id === photo.user_id?
                      <DeleteIcon className="comment-delete-button" onClick={() => this.handlePostDelete(photo._id)}></DeleteIcon>
                      : null
                    }
                  </CardContent>
                </Card>
              </Grid>
            ))
          )}
          <Dialog className="comment-dialog" open={this.state.isDialogOpen} onClose={this.handleDialogClose}>
            <DialogTitle>Add a comment</DialogTitle>
            <DialogContent>
              <TextField
                autoFocus
                id="comment-text"
                label="Comment"
                type="text"
                fullWidth
                variant="standard"
                autoComplete='off'
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={this.handleDialogClose}>Cancel</Button>
              <Button onClick={this.handleCommentSubmit}>Add</Button>
            </DialogActions>
          </Dialog>
        </Grid>
      </div>
    );
  }
}

export default UserPhotos;
