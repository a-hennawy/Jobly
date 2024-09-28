"use strict";

const db = require("../db.js");
const {
  BadRequestError,
  NotFoundError,
  ExpressError,
} = require("../expressError");
const Job = require("./job.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/******************TESTING create */

// describe("create JOB", () => {
//   const newJob = {
//     title: "newJob",
//     salary: 200000,
//     equity: 0.03,
//     company_handle: "c3",
//   };
//   const newJob2 = {
//     title: "newJob2",
//     salary: 200001,
//     equity: 0,
//     company_handle: "NF",
//   };
//   test("works", async () => {
//     let job = await Job.create(newJob);

//     const result = await db.query(
//       `
//         SELECT id,
//                title,
//                salary,
//                equity,
//                company_handle
//         FROM jobs
//         WHERE id = 3`
//     );
//     result.rows[0].equity = parseFloat(result.rows[0].equity);
//     console.log(result.rows[0]);
//     expect(result.rows[0]).toEqual({
//       id: 3,
//       title: "newJob",
//       salary: 200000,
//       equity: 0.03,
//       company_handle: "c3",
//     });
//   });

//   test("Doesn't work: Company handle NOT FOUND", async () => {
//     try {
//       await Job.create(newJob2);
//       fail();
//     } catch (err) {
//       expect(err instanceof NotFoundError).toBeTruthy();
//       expect(err.message).toBe("No such Company");
//     }
//   });
// });

/******************TESTING findAll */
// describe("findAll", () => {
//   test("works", async () => {
//     let job = await Job.findAll({});
//     expect(job).toEqual([
//       {
//         id: 1,
//         title: "j1",
//         salary: 180000,
//         equity: 0,
//         company_handle: "c1",
//       },
//       {
//         id: 2,
//         title: "j2",
//         salary: 156000,
//         equity: 0.063,
//         company_handle: "c2",
//       },
//     ]);
//   });

//   test("works: with filters", async () => {
//     let filterObj = {
//       title: "j",
//       minSalary: 150000,
//       hasEquity: true,
//     };

//     let jobs = await Job.findAll(filterObj);

//     expect(jobs).toEqual([
//       {
//         id: 2,
//         title: "j2",
//         salary: 156000,
//         equity: 0.063,
//         company_handle: "c2",
//       },
//     ]);
//   });

//   test("FAILS: minSalary filter is not a number", async () => {
//     try {
//       let filterObj = {
//         title: "j",
//         minSalary: "NaN",
//         hasEquity: true,
//       };
//       let jobs = await Job.findAll(filterObj);
//       fail();
//     } catch (err) {
//       expect(err instanceof ExpressError).toBeTruthy();
//       expect(err.message).toBe(
//         "Please insert a valid number for minimum salary"
//       );
//       expect(err.status).toBe(404);
//     }
//   });
// });

/******************TESTING get(id) */
// describe("get", () => {
//   test("works", async () => {
//     let job = await Job.get(1);

//     expect(job).toEqual({
//       id: 1,
//       title: "j1",
//       salary: 180000,
//       equity: 0,
//       company_handle: "c1",
//     });
//   });

//   test("FAILS: if id is not found", async () => {
//     const wrongID = 5;
//     try {
//       await Job.get(wrongID);
//       fail();
//     } catch (err) {
//       expect(err instanceof NotFoundError).toBeTruthy();
//       expect(err.message).toBe(`Sorry cannot find job with id of: ${wrongID}`);
//       expect(err.status).toBe(404);
//     }
//   });
// });

/******************TESTING update(id, data)*/
describe("update", () => {
  const updateData = {
    title: "updatedJob",
    salary: 125000,
    companyHandle: "c1",
  };
  test("works", async () => {
    let job = await Job.update(2, updateData);
    // console.log(job);
    expect(job).toEqual({
      id: 2,
      title: "updatedJob",
      salary: 125000,
      equity: 0.063,
      company_handle: "c1",
    });
  });
  test("FAILS: wrong id", async () => {
    try {
      const wrongID = 6;
      let job = await Job.update(wrongID, updateData);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
      console.log(err.message);
      expect(err.message).toBe(`Sorry cannot find job with id of: 6`);
    }
  });
});

describe("remove", () => {
  test("WORKS", async () => {
    await Job.remove(2);
    const testQuery = await db.query(`
        SELECT id
        FROM jobs
        WHERE id = 2
        `);
    expect(testQuery.rows.length).toEqual(0);
  });

  test("FAILS: wrong id", async () => {
    try {
      await Job.remove(6);
      fails();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
      expect(err.message).toBe(`Sorry cannot find job with id of: 6`);
    }
  });
});
