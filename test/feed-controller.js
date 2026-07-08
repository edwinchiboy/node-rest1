const expect = require("chai").expect;
const sinon = require("sinon");
const mongoose = require("mongoose");

const Post = require("../models/post");
const User = require("../models/User");
const FeedController = require("../controllers/feed");

describe("Feed Controller ", function () {
  before(function (done) {
    mongoose
      .connect(
        "mongodb+srv://choboyedeh17:Qwert%212345@cluster0.pnin6iw.mongodb.net/testmessages?appName=Cluster0",
      )
      .then((result) => {
        const user = new User({
          email: "test@example.com",
          password: "password",
          name: "Test User",
          posts: [],
          _id: "5c0f66b979af55031b34728a",
        });
        return user.save();
      })
      .then(() => {
        done();
      });
  });

  it("should add a created post to the post of the creator", function (done) {
    sinon.stub(User, "findOne"); //create a stub for the findOne method of the User model
    User.findOne.throws();

    const req = {
      body: {
        title: "Test Post",
        content: "Test Content",
      },
      file: {
        path: "images/test.png",
      },
      userId: "5c0f66b979af55031b34728a",
    };
    const res = {
      status: function (code) {
        return this;
      },
      json: function (data) {
        return this;
      },
    };
    const next = function () {};

    FeedController.createPost(req, res, next).then((savedUser) => {
      expect(savedUser).to.have.property("posts");
      expect(savedUser.posts).to.have.lengthOf(1);
      done();
    });

    User.findOne.restore();
  });

  after(function (done) {
    User.deleteMany({}).then(() => {
      return mongoose.disconnect().then(() => {
        done();
      });
    });
  });
});
