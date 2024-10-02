"use strict";

const { underline } = require("colors");
const db = require("../db");
const {
  BadRequestError,
  NotFoundError,
  ExpressError,
} = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

class Job {
  /**Create new job (from data), update db, return new job data.
   *
   * Data should be {title, salary, equity, company_handle}
   *
   * Return {id, title, salary, equity, company_handle}
   *
   * Throws NotFoundError if company_handle is not in database.
   */

  static async create({ title, salary, equity, company_handle }) {
    const companyCheck = await db.query(
      `SELECT *
        FROM companies
        WHERE handle = $1`,
      [company_handle]
    );
    if (companyCheck.rows.length === 0) {
      throw new NotFoundError("No such Company");
    }
    const result = await db.query(
      `
        INSERT INTO jobs
        (title, salary, equity, company_handle)
        VALUES ($1, $2, $3, $4)
        RETURNING id, title, salary, equity, company_handle
        `,
      [title, salary, equity, company_handle]
    );
    const job = result.rows[0];
    job.equity = parseFloat(job.equity);
    return job;
  }

  /**Find all jobs
   * With an additonal filtering option, if either or all of the arguments are provided it will filter based on the provided arguments.
   *
   * hasEquity argument is boolean, if provided it will return every job with an equity greater than 0.
   *
   * Returns [{id, title, salary, equity, company_handle}, ...]
   */

  static async findAll({ title, minSalary, hasEquity }) {
    let query = `SELECT id,
                        title,
                        salary,
                        equity,
                        company_handle
                FROM jobs`;
    let conditions = [];
    let replacements = [];

    if (title) {
      conditions.push(`title ILIKE $${replacements.length + 1}`);
      replacements.push(`%${title}%`);
    }

    if (minSalary != undefined) {
      if (minSalary && isNaN(minSalary)) {
        throw new ExpressError(
          "Please insert a valid number for minimum salary",
          404
        );
      }
      conditions.push(`salary >= $${replacements.length + 1}`);
      replacements.push(minSalary);
    }

    if (hasEquity === true) {
      conditions.push(`equity > 0`);
    }

    console.log(conditions);
    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }
    query += " ORDER BY id";

    const jobRes = await db.query(query, replacements);
    // console.log(jobRes);
    const jobs = jobRes.rows.map((job) => {
      job.equity = parseFloat(job.equity);
      return job;
    });
    // jobRes.equity = parseFloat(jobRes.equity);
    return jobs;
  }
  /** Returns job with a specified id */
  static async get(id) {
    let query = `SELECT id,
                        title, 
                        salary,
                        equity,
                        company_handle
                FROM jobs
                WHERE id = $1
                ORDER BY id`;
    const jobRes = await db.query(query, [id]);

    const job = jobRes.rows[0];

    if (!job) {
      throw new NotFoundError(`Sorry cannot find job with id of: ${id}`);
    }

    job.equity = parseFloat(job.equity);
    return job;
  }

  static async update(id, data) {
    const jsToSql = {
      title: "title",
      salary: "salary",
      equity: "equity",
      companyHandle: "company_handle",
    };
    const { setCols, values } = sqlForPartialUpdate(data, jsToSql);

    const idSqlizer = "$" + (values.length + 1);

    const querySql = `UPDATE jobs 
                      SET ${setCols} 
                      WHERE id = ${idSqlizer} 
                      RETURNING id, 
                                title, 
                                salary,
                                equity,
                                company_handle`;
    const result = await db.query(querySql, [...values, id]);
    const updatedJob = result.rows[0];

    if (!updatedJob) {
      throw new NotFoundError(`Sorry cannot find job with id of: ${id}`);
    }
    updatedJob.equity = parseFloat(updatedJob.equity);
    console.log("Models PATCH".bgBlue, updatedJob);
    return updatedJob;
  }

  static async remove(id) {
    const job = await db.query(
      `
      SELECT id
      FROM jobs
      WHERE id = $1
      `,
      [id]
    );

    if (job.rows.length === 0) {
      throw new NotFoundError(`Sorry cannot find job with id of: ${id}`);
    }
    const result = await db.query(
      `
        DELETE 
        FROM jobs
        WHERE id = $1
        RETURNING id, title
        `,
      [id]
    );
    return result.rows[0];
  }
}

module.exports = Job;
