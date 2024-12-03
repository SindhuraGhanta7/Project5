import { Box, Grid, Modal, Typography } from "@mui/material";
import axios from "axios";
import React, { useEffect, useState } from "react";
import "./favorites.css";
import moment from "moment";

function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState();

  useEffect(() => {
    axios
      .get("http://localhost:3000/photos/favorites")
      .then((res) => setFavorites(res.data))
      .catch((err) => console.log(err));
  }, []);

  const onFavoriteRemove = (photo) => {
    axios
      .post("http://localhost:3000/photos/favorite/" + photo._id)
      .then(() => {
        axios
          .get("http://localhost:3000/photos/favorites")
          .then((res) => {
            setFavorites(res.data);
            setIsModalOpen(false);
          })
          .catch((err) => console.log(err));
      })
      .catch((err) => console.log(err));
  };

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        backgroundImage:
          "url(https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        padding: "40px 20px",
        boxSizing: "border-box",
        color: "#fff",
      }}
    >
      <Box
        sx={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "20px",
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          borderRadius: "10px",
        }}
      >
        <Typography variant="h4" sx={{ marginBottom: "20px" }}>
          Favorites
        </Typography>

        {/* Modal for Image Preview */}
        <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              bgcolor: "background.paper",
              border: "2px solid #000",
              boxShadow: 24,
              p: 4,
              maxWidth: "90%",
              width: "600px",
            }}
          >
            <Typography
              id="modal-modal-title"
              variant="h6"
              component="h2"
              marginBottom={4}
              sx={{ color: "#fff" }}
            >
              Image by {selectedImage?.user_id?.first_name}{" "}
              {selectedImage?.user_id?.last_name}
            </Typography>
            <img
              src={`../../images/${selectedImage?.file_name}`}
              alt="preview"
              className="img-style"
              style={{
                width: "100%",
                height: "auto",
                objectFit: "cover",
                borderRadius: "8px",
              }}
            />
            <Typography variant="body2" fontSize={12} sx={{ color: "#fff", marginTop: "10px" }}>
              Posted on: {moment(selectedImage?.date_time).format("MMMM Do YYYY")} at{" "}
              {moment(selectedImage?.date_time).format("h:mm a")}
            </Typography>
            <Typography
              onClick={() => onFavoriteRemove(selectedImage)}
              sx={{
                textDecoration: "underline",
                cursor: "pointer",
                color: "#f44336",
                marginTop: "10px",
              }}
            >
              Remove from favorites
            </Typography>
          </Box>
        </Modal>

        {/* Display Favorite Images */}
        {favorites?.length > 0 ? (
          <Grid container spacing={2} sx={{ marginTop: 4 }}>
            {favorites.map((photo) => (
              <Grid
                item
                xs={12} sm={6} md={4}
                key={photo._id}
                onClick={() => {
                  setSelectedImage(photo);
                  setIsModalOpen(true);
                }}
                sx={{
                  cursor: "pointer",
                  borderRadius: "8px",
                  overflow: "hidden",
                  boxShadow: "0 4px 6px rgba(0,0,0,0.2)",
                  transition: "transform 0.3s ease-in-out",
                  "&:hover": {
                    transform: "scale(1.05)",
                  },
                }}
              >
                <img
                  src={`../../images/${photo?.file_name}`}
                  className="image-style"
                  style={{
                    width: "100%",
                    height: "auto",
                    objectFit: "cover",
                    borderRadius: "8px",
                  }}
                />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography sx={{ color: "#fff" }}>No favorite photos added yet</Typography>
        )}
      </Box>
    </Box>
  );
}

export default Favorites;
