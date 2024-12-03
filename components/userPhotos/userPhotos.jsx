import React from 'react';
import {
    Button, TextField,
    ImageListItem, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Typography
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import './userPhotos.css';
import axios from 'axios';
import { useHistory, useParams, useLocation } from 'react-router-dom';

/**
 * Define UserPhotos, a React component of project #5
 */
class UserPhotos extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            user_id: undefined,
            photos: undefined,
            current_index: 0, // Track the current photo index
            new_comment: undefined,
            add_comment: false,
            current_photo_id: undefined,
            isDialogOpen: false,
            selectedPhotoId: null,
            loggedIn:null,
            alreadyLikedMap: {}
        };

        this.handleCancelAddComment = this.handleCancelAddComment.bind(this);
        this.handleSubmitAddComment = this.handleSubmitAddComment.bind(this);
        this.handleNextPhoto = this.handleNextPhoto.bind(this);
        this.handlePreviousPhoto = this.handlePreviousPhoto.bind(this);
    }

    componentDidMount() {
        const new_user_id = this.props.match.params.userId;
        const { location } = this.props; // Extract current location (URL) from props
        const { hash } = location;
        const photoIndex = hash ? parseInt(hash.split('/')[2], 10) : 0; // Extract the photo index from the URL

        // Check if user is already logged in via localStorage
        const userInfo = localStorage.getItem('user_info');
        if (userInfo) {
            const parsedUserInfo = JSON.parse(userInfo);
            // If session is valid, load the user and their photos from localStorage
            if (parsedUserInfo.user_id) {
                this.setState({
                    user_id: parsedUserInfo.user_id,
                    photos: parsedUserInfo.photos || [],
                    current_index: photoIndex // Set the current index from URL
                });
            }
        }

        // Fetch new user data
        this.handleUserChange(new_user_id);
    }

    componentDidUpdate(prevProps) {
        const new_user_id = this.props.match.params.userId;
        const current_user_id = this.state.user_id;
        if (current_user_id !== new_user_id) {
            this.handleUserChange(new_user_id);
        }
    }
    handleCommentDelete = (selectedPhotoId, selectedCommentId) => {
        axios.delete("http://localhost:3000/delete/" + selectedPhotoId + "/" + selectedCommentId).then(() => {
          this.getPhotoData();
        });
    };

    handlePostDelete = (photoId) => {
        axios.delete("http://localhost:3000/deletePhoto/" + photoId).then(() => {
          this.getPhotoData();
        });
    };

    handleUserChange(user_id) {
        // Fetch user photos
        axios.get(`/photosOfUser/${user_id}`)
            .then((response) => {
                this.setState({
                    user_id: user_id,
                    photos: response.data
                });

                // Store user info in localStorage
                localStorage.setItem('user_info', JSON.stringify({ user_id, photos: response.data }));
            })
            .catch(() => {
                console.log('Error fetching photos');
            });

        // Fetch user details
        axios.get(`/user/${user_id}`)
            .then((response) => {
                const new_user = response.data;
                const main_content = `User Photos for ${new_user.first_name} ${new_user.last_name}`;
                this.props.changeMainContent(main_content);
            })
            .catch(() => {
                console.log('Error fetching user');
            });
    }

    handleNewCommentChange = (event) => {
        this.setState({
            new_comment: event.target.value
        });
    };

    handleShowAddComment = (event) => {
        const photo_id = event.target.attributes.photo_id.value;
        this.setState({
            add_comment: true,
            current_photo_id: photo_id
        });
    };

    handleCancelAddComment = () => {
        this.setState({
            add_comment: false,
            new_comment: undefined,
            current_photo_id: undefined
        });
    };

    handleSubmitAddComment = () => {
        const currentState = JSON.stringify({ comment: this.state.new_comment });
        const photo_id = this.state.current_photo_id;
        const user_id = this.state.user_id;
        axios.post(`/commentsOfPhoto/${photo_id}`, currentState, {
            headers: {
                'Content-Type': 'application/json',
            }
        })
            .then(() => {
                this.setState({
                    add_comment: false,
                    new_comment: undefined,
                    current_photo_id: undefined
                });

                // Refresh photos
                axios.get(`/photosOfUser/${user_id}`)
                    .then((response) => {
                        this.setState({
                            photos: response.data
                        });

                        // Update localStorage with new photos
                        localStorage.setItem('user_info', JSON.stringify({ user_id, photos: response.data }));
                    });
            })
            .catch(error => {
                console.log(error);
            });
    };

    // Navigation functions for stepping through photos
    handleNextPhoto() {
        if (this.state.current_index < this.state.photos.length - 1) {
            this.setState(prevState => ({
                current_index: prevState.current_index + 1
            }), this.updateURL); // Update URL when navigating
        }
    }

    handlePreviousPhoto() {
        if (this.state.current_index > 0) {
            this.setState(prevState => ({
                current_index: prevState.current_index - 1
            }), this.updateURL); // Update URL when navigating
        }
    }

    updateURL() {
        const { current_index, user_id } = this.state;
        const newURL = `#/users/${user_id}/photos/${current_index}`;
        window.history.pushState(null, '', newURL); // Update browser URL
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
    

//     render() {
//         const { photos, current_index } = this.state;

//         return this.state.user_id && photos && photos.length > 0 ? (
//             <div>
//                 <div>
//                     <Button variant="contained" component="a" href={`#/users/${this.state.user_id}`}>
//                         User Detail
//                     </Button>
//                 </div>
//                 {/* Display only one photo at a time */}
//                 <div key={photos[current_index]._id}>
//                     <TextField label="Photo Date" variant="outlined" disabled fullWidth margin="normal" value={photos[current_index].date_time} />
//                     <ImageListItem key={photos[current_index].file_name}>
//                         <img
//                             src={`images/${photos[current_index].file_name}?w=164&h=164&fit=crop&auto=format&dpr=2 2x`}
//                             alt={photos[current_index].file_name}
//                             loading="lazy"
//                         />
//                     </ImageListItem>
//                     <div>
//                         {photos[current_index].comments ? (
//                             photos[current_index].comments.map((comment) => (
//                                 <div key={comment._id}>
//                                     <TextField label="Comment Date" variant="outlined" disabled fullWidth margin="normal" value={comment.date_time} />
//                                     <TextField label="User" variant="outlined" disabled fullWidth margin="normal"
//                                         value={`${comment.user.first_name} ${comment.user.last_name}`}
//                                         component="a" href={`#/users/${comment.user._id}`} />
//                                     <TextField label="Comment" variant="outlined" disabled fullWidth margin="normal" multiline rows={4} value={comment.comment} />
//                                 </div>
//                             ))
//                         ) : (
//                             <Typography>No Comments</Typography>
//                         )}
//                         <Button photo_id={photos[current_index]._id} variant="contained" onClick={this.handleShowAddComment}>
//                             Add Comment
//                         </Button>
//                     </div>
//                 </div>

//                 {/* Navigation Buttons */}
//                 <div>
//                     <Button variant="contained" onClick={this.handlePreviousPhoto} disabled={current_index === 0}>
//                         Previous
//                     </Button>
//                     <Button variant="contained" onClick={this.handleNextPhoto} disabled={current_index === photos.length - 1}>
//                         Next
//                     </Button>
//                 </div>

//                 {/* Dialog for Adding Comments */}
//                 <Dialog open={this.state.add_comment}>
//                     <DialogTitle>Add Comment</DialogTitle>
//                     <DialogContent>
//                         <DialogContentText>
//                             Enter New Comment for Photo
//                         </DialogContentText>
//                         <TextField
//                             autoFocus
//                             margin="dense"
//                             id="comment"
//                             label="Comment"
//                             multiline rows={4}
//                             fullWidth
//                             variant="standard"
//                             onChange={this.handleNewCommentChange}
//                             defaultValue={this.state.new_comment}
//                         />
//                     </DialogContent>
//                     <DialogActions>
//                         <Button onClick={this.handleCancelAddComment}>Cancel</Button>
//                         <Button onClick={this.handleSubmitAddComment}>Add</Button>
//                     </DialogActions>
//                 </Dialog>
//             </div>
//         ) : (
//             <div>
//                 <Typography>No Photos</Typography>
//             </div>
//         );
//     }
// }

// export default UserPhotos;

// /* user photos */
import React, { useEffect, useState } from "react";
import { Avatar, Box, Button, Divider, Stack, TextField, Typography } from "@mui/material";
import { useHistory, Link, useLocation } from "react-router-dom";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import "./userPhotos.css";
import axios from "axios";
import { ChatBubbleOutline } from "@mui/icons-material";
import moment from "moment";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import BookmarkIcon from "@mui/icons-material/Bookmark";

function UserPhotos(props) {
  const history = useHistory();
  const [photosData, setPhotosData] = useState([]);
  const [userData, setUserData] = useState();
  const [pageLoaded, setPageLoaded] = useState(false);
  useEffect(() => {
    axios
      .get("http://localhost:3000/photosOfUser/" + props.match.params.userId)
      .then((res) => setPhotosData(res.data))
      .then(() => setPageLoaded(true))
      .catch((err) => console.log(err));
    axios
      .get("http://localhost:3000/user/" + props.match.params.userId)
      .then((res) => {
        setUserData(res.data);
        props.setTitle(`Photos of ${res?.data?.first_name} ${res?.data?.last_name}`);
      })
      .catch((err) => console.log(err));
  }, [props.match.params.userId]);
  function stringToColor(string) {
    let hash = 0;
    let i;
    /* eslint-disable no-bitwise */
    for (i = 0; i < string.length; i += 1) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = "#";
    for (i = 0; i < 3; i += 1) {
      const value = (hash >> (i * 8)) & 0xff;
      color += `00${value.toString(16)}`.slice(-2);
    }
    /* eslint-enable no-bitwise */
    return color;
  }

  const addComment = (event, photo) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const comment = data.get("comment");
    axios
      .post("http://localhost:3000/commentsOfPhoto/" + photo._id, { comment })
      .then((res) => {
        setPhotosData((prev) => {
          const newPhotosData = [...prev];
          const photoIndex = newPhotosData.findIndex((photoData) => photoData._id === photo._id);
          newPhotosData[photoIndex].comments.push(res.data);
          return newPhotosData;
        });
        event.target.reset();
      })
      .catch((err) => console.log(err));
  };

  const onLikeClick = (photo) => {
    axios
      .post("http://localhost:3000/photos/like/" + photo._id)
      .then((res) => {
        setPhotosData((prev) => {
          const newPhotosData = [...prev];
          const photoIndex = newPhotosData.findIndex((photoData) => photoData._id === photo._id);
          newPhotosData[photoIndex].liked_by = res.data;
          return newPhotosData;
        });
      })
      .catch((err) => console.log(err));
  };

  const onFavoriteClick = (photo) => {
    axios
      .post("http://localhost:3000/photos/favorite/" + photo._id)
      .then((res) => {
        setPhotosData((prev) => {
          const newPhotosData = [...prev];
          const photoIndex = newPhotosData.findIndex((photoData) => photoData._id === photo._id);
          newPhotosData[photoIndex].favorited_by = res.data;
          return newPhotosData;
        });
      })
      .catch((err) => console.log(err));
  };

  const location = useLocation();

  useEffect(() => {
    if (pageLoaded) {
      const queryParams = new URLSearchParams(location.search);
      const imageId = queryParams.get("imageId");
      const element = document.getElementById(imageId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }, [location.search, pageLoaded]);

  const redirectToUser = (id) => history.push("/users/" + id);
  return (
    <Box padding={2}>
      {photosData.length > 0 ? (
        photosData.map((photo, index) => (
          <Box key={index} marginTop={5}>
            <Stack direction="row" gap={1} paddingBottom={2}>
              <Avatar sx={{ bgcolor: stringToColor(`${userData?.first_name?.[0]}${userData?.last_name?.[0]}`) }}>
                {userData?.first_name?.[0]}
                {userData?.last_name?.[0]}
              </Avatar>
              <Box>
                <Typography fontSize={18}>
                  {userData?.first_name} {userData?.last_name}
                </Typography>
                <Typography variant="body2" fontSize={12}>
                  {moment(photo?.date_time).format("MMMM Do YYYY")} at {moment(photo?.date_time).format("h:mm a")}
                </Typography>
              </Box>
            </Stack>
            <Box bgcolor="black" display="flex" justifyContent="center" borderRadius={2}>
              <div id={photo?.file_name}>
                <img src={`../../images/${photo?.file_name}`} className="main-image" />
              </div>
            </Box>
            <Box display="flex" flexDirection="row" alignItems="center" gap={1} marginTop={2}>
              <ChatBubbleOutline /> <Typography sx={{ marginRight: 3 }}>{photo?.comments?.length}</Typography>
              <Box onClick={() => onLikeClick(photo)} sx={{ cursor: "pointer" }}>
                {photo?.liked_by?.includes(props.userId) ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
              </Box>{" "}
              <Typography>{photo?.liked_by?.length || 0}</Typography>
              <Box
                onClick={() => {
                  onFavoriteClick(photo);
                }}
                sx={{ cursor: "pointer", marginLeft: 3 }}
              >
                {photo?.favorited_by?.includes(props.userId) ? <BookmarkIcon /> : <BookmarkBorderIcon />}
              </Box>{" "}
              <Typography>{photo?.favorited_by?.length || 0}</Typography>
            </Box>
            <Box padding={2}>
              <Box component="form" noValidate onSubmit={(event) => addComment(event, photo)} marginBottom={5}>
                <Typography fontSize={18} fontWeight={300}>
                  Add a new comment:
                </Typography>
                <TextField fullWidth variant="outlined" placeholder="Write a comment" id="comment" name="comment" autoComplete="comment" />
                <Button type="submit" variant="contained" color="primary" sx={{ marginTop: 2 }}>
                  Add Comment
                </Button>
              </Box>
              {photo?.comments?.length ? (
                photo?.comments?.map((comment, commentIndex) => {
                  return (
                    <Stack key={commentIndex} direction="row" gap={1} paddingY={1}>
                      <Avatar sx={{ width: 24, height: 24, fontSize: 12, cursor: "pointer", "&:hover": { opacity: 0.8 }, transition: "0.3s", bgcolor: stringToColor(`${comment?.user?.first_name?.[0]}${comment?.user?.last_name?.[0]}`) }} onClick={() => redirectToUser(userData._id)}>
                        {comment?.user?.first_name?.[0]}
                        {comment?.user?.last_name?.[0]}
                      </Avatar>
                      <Box>
                        <Typography fontWeight={300}>
                          <Link to={"/users/" + comment.user._id} className="main-username">
                            {comment?.user?.first_name}&nbsp;
                            {comment?.user?.last_name}
                          </Link>
                          &nbsp;{comment.comment}
                        </Typography>
                        <Typography variant="body2" fontSize={11} color="GrayText">
                          {comment?.date_time}
                        </Typography>
                      </Box>
                    </Stack>
                  );
                })
              ) : (
                <Typography fontSize={12} fontWeight={300} color="gray" textAlign="center" paddingY={2}>
                  No comments found
                </Typography>
              )}
            </Box>
            {index !== (photosData?.length || 0) - 1 && <Divider />}
          </Box>
        ))
      ) : (
        <Typography variant="h6" textAlign="center">
          No photos found
        </Typography>
      )}
    </Box>
  );
}

export default UserPhotos;
