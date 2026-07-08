const expect = require("chai").expect;
const jwt = require("jsonwebtoken");
const sinon = require("sinon");

const authMiddleware = require("../middleware/is-auth");

describe("Auth Middleware", function () {
  it("should throw an error if no authorization header is present", function () {
    const req = {
      get: function (headerName) {
        return null; // Simulate no authorization header
      },
    };
    const res = {};
    const next = function () {};

    expect(authMiddleware.bind(this, req, res, next)).to.throw(
      "Not authenticated.",
    );
  });

  it("should throw an error if the authorization header is only one string", function () {
    const req = {
      get: function (headerName) {
        return "xyz"; // Simulate no authorization header
      },
    };
    const res = {};
    const next = function () {};
    expect(authMiddleware.bind(this, req, res, next)).to.throw();
  });

  it("should throw an error if the token cannot be verified", function () {
    const req = {
      get: function (headerName) {
        return "Bearer xyz"; // Simulate no authorization header
      },
    };
    const res = {};
    const next = function () {};
    expect(authMiddleware.bind(this, req, res, next)).to.throw();
  });

  //   it("should yield the user ID if the token is valid", function () {
  //     const req = {
  //       get: function (headerName) {
  //         return "Bearer xyNNNNBNBNNNNNz"; // Simulate no authorization header
  //       },
  //     };
  //     const res = {};
  //     const next = function () {};
  //     jwt.verify = function () {
  //       return { userId: "abc" };
  //     };
  //     authMiddleware(req, res, next);
  //     expect(req).to.have.property("userId");
  //   });

  it("should yield the user ID if the token is valid", function () {
    const req = {
      get: function (headerName) {
        return "Bearer xyNNNNBNBNNNNNz"; // Simulate no authorization header
      },
    };
    const res = {};
    const next = function () {};
    sinon.stub(jwt, "verify").returns({ userId: "abc" });
    authMiddleware(req, res, next);
    expect(req).to.have.property("userId");
    expect(req).to.have.property("userId", "abc");
    expect(jwt.verify.called).to.be.true;
    jwt.verify.restore();
  });
});
