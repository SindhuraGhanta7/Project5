import React from 'react';
import {
    Box,
    Button,
    TextField
} from '@mui/material';
import './userDetail.css';
import axios from 'axios';

/**
 * Define UserDetail, a React component of project #5
 */
class UserDetail extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            user: undefined,
            error: null, // To capture any errors during API calls
        };
        this.cancelTokenSource = axios.CancelToken.source(); // Initialize cancel token for axios requests
    }

    // Fetch user details when the component mounts or updates
    componentDidMount() {
        const new_user_id = this.props.match.params.userId;
        this.handleUserChange(new_user_id);
    }

    // Handle component updates to fetch new user details when userId changes
    componentDidUpdate(prevProps) {
        const new_user_id = this.props.match.params.userId;
        const current_user_id = this.state.user?._id;
        if (current_user_id !== new_user_id) {
            this.handleUserChange(new_user_id);
        }
    }

    // Clean up ongoing API requests when the component unmounts
    componentWillUnmount() {
        this.cancelTokenSource.cancel('Component unmounted, request aborted.');
    }

    // Fetch user details from the backend
    handleUserChange(user_id) {
        axios.get(`/user/${user_id}`, { cancelToken: this.cancelTokenSource.token })
            .then((response) => {
                const new_user = response.data;
                // Avoid unnecessary state update if the data is the same
                if (this.state.user?._id !== new_user._id) {
                    this.setState({
                        user: new_user,
                        error: null, // Reset error if the request is successful
                    });
                    const main_content = `User Details for ${new_user.first_name} ${new_user.last_name}`;
                    this.props.changeMainContent(main_content);
                }
            })
            .catch((error) => {
                if (axios.isCancel(error)) {
                    console.log('Request canceled:', error.message);
                } else {
                    console.error('Error fetching user details:', error);
                    this.setState({
                        error: 'Failed to load user details. Please try again later.',
                    });
                }
            });
    }

    render() {
        const { user, error } = this.state;

        return user ? (
            <div>
                <Box component="form" noValidate autoComplete="off">
                    <div>
                        <Button variant="contained" component="a" href={`#/photos/${user._id}`}>
                            User Photos
                        </Button>
                    </div>
                    <div>
                        <TextField id="first_name" label="First Name" variant="outlined" disabled fullWidth
                                   margin="normal" value={user.first_name} />
                    </div>
                    <div>
                        <TextField id="last_name" label="Last Name" variant="outlined" disabled fullWidth
                                   margin="normal" value={user.last_name} />
                    </div>
                    <div>
                        <TextField id="location" label="Location" variant="outlined" disabled fullWidth
                                   margin="normal" value={user.location} />
                    </div>
                    <div>
                        <TextField id="description" label="Description" variant="outlined" multiline rows={4}
                                   disabled fullWidth margin="normal" value={user.description} />
                    </div>
                    <div>
                        <TextField id="occupation" label="Occupation" variant="outlined" disabled fullWidth
                                   margin="normal" value={user.occupation} />
                    </div>
                </Box>
                {error && <div style={{ color: 'red' }}>{error}</div>} {/* Show error message if any */}
            </div>
        ) : (
            <div>Loading...</div> // Show a loading message while fetching user data
        );
    }
}

export default UserDetail;
