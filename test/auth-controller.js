const expect = require("chai").expect;
const sinon = require("sinon");
const mongoose = require("mongoose");

const User = require("../models/User");
const AuthController = require("../controllers/auth");

describe("Auth Controller ", function () {
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
  beforeEach(function () {
    // runs before each test in this block
  });

  afterEach(function () {
    // runs after each test in this block
  });

  it("should throw an error with code 500 if accessing the database fails", function (done) {
    sinon.stub(User, "findOne"); //create a stub for the findOne method of the User model
    User.findOne.throws();

    const req = {
      body: {
        email: "test@example.com",
        password: "password",
      },
    };
    const res = {
      status: function (code) {
        return this;
      },
      json: function (data) {
        done();
      },
    };
    const next = function () {};

    AuthController.login(req, res, next).then((result) => {
      expect(result).to.be.an("error");
      expect(result).to.have.property("statusCode", 500);
      done();
    });
    User.findOne.restore();
  });

  it("should send a response with a valid user status for an existing user", function (done) {
    const req = {
      userId: "5c0f66b979af55031b34728a",
    };
    const res = {
      statusCode: 500,
      userStatus: null,
      status: function (code) {
        this.statusCode = code;
        return this;
      },
      json: function (data) {
        this.userStatus = data.status;
      },
    };
    AuthController.getUserStatus(req, res, () => {}).then(() => {
      expect(res.statusCode).to.be.equal(200);
      expect(res.userStatus).to.be.equal("I am new!");
      done();
    });
  });

  after(function (done) {
    User.deleteMany({}).then(() => {
      return mongoose.disconnect().then(() => {
        done();
      });
    });
  });
});
