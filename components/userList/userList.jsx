import React from 'react';
import {
  List,
  ListItemButton,
  ListItemText,
} from '@mui/material';
import { Link } from 'react-router-dom'; // Import Link for routing
import './userList.css';
import axios from 'axios';

/**
 * Define UserList, a React component of project #5
 */
class UserList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            users: undefined,
            user_id: undefined
        };
    }

    componentDidMount() {
        this.handleUserListChange();
    }

    componentDidUpdate() {
        const new_user_id = this.props.match?.params.userId;
        const current_user_id = this.state.user_id;
        if (current_user_id !== new_user_id) {
            this.handleUserChange(new_user_id);
        }
    }

    handleUserChange(user_id) {
        this.setState({
            user_id: user_id
        });
    }

    handleUserListChange() {
        axios.get("/user/list")
            .then((response) => {
                this.setState({
                    users: response.data
                });
            });
    }

    render() {
        return this.state.users ? (
            <div>
                <List component="nav">
                    {
                        this.state.users.map(user => (
<ListItemButton
  selected={this.state.user_id === user._id}
  key={user._id}
  divider={true}
  component={Link} // Use Link for client-side navigation
  to={`/users/${user._id}`} // Correct path without extra # or /# symbols
  onClick={() => this.props.selectUser(user)} // Call selectUser when a user is clicked
>
  <ListItemText primary={`${user.first_name} ${user.last_name}`} />
</ListItemButton>



                        ))
                    }
                </List>
            </div>
        ) : (
            <div />
        );
    }
}

export default UserList;
