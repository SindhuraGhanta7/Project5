import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography
} from '@mui/material';
import fetchModel from '../lib/fetchModelData.js';
import './TopBar.css';

/**
 * Define TopBar, a React component of project #5
 */
class TopBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      version: null, 
      loading: true, 
      error: null, 
    };
  }

  componentDidMount() {
    fetchModel('/test/info')
      .then(response => {
        this.setState({ version: response.data.load_date_time, loading: false });
      })
      .catch(error => {
        this.setState({ loading: false, error });
      });
  }

  render() {
    const { version, loading, error } = this.state;

    return (
      <AppBar className="topbar-appBar" position="absolute">
        <Toolbar>
          <Typography variant="h5" color="inherit">
            This is the TopBar component
          </Typography>
          {loading && <Typography variant="body1" color="inherit">Loading version...</Typography>}
          {error && <Typography variant="body1" color="inherit">Error: {error.statusText}</Typography>}
          {version && (
            <Typography variant="body1" color="inherit">
              Version: {version}
            </Typography>
          )}
        </Toolbar>
      </AppBar>
    );
  }
}

export default TopBar;
