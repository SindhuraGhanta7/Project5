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
    };
  }

  componentDidMount() {
    // Use FetchModel to get the list of users
    FetchModel('/user/list')
      .then((response) => {
        const userList = response.data;
        this.setState({ userList });
      })
      .catch((error) => {
        console.error(error);
      });
  }

  handleUserClick(userId) {
    // Navigate to the relative URL
    window.location.href = `/photo-share.html#/users/${userId}`;
    window.location.reload();
  }

  render() {
    const { userList } = this.state;
    return (
      <div className="user-list-container">
        <List component="nav">
          {userList.map((user, index) => (
            <div key={index}>
              <ListItem
                button
                onClick={() => this.handleUserClick(user._id)}
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

