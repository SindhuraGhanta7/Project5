import React from 'react';
import {
  List,
  ListItemText,
  ListItemButton,
} from '@mui/material';
import './userList.css';
import axios from 'axios';

class UserList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      users: [],
    };

    this.handleUserClick = this.handleUserClick.bind(this);
  }

  componentDidMount() {
    this.handleUserListChange();
  }

  handleUserListChange() {
    axios.get("/user/list")
      .then((response) => {
        this.setState({
          users: response.data
        });
      })
      .catch(error => {
        console.error("There was an error fetching the user list!", error);
      });
  }

  handleUserClick(userId) {
    console.log(`Navigating to user: ${userId}`);
    
    const { users } = this.state;
    const userExists = users.some(user => user._id === userId);
    
    if (userExists) {
      window.location.href = `/photo-share.html#/users/${userId}`;
      window.location.reload();
    } else {
      console.error('User not found in the list.');
    }
  }

  render() {
    return this.state.users.length > 0 ? (
      <div>
        <List component="nav">
          {this.state.users.map(user => (
            <ListItemButton
              selected={this.state.user_id === user._id}
              key={user._id}
              divider={true}
              component="a"
              href={"#/users/" + user._id}
            >
              <ListItemText primary={`${user.first_name} ${user.last_name}`} />
            </ListItemButton>
          ))}
        </List>
      </div>
    ) : (
      <div>No users found.</div>
    );
  }
}

export default UserList;
