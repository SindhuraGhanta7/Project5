import React, { useEffect, useState } from "react";
import { List, ListItem, ListItemText } from "@mui/material";
import "./userList.css";
import { useHistory, Link } from "react-router-dom";
import axios from "axios";

function UserList() {
  const [userData, setUserData] = useState([]);
  const history = useHistory();

  useEffect(() => {
    axios
      .get("http://localhost:3000/user/list/")
      .then((res) => {
        setUserData(res.data);
      })
      .catch((err) => console.log(err));
  }, []);
  return (
    <div>
      <List component="nav">
        {userData.map((user, index) => (
          <Link to={"/users/" + user._id} key={index} className={`main-user-list`}>
            <ListItem onClick={() => history.push("/users/" + user._id)}>
              <ListItemText primary={`${user.first_name} ${user.last_name}`} />
            </ListItem>
          </Link>
        ))}
      </List>
    </div>
  );
}

export default UserList;
