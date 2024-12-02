import React from 'react';
import {
    Button, TextField,
    ImageListItem, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Typography
} from '@mui/material';
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
            current_photo_id: undefined
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
        const { photos, current_index } = this.state;

        return this.state.user_id && photos && photos.length > 0 ? (
            <div>
                <div>
                    <Button variant="contained" component="a" href={`#/users/${this.state.user_id}`}>
                        User Detail
                    </Button>
                </div>
                {/* Display only one photo at a time */}
                <div key={photos[current_index]._id}>
                    <TextField label="Photo Date" variant="outlined" disabled fullWidth margin="normal" value={photos[current_index].date_time} />
                    <ImageListItem key={photos[current_index].file_name}>
                        <img
                            src={`images/${photos[current_index].file_name}?w=164&h=164&fit=crop&auto=format&dpr=2 2x`}
                            alt={photos[current_index].file_name}
                            loading="lazy"
                        />
                    </ImageListItem>
                    <div>
                        {photos[current_index].comments ? (
                            photos[current_index].comments.map((comment) => (
                                <div key={comment._id}>
                                    <TextField label="Comment Date" variant="outlined" disabled fullWidth margin="normal" value={comment.date_time} />
                                    <TextField label="User" variant="outlined" disabled fullWidth margin="normal"
                                        value={`${comment.user.first_name} ${comment.user.last_name}`}
                                        component="a" href={`#/users/${comment.user._id}`} />
                                    <TextField label="Comment" variant="outlined" disabled fullWidth margin="normal" multiline rows={4} value={comment.comment} />
                                </div>
                            ))
                        ) : (
                            <Typography>No Comments</Typography>
                        )}
                        <Button photo_id={photos[current_index]._id} variant="contained" onClick={this.handleShowAddComment}>
                            Add Comment
                        </Button>
                    </div>
                </div>

                {/* Navigation Buttons */}
                <div>
                    <Button variant="contained" onClick={this.handlePreviousPhoto} disabled={current_index === 0}>
                        Previous
                    </Button>
                    <Button variant="contained" onClick={this.handleNextPhoto} disabled={current_index === photos.length - 1}>
                        Next
                    </Button>
                </div>

                {/* Dialog for Adding Comments */}
                <Dialog open={this.state.add_comment}>
                    <DialogTitle>Add Comment</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Enter New Comment for Photo
                        </DialogContentText>
                        <TextField
                            autoFocus
                            margin="dense"
                            id="comment"
                            label="Comment"
                            multiline rows={4}
                            fullWidth
                            variant="standard"
                            onChange={this.handleNewCommentChange}
                            defaultValue={this.state.new_comment}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.handleCancelAddComment}>Cancel</Button>
                        <Button onClick={this.handleSubmitAddComment}>Add</Button>
                    </DialogActions>
                </Dialog>
            </div>
        ) : (
            <div>
                <Typography>No Photos</Typography>
            </div>
        );
    }
}

export default UserPhotos;
