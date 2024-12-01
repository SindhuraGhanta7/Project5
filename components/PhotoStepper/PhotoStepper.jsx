import React from 'react';
import { Stepper, Step, StepLabel, Button, Typography, Box, CircularProgress } from '@mui/material';
import axios from 'axios';
import PropTypes from 'prop-types';

/**
 * PhotoStepper Component to display photos in a stepper format.
 */
class PhotoStepper extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      photos: [],  // List of photos for the selected user
      activeStep: 0,  // Index of the current step (photo)
      loading: true,  // Loading state while fetching photos
      error: null,  // Error message if there's an issue fetching photos
    };
  }

  componentDidMount() {
    this.fetchPhotos();
  }

  // Fetch photos from the server for the selected user
  fetchPhotos = () => {
    const { userId } = this.props; // Assuming userId is passed as a prop

    if (!userId) {
      this.setState({ error: 'User not found or no user selected.' });
      return;
    }

    axios.get(`/photos/photos/${userId}`)
      .then(response => {
        this.setState({
          photos: response.data, // Assuming the response contains an array of photos
          loading: false,
          error: null,
        });
      })
      .catch(error => {
        this.setState({
          loading: false,
          error: error.response?.data?.message || 'Error fetching photos.',
        });
      });
  };

  // Handle step change (navigation)
  handleNext = () => {
    this.setState(prevState => ({
      activeStep: prevState.activeStep + 1,
    }));
  };

  handleBack = () => {
    this.setState(prevState => ({
      activeStep: prevState.activeStep - 1,
    }));
  };

  render() {
    const { photos, activeStep, loading, error } = this.state;

    return (
      <Box>
        {loading && <CircularProgress />}
        {error && <Typography variant="h6" color="error">{error}</Typography>}
        
        {photos.length === 0 && !loading && !error && (
          <Typography variant="h6">No photos available.</Typography>
        )}

        {photos.length > 0 && (
          <>
            <Stepper activeStep={activeStep} alternativeLabel>
              {photos.map((photo, index) => (
                <Step key={index}>
                  <StepLabel>{`Photo ${index + 1}`}</StepLabel>
                </Step>
              ))}
            </Stepper>

            <Box>
              <img src={photos[activeStep].url} alt={`Photo ${activeStep + 1}`} style={{ width: '100%', height: 'auto', marginBottom: '20px' }} />
            </Box>

            <Box>
              <Button
                variant="contained"
                disabled={activeStep === 0}
                onClick={this.handleBack}
                style={{ marginRight: '10px' }}
              >
                Back
              </Button>
              <Button
                variant="contained"
                disabled={activeStep === photos.length - 1}
                onClick={this.handleNext}
              >
                Next
              </Button>
            </Box>
          </>
        )}
      </Box>
    );
  }
}

PhotoStepper.propTypes = {
  userId: PropTypes.string.isRequired, // Ensure userId is passed as a required prop
};

export default PhotoStepper;
