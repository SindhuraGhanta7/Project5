import { Button, Typography, Box, Avatar } from "@mui/material";
import { useHistory } from "react-router-dom";
import "./userDetail.css";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";

import React, { useEffect, useState } from "react";
import axios from "axios";

function UserDetail(props) {
  function stringToColor(string) {
    let hash = 0;
    let i;
    /* eslint-disable no-bitwise */
    for (i = 0; i < string.length; i += 1) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = "#";
    for (i = 0; i < 3; i += 1) {
      const value = (hash >> (i * 8)) & 0xff;
      color += `00${value.toString(16)}`.slice(-2);
    }
    /* eslint-enable no-bitwise */
    return color;
  }
  const [userData, setUserData] = useState();
  const [recentPhoto, setRecentPhoto] = useState();
  const [mostComments, setMostComments] = useState();
  const history = useHistory();
  useEffect(() => {
    axios
      .get("http://localhost:3000/user/" + props.match.params.userId)
      .then((res) => {
        setUserData(res.data);
        props.setTitle(`${res?.data?.first_name} ${res?.data?.last_name}`);
      })
      .catch((err) => console.log(err));
    axios
      .get("http://localhost:3000/photos/latest/" + props.match.params.userId)
      .then((res) => {
        setRecentPhoto(res.data);
      })
      .catch((err) => console.log(err));
    axios
      .get("http://localhost:3000/photos/most-comments/" + props.match.params.userId)
      .then((res) => {
        setMostComments(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [props.match.params.userId]);

  console.log(recentPhoto, mostComments, "RECENT PHOTO");
  return (
    <Box>
      <Avatar sx={{ bgcolor: stringToColor(`${userData?.first_name?.[0]}${userData?.last_name?.[0]}`), width: 100, height: 100, fontSize: 40 }}>
        {userData?.first_name?.[0]}
        {userData?.last_name?.[0]}
      </Avatar>
      <Typography fontSize={30}>{userData?.first_name}&apos;s Profile</Typography>
      <Typography>First Name: {userData?.first_name}</Typography>
      <Typography>Last Name: {userData?.last_name}</Typography>
      <Typography>Occupation: {userData?.occupation}</Typography>
      <Typography>Location: {userData?.location}</Typography>
      <Typography>Description: {userData?.description}</Typography>
      {userData?._id && (
        <Button variant="contained" onClick={() => history.push("/photos/" + userData._id)} sx={{ marginTop: "12px" }}>
          See {userData?.first_name} {userData?.last_name}&apos;s photos
        </Button>
      )}
      <Box sx={{ width: "100%", borderTop: "1px solid gray", paddingTop: "20px", display: "flex", flexDirection: "row", marginTop: "20px" }}>
        {recentPhoto && (
          <Box sx={{ width: "50%", cursor: "pointer" }} onClick={() => history.push("/photos/" + props.match.params.userId + "?imageId=" + (recentPhoto?.file_name || ""))}>
            <Box sx={{ width: "400px", height: "100%", display: "flex", flexDirection: "column" }}>
              <Typography>Recent Photo</Typography>
              <Box sx={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "black" }}>
                <img src={`../../images/${recentPhoto?.file_name}`} alt="recent" className="main-image" />
              </Box>
            </Box>
            <Box display="flex" flexDirection="row" alignItems="center" gap={1} marginTop={2}>
              <ChatBubbleOutlineIcon /> <Typography sx={{ marginRight: 3 }}>{recentPhoto?.comments?.length}</Typography>
              <FavoriteBorderIcon /> <Typography>{recentPhoto?.liked_by?.length || 0}</Typography>
            </Box>
          </Box>
        )}
        {mostComments && (
          <Box sx={{ width: "50%", cursor: "pointer" }} onClick={() => history.push("/photos/" + props.match.params.userId + "?imageId=" + (mostComments?.file_name || ""))}>
            <Box sx={{ width: "400px", height: "100%", display: "flex", flexDirection: "column" }}>
              <Typography>Most Comments</Typography>
              <Box sx={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "black" }}>
                <img src={`../../images/${mostComments?.file_name}`} alt="most comments" className="main-image" />
              </Box>
            </Box>
            <Box display="flex" flexDirection="row" alignItems="center" gap={1} marginTop={2}>
              <ChatBubbleOutlineIcon /> <Typography sx={{ marginRight: 3 }}>{mostComments?.comments?.length}</Typography>
              <FavoriteBorderIcon /> <Typography>{mostComments?.liked_by?.length || 0}</Typography>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default UserDetail;
