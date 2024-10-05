import React from 'react';
import {
  Typography
} from '@mui/material';
import './userDetail.css';
import FetchModel from '../../lib/fetchModelData';

class UserDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
    };

    this.handleViewPhotosClick = this.handleViewPhotosClick.bind(this);
  }

  componentDidMount() {
    const userID = this.props.match.params.userId;
    FetchModel(`/user/${userID}`)
      .then((response) => {
        const user = response.data;
        this.setState({ user });
      })
      .catch((error) => {
        console.error(error);
      });
  }

  handleViewPhotosClick(userId) {
    window.location.href = `/photo-share.html#/photos/${userId}`;
    window.location.reload();
  }

  render() {
    const { user } = this.state;
    console.log(user);

    if (!user) {
      return <Typography variant="body1">Loading user details...</Typography>;
    }

    return (
      <div className="user-detail-container">
        <Typography variant="body1" className="user-name">
          User Details for : {user.first_name} {user.last_name}<br />
        </Typography>
        <Typography variant="body1" className="user-info">
          Location : {user.location}<br />
          Description : {user.description}<br />
          Occupations : {user.occupation}<br />
          <button className="view-photos-button" onClick={() => this.handleViewPhotosClick(user._id)}>View Photos</button>
        </Typography>
      </div>
    );
  }
}


export default UserDetail;
