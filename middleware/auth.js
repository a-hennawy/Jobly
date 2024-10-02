"use strict";

/** Convenience middleware to handle common auth cases in routes. */

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const { UnauthorizedError } = require("../expressError");

/** Middleware: Authenticate user.
 *
 * If a token was provided, verify it, and, if valid, store the token payload
 * on res.locals (this will include the username and isAdmin field.)
 *
 * It's not an error if no token was provided or if the token is not valid.
 */

function authenticateJWT(req, res, next) {
  try {
    const authHeader = req.headers && req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace(/^[Bb]earer /, "").trim();
      res.locals.user = jwt.verify(token, SECRET_KEY);
    }
    // console.log("-----------Successfully verified-----------");
    // console.group(res.locals);
    return next();
  } catch (err) {
    return next();
  }
}

/** Middleware to use when they must be logged in.
 *
 * If not, raises Unauthorized.
 * A new feature is also added, which doesn't allow any access to users unless the req.params user matches the res.locals user.
 * If the res.locals user is an admin, it will return next()
 */

function ensureLoggedIn(req, res, next) {
  try {
    // console.log(res.locals.user);
    if (!res.locals.user) {
      throw new UnauthorizedError();
    }
    if (res.locals.user.isAdmin) return next();
    if (req.params.username) {
      if (req.params.username !== res.locals.user.username) {
        throw new UnauthorizedError();
      }
    }
    return next();
  } catch (err) {
    return next(err);
  }
}

function ensureIsAdmin(req, res, next) {
  console.log("Before processing:", res.locals); // Log res.locals
  try {
    if (!res.locals.user || !res.locals.user.isAdmin) {
      throw new UnauthorizedError();
    }
    return next();
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  authenticateJWT,
  ensureLoggedIn,
  ensureIsAdmin,
};
