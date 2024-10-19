const mongoose = require("mongoose");
mongoose.Promise = require("bluebird");

const express = require("express");
const async = require("async");
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

app.use(express.static(__dirname));

app.get("/", function (request, response) {
  response.send("Simple web server of files from " + __dirname);
});

app.get("/test/:p1", function (request, response) {
  const param = request.params.p1 || "info";

  if (param === "info") {
    SchemaInfo.find({}, function (err, info) {
      if (err) {
        console.error("Error in /test/info:", err);
        response.status(500).send(JSON.stringify(err));
        return;
      }
      if (info.length === 0) {
        response.status(500).send("Missing SchemaInfo");
        return;
      }
      console.log("SchemaInfo", info[0]);
      response.json(info[0]); // Pretty print via res.json
    });
  } else if (param === "counts") {
    const collections = [
      { name: "user", collection: User },
      { name: "photo", collection: Photo },
      { name: "schemaInfo", collection: SchemaInfo },
    ];
    async.each(
      collections,
      function (col, done_callback) {
        col.collection.countDocuments({}, function (err, count) {
          col.count = count;
          done_callback(err);
        });
      },
      function (err) {
        if (err) {
          response.status(500).send(JSON.stringify(err));
        } else {
          const obj = {};
          collections.forEach(col => {
            obj[col.name] = col.count;
          });
          response.json(obj); // Pretty print via res.json
        }
      }
    );
  } else {
    response.status(400).send("Bad param " + param);
  }
});

app.get("/user/list", function (request, response) {
  User.find({}, function (err, users) {
    if (err) {
      console.error("Error in /user/list:", err);
      response.status(400).send(JSON.stringify(err));
      return;
    }
    if (users.length === 0) {
      response.status(400).send("Missing Users Info");
      return;
    }
    const userList = users.map(user => ({
      _id: user._id.toString(),
      first_name: user.first_name,
      last_name: user.last_name
    }));
    response.json(userList); // Pretty print via res.json
  });
});

app.get("/user/:id", function (request, response) {
  const id = request.params.id;
  User.findById(id, { __v: 0 }, function (err, user) {
    if (err) {
      console.error("Error in /user/:id", err);
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

app.get("/photosOfUser/:id", function (request, response) {
  const userId = request.params.id;
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return response.status(400).send("Invalid user ID format.");
  }

  return Photo.aggregate([
    { $match: { user_id: mongoose.Types.ObjectId(userId) } },
    { $addFields: { comments: { $ifNull: ["$comments", []] } } },
    {
      $lookup: {
        from: "users",
        localField: "comments.user_id",
        foreignField: "_id",
        as: "commentUsers"
      }
    },
    {
      $addFields: {
        comments: {
          $map: {
            input: "$comments",
            as: "comment",
            in: {
              $mergeObjects: [
                "$$comment",
                {
                  user: {
                    $first: {
                      $filter: {
                        input: "$commentUsers",
                        as: "commentUser",
                        cond: { $eq: ["$$commentUser._id", "$$comment.user_id"] }
                      }
                    }
                  }
                }
              ]
            }
          }
        }
      }
    },
    {
      $project: {
        commentUsers: 0,
        __v: 0,
        "comments.__v": 0,
        "comments.user_id": 0,
        "comments.user.description": 0,
        "comments.user.location": 0,
        "comments.user.occupation": 0,
        "comments.user.__v": 0
      }
    }
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
});

const server = app.listen(3000, function () {
  const port = server.address().port;
  console.log(
    "Listening at http://localhost:" +
      port +
      " exporting the directory " +
      __dirname
  );
});
