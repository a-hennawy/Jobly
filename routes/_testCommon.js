"use strict";

const db = require("../db.js");
const User = require("../models/user");
const Company = require("../models/company");
const Job = require("../models/job.js");
const { createToken } = require("../helpers/tokens");

async function commonBeforeAll() {
  // noinspection SqlWithoutWhere
  // await db.query("DELETE FROM users");
  await db.query("TRUNCATE TABLE users RESTART IDENTITY CASCADE");
  // noinspection SqlWithoutWhere
  // await db.query("DELETE FROM companies");
  await db.query("TRUNCATE TABLE companies RESTART IDENTITY CASCADE");

  await db.query("TRUNCATE TABLE jobs RESTART IDENTITY CASCADE");

  /**Populating companies table*/
  await Company.create({
    handle: "c1",
    name: "C1",
    numEmployees: 1,
    description: "Desc1",
    logoUrl: "http://c1.img",
  });
  await Company.create({
    handle: "c2",
    name: "C2",
    numEmployees: 2,
    description: "Desc2",
    logoUrl: "http://c2.img",
  });
  await Company.create({
    handle: "c3",
    name: "C3",
    numEmployees: 3,
    description: "Desc3",
    logoUrl: "http://c3.img",
  });

  /**Populating jobs table*/
  await Job.create({
    title: "j1",
    salary: 180000,
    equity: 0,
    company_handle: "c1",
  });

  await Job.create({
    title: "j2",
    salary: 157000,
    equity: 0.06,
    company_handle: "c1",
  });

  /**Populating users table*/
  await User.register({
    username: "u1",
    firstName: "U1F",
    lastName: "U1L",
    email: "user1@user.com",
    password: "password1",
    isAdmin: false,
  });
  await User.register({
    username: "u2",
    firstName: "U2F",
    lastName: "U2L",
    email: "user2@user.com",
    password: "password2",
    isAdmin: true,
  });
  await User.register({
    username: "u3",
    firstName: "U3F",
    lastName: "U3L",
    email: "user3@user.com",
    password: "password3",
    isAdmin: false,
  });
  await User.apply("u1", 1);
}

async function commonBeforeEach() {
  await db.query("BEGIN");
}

async function commonAfterEach() {
  await db.query("ROLLBACK");
}

async function commonAfterAll() {
  await db.end();
}

const u1Token = createToken({ username: "u1", isAdmin: false });
const u2Token = createToken({ username: "u2", isAdmin: true });

module.exports = {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  u2Token,
};
