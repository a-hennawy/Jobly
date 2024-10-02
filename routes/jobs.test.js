"use strict";

const request = require("supertest");

const db = require("../db");
const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  u2Token, //admin bearer
} = require("./_testCommon");
const { UnauthorizedError, BadRequestError } = require("../expressError");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

describe("POST /jobs", () => {
  const j3 = {
    title: "J3",
    salary: 165000,
    equity: 0.04,
    company_handle: "c2",
  };
  const badJob = {
    title: "Bad job",
    salary: "165000",
    equity: 0.04,
    company_handle: "c2",
  };

  test("WORKS: for ADMIN", async () => {
    const resp = await request(app)
      .post("/jobs")
      .send(j3)
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.status).toEqual(201);
    expect(resp.body).toEqual({
      job: {
        id: 3,
        title: "J3",
        salary: 165000,
        equity: 0.04,
        company_handle: "c2",
      },
    });
  });

  test("UNAUTH: for non-ADMIN", async () => {
    const resp = await request(app)
      .post("/jobs")
      .send(j3)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.status).toEqual(401);
  });

  test("UNAUTH: for anonymous", async () => {
    const resp = await request(app).post("/jobs");
    expect(resp.status).toEqual(401);
  });
  test("BAD REQ: if json validation fails", async () => {
    const resp = await request(app)
      .post("/jobs")
      .send(badJob)
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.status).toEqual(400);
  });
});

describe("GET /jobs", () => {
  test("WORKS w/o filter: for all token bearers and anon", async () => {
    const resp = await request(app).get("/jobs").send({});

    expect(resp.body).toEqual({
      jobs: [
        {
          id: 1,
          title: "j1",
          salary: 180000,
          equity: 0,
          company_handle: "c1",
        },
        {
          id: 2,
          title: "j2",
          salary: 157000,
          equity: 0.06,
          company_handle: "c1",
        },
      ],
    });
    expect(resp.status).toEqual(200);
  });

  test("works with filters", async () => {
    const resp = await request(app).get("/jobs?title=j&minSalary=160000");
    // console.log(resp.body);
    expect(resp.body).toEqual({
      jobs: [
        {
          id: 1,
          title: "j1",
          salary: 180000,
          equity: 0,
          company_handle: "c1",
        },
      ],
    });
    expect(resp.status).toEqual(200);
  });

  test("works with filters: testing hasEquity=true", async () => {
    const resp = await request(app).get("/jobs?hasEquity=true");
    // console.log(resp.body);
    expect(resp.body).toEqual({
      jobs: [
        {
          id: 2,
          title: "j2",
          salary: 157000,
          equity: 0.06,
          company_handle: "c1",
        },
      ],
    });
    expect(resp.status).toEqual(200);
  });
  test("works with filters: testing hasEquity=false", async () => {
    const resp = await request(app).get("/jobs?hasEquity=false");
    // console.log(resp.body);
    expect(resp.body).toEqual({
      jobs: [
        {
          id: 1,
          title: "j1",
          salary: 180000,
          equity: 0,
          company_handle: "c1",
        },
        {
          id: 2,
          title: "j2",
          salary: 157000,
          equity: 0.06,
          company_handle: "c1",
        },
      ],
    });
    expect(resp.status).toEqual(200);
  });
  test("404 ERROR: if salary isNaN ", async () => {
    const resp = await request(app).get("/jobs?minSalary=one onety one");
    // console.log(resp.body);

    expect(resp.status).toEqual(404);
  });
});

describe("GET /:id", () => {
  test("WORKS: for everyone", async () => {
    const resp = await request(app).get("/jobs/1");

    expect(resp.body).toEqual({
      job: {
        id: 1,
        title: "j1",
        salary: 180000,
        equity: 0,
        company_handle: "c1",
      },
    });
  });

  test("NOT FOUND: for not found job id", async () => {
    const resp = await request(app).get("/jobs/6");
    // console.log(resp.body);
    expect(resp.status).toEqual(404);
    expect(resp.body.error.message).toEqual(
      "Sorry cannot find job with id of: 6"
    );
  });
});

describe("PATCH /:id", () => {
  test("WORKS: for ADMIN token bearer", async () => {
    const resp = await request(app)
      .patch(`/jobs/1`)
      .send({
        title: "j1-p",
      })
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.body).toEqual({
      job: {
        id: 1,
        title: "j1-p",
        salary: 180000,
        equity: 0,
        company_handle: "c1",
      },
    });
  });

  test("UNAUTH: for non-ADMIN token bearers", async () => {
    const resp = await request(app)
      .patch(`/jobs/1`)
      .send({
        title: "j1-p",
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.status).toEqual(401);
  });

  test("UNAUTH: for anon", async () => {
    const resp = await request(app).patch(`/jobs/1`).send({
      title: "j1-p",
    });

    expect(resp.status).toEqual(401);
  });

  test("UNAUTH: for non-ADMIN token bearers", async () => {
    const resp = await request(app)
      .patch(`/jobs/1`)
      .send({
        title: "j1-p",
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.status).toEqual(401);
  });
  test("NOT FOUND: for wrong jobID", async () => {
    const resp = await request(app)
      .patch(`/jobs/6`)
      .send({
        title: "j1-p",
      })
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.status).toEqual(404);
  });

  test("BAD REQUEST: Schema not valid", async () => {
    const resp = await request(app)
      .patch(`/jobs/1`)
      .send({
        title: "j1-p",
        salary: "190000",
      })
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.status).toEqual(400);
  });
});

describe("DELETE /jobs/id", () => {
  test("WORKS: for ADMIN token bearers", async () => {
    const resp = await request(app)
      .delete("/jobs/2")
      .set("authorization", `Bearer ${u2Token}`);
    // console.log(resp.body);
    expect(resp.body).toEqual({
      removed: `job with id:2, title: j2`,
    });
  });

  test("NOT FOUND: wrong id", async () => {
    const resp = await request(app)
      .delete("/jobs/6")
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.status).toEqual(404);
  });
});
