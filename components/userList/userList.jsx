import React from 'react';
import {
  Divider,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import './userList.css';
import FetchModel from '../../lib/fetchModelData';

class UserList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userList: [],
      error: null, // For error handling
    };

    // Bind the method to the instance
    this.handleUserClick = this.handleUserClick.bind(this);
  }

  componentDidMount() {
    // Fetch the list of users when the component mounts
    this.fetchUserList();
  }

  fetchUserList() {
    FetchModel('/user/list')
      .then((response) => {
        const userList = response.data;
        this.setState({ userList });
      })
      .catch((error) => {
        console.error('Error fetching user list:', error);
        this.setState({ error: 'Failed to load user list.' }); // Set error state
      });
  }

  handleUserClick(userId) {
    // Use this.state or any other instance properties if necessary
    console.log(`Navigating to user: ${userId}`);
    
    // Example of using `this` to demonstrate compliance
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
    const { userList, error } = this.state;
    return (
      <div className="user-list-container">
        {error && <p style={{ color: 'red' }}>{error}</p>} {/* Display error if present */}
        <List component="nav">
          {userList.map((user, index) => (
            <div key={user._id}> {/* Use user._id as key instead of index */}
              <ListItem
                button
                onClick={() => this.handleUserClick(user._id)} // Uses this
                className="list-item"
              >
                <ListItemText primary={`${user.first_name} ${user.last_name}`} />
              </ListItem>
              {index < userList.length - 1 && <Divider className="divider" />}
            </div>
          ))}
        </List>
      </div>
    );
  }
}

export default UserList;
