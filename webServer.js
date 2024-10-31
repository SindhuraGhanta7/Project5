/**
 * This builds on the webServer of previous projects in that it exports the
 * current directory via webserver listing on a hard code (see portno below)
 * port. It also establishes a connection to the MongoDB named 'project6'.
 *
 * To start the webserver run the command:
 *    node webServer.js
 *
 * Note that anyone able to connect to localhost:portNo will be able to fetch
 * any file accessible to the current user in the current directory or any of
 * its children.
 *
 * This webServer exports the following URLs:
 * /            - Returns a text status message. Good for testing web server
 *                running.
 * /test        - Returns the SchemaInfo object of the database in JSON format.
 *                This is good for testing connectivity with MongoDB.
 * /test/info   - Same as /test.
 * /test/counts - Returns the population counts of the cs collections in the
 *                database. Format is a JSON object with properties being the
 *                collection name and the values being the counts.
 *
 * The following URLs need to be changed to fetch their reply values from the
 * database:
 * /user/list         - Returns an array containing all the User objects from
 *                      the database (JSON format).
 * /user/:id          - Returns the User object with the _id of id (JSON
 *                      format).
 * /photosOfUser/:id  - Returns an array with all the photos of the User (id).
 *                      Each photo should have all the Comments on the Photo
 *                      (JSON format).
 */

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const async = require("async");
const express = require("express");
const session = require("express-session");
const path = require('path');
const app = express();

// Load the Mongoose schema for User, Photo, and SchemaInfo
const User = require("./schema/user.js");
const Photo = require("./schema/photo.js");
const SchemaInfo = require("./schema/schemaInfo.js");

// Set Mongoose options
mongoose.set("strictQuery", false);
mongoose.connect("mongodb://127.0.0.1/project6", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Middleware to parse JSON bodies
app.use(express.json());

// Session management
app.use(session({
  secret: 'your-secret-key', // Change this to a secure secret
  resave: false,
  saveUninitialized: true,
}));

// Serve static files from the current directory
app.use(express.static(__dirname));

// Serve the main page
app.get("/", function (request, response) {
  response.send(`<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome</title>
      <script>
        window.onload = function() {
          alert("Welcome to the site! Please log in to continue.");
        };
      </script>
    </head>
    <body>
      <h1>Welcome to the Site</h1>
      <p>Please log in to access more features.</p>
    </body>
    </html>`);
});

// Serve login form
app.get('/login', (req, res) => {
  const loginForm = `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Login</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                background-color: #f4f4f4;
            }
            form {
                background: white;
                padding: 20px;
                border-radius: 5px;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            }
            input {
                margin-bottom: 10px;
                padding: 10px;
                width: 100%;
            }
        </style>
    </head>
    <body>
        <form id="login-form">
            <h2>Login</h2>
            <input type="text" id="login_name" placeholder="Username" required>
            <input type="password" id="password" placeholder="Password" required>
            <button type="submit">Login</button>
        </form>
        <script>
            document.getElementById('login-form').addEventListener('submit', async (event) => {
                event.preventDefault();

                const login_name = document.getElementById('login_name').value;
                const password = document.getElementById('password').value;

                const response = await fetch('/admin/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ login_name, password })
                });

                if (response.ok) {
                    window.location.href = '/'; // Redirect to home on success
                } else {
                    alert('Login failed! Please check your credentials.');
                }
            });
        </script>
    </body>
    </html>`;
    
  res.send(loginForm); // Send the login form
});

// Test routes
app.get("/test/:p1?", function (request, response) {
  const param = request.params.p1 || "info";

  if (param === "info") {
    SchemaInfo.find({}, function (err, info) {
      if (err) {
        response.status(500).send(JSON.stringify(err));
        return;
      }
      if (info.length === 0) {
        response.status(500).send("Missing SchemaInfo");
        return;
      }
      response.json(info[0]);
    });
  } else if (param === "counts") {
    const collections = [
      { name: "user", collection: User },
      { name: "photo", collection: Photo },
      { name: "schemaInfo", collection: SchemaInfo },
    ];
    async.each(collections, function (col, done_callback) {
      col.collection.countDocuments({}, function (err, count) {
        col.count = count;
        done_callback(err);
      });
    }, function (err) {
      if (err) {
        response.status(500).send(JSON.stringify(err));
      } else {
        const obj = {};
        collections.forEach(function (col) {
          obj[col.name] = col.count;
        });
        response.json(obj);
      }
    });
  } else {
    response.status(400).send("Bad param " + param);
  }
});

// URL /user/list - Returns all the User objects.
app.get("/user/list", function (request, response) {
  User.find({}, function (err, users) {
    if (err) {
      response.status(400).send(JSON.stringify(err));
      return;
    }
    if (users.length === 0) {
      response.status(400).send("Missing Users Info");
      return;
    }

    const userList = users.map(function (user) {
      return {
        _id: user._id.toString(),
        first_name: user.first_name,
        last_name: user.last_name
      };
    });
    response.json(userList);
  });
});

// URL /user/:id - Returns the information for User (id).
app.get("/user/:id", function (request, response) {
  const id = request.params.id;

  User.findById(id, { __v: 0 }, function (err, user) {
    if (err) {
      response.status(400).send(JSON.stringify(err));
      return;
    }
    if (!user) {
      response.status(404).send("User not found");
      return;
    }
    response.json(user);
  });
});

// URL /photosOfUser/:id - Returns the Photos for User (id).
app.get("/photosOfUser/:id", function (request, response) {
  const userId = request.params.id;
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return response.status(400).send("Invalid user ID format.");
  }

  Photo.aggregate([
    { $match: { user_id: mongoose.Types.ObjectId(userId) } },
    { $addFields: { comments: { $ifNull: ["$comments", []] } } },
    { $lookup: {
        from: "users",
        localField: "comments.user_id",
        foreignField: "_id",
        as: "commentUsers"
      } },
    { $addFields: {
        comments: {
          $map: {
            input: "$comments",
            as: "comment",
            in: {
              $mergeObjects: [
                "$$comment",
                { user: {
                    $first: {
                      $filter: {
                        input: "$commentUsers",
                        as: "commentUser",
                        cond: { $eq: ["$$commentUser._id", "$$comment.user_id"] }
                      }
                    }
                  } }
              ]
            }
          }
        }
      } },
    { $project: {
        commentUsers: 0,
        __v: 0,
        "comments.__v": 0,
        "comments.user_id": 0,
        "comments.user.description": 0,
        "comments.user.location": 0,
        "comments.user.occupation": 0,
        "comments.user.__v": 0
      } }
  ]).exec(function (err, photos) {
    if (err) {
      return response.status(500).send(JSON.stringify(err));
    }
    if (photos.length === 0) {
      return response.status(404).send("No photos found for this user.");
    }
    return response.json(photos);
  });
});

// Login route
app.post('/admin/login', async function (req, res) {
  const { login_name, password } = req.body;

  const user = await User.findOne({ login_name });
  if (user) {
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      req.session.user = { _id: user._id, first_name: user.first_name, last_name: user.last_name };
      return res.json(req.session.user);
    }
    return res.status(400).json({ message: 'Invalid password' });
  } else {
    return res.status(400).json({ message: 'Invalid login name' });
  }
});

// Logout route
app.post('/admin/logout', function (req, res) {
  if (req.session.user) {
    req.session.destroy(function (err) {
      if (err) {
        return res.status(500).json({ message: 'Error logging out' });
      }
      return res.status(200).json({ message: 'Logged out successfully' });
    });
  } else {
    return res.status(400).json({ message: 'No user logged in' });
  }
});

// User Registration Route
app.post('/admin/register', async function (req, res) {
  const { first_name, last_name, login_name, password } = req.body;

  // Basic validation
  if (!first_name || !last_name || !login_name || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = new User({
    first_name,
    last_name,
    login_name,
    password: hashedPassword,
  });

  try {
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error("Error registering user:", err);
    res.status(400).json({ message: 'Error registering user' });
  }
});

// Current User Route
app.get('/admin/current_user', function (req, res) {
  if (req.session.user) {
    return res.json(req.session.user);
  } else {
    return res.status(404).json({ message: 'No user logged in' });
  }
});

// Add Comment Route
app.post('/comments/add', async (req, res) => {
  const { photoId, userId, content } = req.body;

  // Basic validation
  if (!photoId || !userId || !content) {
    return res.status(400).json({ message: 'Photo ID, User ID, and Comment content are required' });
  }

  try {
    const photo = await Photo.findById(photoId);
    if (!photo) {
      return res.status(404).json({ message: 'Photo not found' });
    }

    const newComment = { user_id: userId, content };
    photo.comments.push(newComment);
    await photo.save();

    // Return the newly added comment
    res.status(201).json({ message: 'Comment added successfully', comment: newComment });
  } catch (err) {
    console.error("Error adding comment:", err);
    res.status(500).json({ message: 'Error adding comment' });
  }
});

// Final response for 404
app.use((req, res) => {
  res.status(404).json({ message: 'Not Found' });
});

// Start server
const server = app.listen(3000, function () {
  const port = server.address().port;
  console.log("Listening at http://localhost:" + port + " exporting the directory " + __dirname);
});
