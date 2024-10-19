import React from 'react';
import {
  List,
  ListItemText,
  ListItemButton, // Added this import
} from '@mui/material';
import './userList.css';
import axios from 'axios';

class UserList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userList: [], // Changed to userList
      // error: null, // Uncomment if needed
    };

    // Bind the method to the instance
    this.handleUserClick = this.handleUserClick.bind(this);
  }

  componentDidMount() {
    // Fetch the list of users when the component mounts
    this.handleUserListChange();
  }

  handleUserListChange() {
    axios.get("/user/list")
      .then((response) => {
        this.setState({
          userList: response.data // Fixed state update
        });
      });
  }

  handleUserClick(userId) {
    console.log(`Navigating to user: ${userId}`);
    
    const { userList } = this.state;
    const userExists = userList.some(user => user._id === userId);
    
    if (userExists) {
      window.location.href = `/photo-share.html#/users/${userId}`;
      window.location.reload();
    } else {
      console.error('User not found in the list.');
    }
  }

  render() {
    return this.state.userList.length ? ( // Check userList
      <div>
        <List component="nav">
          {this.state.userList.map(user => (
            <ListItemButton
              selected={this.state.user_id === user._id}
              key={user._id}
              divider={true}
              component="a"
              href={"#/users/" + user._id}
            >
              <ListItemText primary={user.first_name + " " + user.last_name} />
            </ListItemButton>
          ))}
        </List>
      </div>
    ) : (
      <div/>
    );
  }
}

export default UserList;
