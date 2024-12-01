import React from 'react';
import { AppBar, Toolbar, Typography, Button, Divider, Snackbar, Alert } from '@mui/material';
import './TopBar.css';
import axios from 'axios';

/**
 * Define TopBar, a React component for project #5
 */
class TopBar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            app_info: undefined,
            photo_upload_show: false,
            photo_upload_error: false,
            photo_upload_success: false,
        };
        this.cancelTokenSource = axios.CancelToken.source(); // Initialize cancel token for axios requests
    }

    // Fetch the app info once when the component mounts
    componentDidMount() {
        this.handleAppInfoChange();
    }

    // Clean up when the component unmounts
    componentWillUnmount() {
        // Cancel the API request if the component is unmounted
        this.cancelTokenSource.cancel('Component unmounted, request aborted.');
    }

    // Fetch app info from the backend (only once)
    handleAppInfoChange() {
        const { app_info } = this.state;
        if (app_info === undefined) {
            axios.get("/test/info", { cancelToken: this.cancelTokenSource.token })
                .then((response) => {
                    this.setState({ app_info: response.data });
                })
                .catch((error) => {
                    if (axios.isCancel(error)) {
                        console.log('Request canceled due to component unmounting:', error.message);
                    } else {
                        console.error('Error fetching app info:', error);
                    }
                });
        }
    }

    // Handle closing of the snackbar notifications
    handleClose = () => {
        this.setState({
            photo_upload_show: false,
            photo_upload_error: false,
            photo_upload_success: false,
        });
    };

    // Handle the photo upload (placeholder for actual upload logic)
    handleNewPhoto = (event) => {
        const file = event.target.files[0];
        if (file) {
            // Simulate a successful photo upload process
            this.setState({
                photo_upload_show: true,
                photo_upload_success: true,
            });
        } else {
            this.setState({
                photo_upload_show: true,
                photo_upload_error: true,
            });
        }
    };

    render() {
        const { user, selectedUser, handleLogout } = this.props; // Destructure handleLogout from props

        // Check for logged-in user (user) and selected user (selectedUser)
        const displayName = selectedUser ? `${selectedUser.first_name} ${selectedUser.last_name}` : '';

        return this.state.app_info ? (
            <AppBar className="topbar-appBar" position="absolute">
                <Toolbar>
                    <Typography variant="h5" component="div" sx={{ flexGrow: 0 }} color="inherit">
                        Group 7
                    </Typography>
                    <Divider orientation="vertical" flexItem />
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1, textAlign: 'center' }} color="inherit">
                        {user ? (
                            <>
                                <span>{"Hi " + user.first_name}</span>
                                <Divider orientation="vertical" flexItem />
                                {/* Display Photos of selectedUser if available */}
                                {selectedUser ? (
                                    <span>Photos of {displayName}</span>
                                ) : (
                                    <span />
                                )}
                            </>
                        ) : (
                            "Please Login"
                        )}
                    </Typography>
                    <Divider orientation="vertical" flexItem />
                    <Typography variant="h5" component="div" sx={{ flexGrow: 0 }} color="inherit">
                        Version: {this.state.app_info.version}
                    </Typography>
                    <Divider orientation="vertical" flexItem />
                    {user && (
                        <>
                            {/* Logout Button */}
                            <Button variant="contained" onClick={handleLogout}>Logout</Button>
                            <Divider orientation="vertical" flexItem />
                            {/* Add Photo Button */}
                            <Button component="label" variant="contained">
                                Add Photo
                                <input
                                    type="file"
                                    accept="image/*"
                                    hidden
                                    onChange={this.handleNewPhoto}
                                />
                            </Button>
                            {/* Snackbar for photo upload status */}
                            <Snackbar anchorOrigin={{ vertical: 'top', horizontal: 'left' }} open={this.state.photo_upload_show} autoHideDuration={6000} onClose={this.handleClose}>
                                {this.state.photo_upload_success ? (
                                    <Alert onClose={this.handleClose} severity="success" sx={{ width: '100%' }}>Photo Uploaded</Alert>
                                ) : this.state.photo_upload_error ? (
                                    <Alert onClose={this.handleClose} severity="error" sx={{ width: '100%' }}>Error Uploading Photo</Alert>
                                ) : null}
                            </Snackbar>
                        </>
                    )}
                </Toolbar>
            </AppBar>
        ) : (
            <div />
        );
    }
}

export default TopBar;
