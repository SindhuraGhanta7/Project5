import React, { useEffect, useState } from 'react';
import { List, ListItemText, ListItemButton } from '@mui/material';
import { useHistory } from 'react-router-dom'; 
import './userList.css';
import axios from 'axios';

function UserList() {
  const [users, setUsers] = useState([]);
  const history = useHistory(); 

  const handleUserListChange = () => {
    axios.get("/user/list")
      .then((response) => {
        setUsers(response.data);
      })
      .catch(error => {
        console.error("There was an error fetching the user list!", error);
      });
  };

  useEffect(() => {
    handleUserListChange();
  }, []);

  const handleUserClick = (userId) => {
    console.log(`Navigating to user: ${userId}`);
    history.push(`/users/${userId}`); 
  };

  return users.length > 0 ? (
    <div>
      <List component="nav">
        {users.map(user => (
          <ListItemButton
            key={user._id}
            divider={true}
            onClick={() => handleUserClick(user._id)} 
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

export default UserList;
