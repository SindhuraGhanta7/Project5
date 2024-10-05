import React from 'react';
import {
  Divider,
  List,
  ListItem,
  ListItemText,
  Typography,
} from '@mui/material';
import fetchModel from '../lib/fetchModelData.js'; 
import './userList.css';

/**
 * Define UserList, a React component of project #5
 */
class UserList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      users: [], 
      loading: true, 
      error: null, 
    };
  }

  componentDidMount() {
    fetchModel('/user/list')
      .then(response => {
        this.setState({ users: response.data, loading: false });
      })
      .catch(error => {
        this.setState({ loading: false, error });
      });
  }

  render() {
    const { users, loading, error } = this.state;

    if (loading) {
      return <Typography variant="body1">Loading users...</Typography>;
    }

    if (error) {
      return <Typography variant="body1">Error loading users: {error.statusText}</Typography>;
    }

    return (
      <div>
        <Typography variant="body1">
          This is the user list, which takes up 3/12 of the window.
          You might choose to use <a href="https://mui.com/components/lists/">Lists</a> and <a href="https://mui.com/components/dividers/">Dividers</a> to
          display your users like so:
        </Typography>
        <List component="nav">
          {users.map(user => (
            <div key={user._id}>
              <ListItem>
                <ListItemText primary={`${user.first_name} ${user.last_name}`} />
              </ListItem>
              <Divider />
            </div>
          ))}
        </List>
        <Typography variant="body1">
          The model now comes from the server.
        </Typography>
      </div>
    );
  }
}

export default UserList;
