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
mongoose.Promise = require("bluebird");

const async = require("async");
const express = require("express");
const app = express();

// Load the Mongoose schema for User, Photo, and SchemaInfo
const User = require("./schema/user.js");
const Photo = require("./schema/photo.js");
const SchemaInfo = require("./schema/schemaInfo.js");

mongoose.set("strictQuery", false);
mongoose.connect("mongodb://127.0.0.1/project6", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Serve static files from the current directory
app.get("/test/:p1?", function (request, response) {
  console.log("/test called with param1 = ", request.params.p1);
  const param = request.params.p1 || "info";

  if (param === "info") {
    return SchemaInfo.find({}).then(info => {
      if (info.length === 0) {
        return response.status(500).send("Missing SchemaInfo");
      }
      console.log("SchemaInfo", info[0]);
      return response.json(info[0]);
    }).catch(err => {
      console.error("Error in /test/info:", err);
      return response.status(500).send(JSON.stringify(err));
    });
  } else if (param === "counts") {
    const collections = [
      { name: "user", collection: User },
      { name: "photo", collection: Photo },
      { name: "schemaInfo", collection: SchemaInfo },
    ];

    return async.each(
      collections,
      function (col, done_callback) {
        col.collection.countDocuments({}, function (err, count) {
          col.count = count;
          done_callback(err);
        });
      },
      function (err) {
        if (err) {
          return response.status(500).send(JSON.stringify(err));
        } else {
          const obj = {};
          for (let i = 0; i < collections.length; i++) {
            obj[collections[i].name] = collections[i].count;
          }
          return response.json(obj);
        }
      }
    );
  } else {
    return response.status(400).send("Bad param " + param);
  }
});

// URL /user/list - Returns all the User objects.
app.get("/user/list", function (request, response) {
  User.find({}, function (err, users) {
    if (err) {
      console.error("Error in /user/list:", err);
      return response.status(400).send(JSON.stringify(err));
    }
    if (users.length === 0) {
      return response.status(400).send("Missing Users Info");
    }

    const userList = users.map(user => ({
      _id: user._id.toString(),
      first_name: user.first_name,
      last_name: user.last_name
    }));

    return response.json(userList);
  });
});

// URL /user/:id - Returns the information for User (id).
app.get("/user/:id", function (request, response) {
  const id = request.params.id;

  User.findById(id, { __v: 0 }, function (err, user) {
    if (err) {
      console.error("Error in /user/:id", err);
      return response.status(400).send(JSON.stringify(err));
    }
    if (!user) {
      return response.status(404).send("User not found");
    }
    
    return response.json(user);
  });
});

// URL /photosOfUser/:id - Returns the Photos for User (id).
// URL /photosOfUser/:id - Returns the Photos for User (id).
app.get("/photosOfUser/:id", function (request, response) {
  const userId = request.params.id;

  // Validate the user ID format
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
  ]).exec((err, photos) => {
    if (err) {
      console.error("Error retrieving photos for user:", err);
      return response.status(500).send(JSON.stringify(err));
    }
    if (photos.length === 0) {
      return response.status(404).send("No photos found for this user.");
    }
    
    return response.json(photos);
  });

  
  return null; 
});
