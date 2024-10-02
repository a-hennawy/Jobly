"use strict";

const db = require("../db");
const {
  BadRequestError,
  NotFoundError,
  ExpressError,
} = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for companies. */

class Company {
  /** Create a company (from data), update db, return new company data.
   *
   * data should be { handle, name, description, numEmployees, logoUrl }
   *
   * Returns { handle, name, description, numEmployees, logoUrl }
   *
   * Throws BadRequestError if company already in database.
   * */

  static async create({ handle, name, description, numEmployees, logoUrl }) {
    const duplicateCheck = await db.query(
      `SELECT handle
           FROM companies
           WHERE handle = $1`,
      [handle]
    );

    if (duplicateCheck.rows[0])
      throw new BadRequestError(`Duplicate company: ${handle}`);

    const result = await db.query(
      `INSERT INTO companies
           (handle, name, description, num_employees, logo_url)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING handle, name, description, num_employees AS "numEmployees", logo_url AS "logoUrl"`,
      [handle, name, description, numEmployees, logoUrl]
    );
    const company = result.rows[0];

    return company;
  }

  /** Find all companies.
   *
   * Returns [{ handle, name, description, numEmployees, logoUrl }, ...]
   * and if { name, minEmp, maxEmp } is passed,
   * only the companies that satisfy the fields provided will be returned.
   * */

  static async findAll({ name, minEmp, maxEmp }) {
    let query = `SELECT handle,
                  name,
                  description,
                  num_employees AS "numEmployees",
                  logo_url AS "logoUrl"
           FROM companies`;
    let conditions = [];
    let replacements = [];

    if (name) {
      conditions.push(`name ILIKE $${replacements.length + 1}`);
      replacements.push(`%${name}%`);
    }

    if (minEmp != undefined) {
      if (isNaN(minEmp)) {
        throw new ExpressError(
          "Please insert a valid number for minimum employees",
          404
        );
      }
      conditions.push(`num_employees >= $${replacements.length + 1}`);
      replacements.push(minEmp);
    }

    if (maxEmp != undefined) {
      if (isNaN(maxEmp)) {
        throw new ExpressError(
          "Please insert a valid number for maximum employees",
          404
        );
      }
      conditions.push(`num_employees <= $${replacements.length + 1}`);
      replacements.push(maxEmp);
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    query += " ORDER BY name";

    const companiesRes = await db.query(query, replacements);
    return companiesRes.rows;
  }

  /** Given a company handle, return data about company.
   *
   * Returns { handle, name, description, numEmployees, logoUrl, jobs }
   *   where jobs is [{ id, title, salary, equity, companyHandle }, ...]
   *
   * Throws NotFoundError if not found.
   **/

  static async get(handle) {
    const fullCompanyRes = await db.query(
      `SELECT 
        companies.handle AS company_handle, 
        companies.name AS company_name,
        companies.num_employees,
        companies.description AS company_description, 
        companies.logo_url AS company_logo,
        jobs.id AS job_id, 
        jobs.title, 
        jobs.salary, 
        jobs.equity 
      FROM companies
      LEFT JOIN jobs
      ON jobs.company_handle = companies.handle
      WHERE companies.handle =  $1`,
      [handle]
    );
    if (fullCompanyRes.rows.length === 0)
      throw new NotFoundError(`No company: ${handle}`);

    // console.log(fullCompanyRes.rows);
    const {
      company_handle,
      company_name,
      num_employees,
      company_description,
      company_logo,
    } = fullCompanyRes.rows[0];

    const jobs = fullCompanyRes.rows
      .map((row) => ({
        id: row.job_id,
        title: row.title,
        salary: row.salary,
        equity: row.equity !== null ? parseFloat(row.equity) : null,
      }))
      .filter((job) => job.id !== null); //this filters out jobs with no valid id

    const companyInfo = {
      company: {
        handle: company_handle,
        name: company_name,
        description: company_description,
        numEmployees: num_employees,
        logoUrl: company_logo,
      },
      jobs,
    };
    console.log(companyInfo);
    return companyInfo;
  }

  /** Update company data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {name, description, numEmployees, logoUrl}
   *
   * Returns {handle, name, description, numEmployees, logoUrl}
   *
   * Throws NotFoundError if not found.
   */

  static async update(handle, data) {
    const { setCols, values } = sqlForPartialUpdate(data, {
      numEmployees: "num_employees",
      logoUrl: "logo_url",
    });
    const handleVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE companies 
                      SET ${setCols} 
                      WHERE handle = ${handleVarIdx} 
                      RETURNING handle, 
                                name, 
                                description, 
                                num_employees AS "numEmployees", 
                                logo_url AS "logoUrl"`;
    const result = await db.query(querySql, [...values, handle]);
    const company = result.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);

    return company;
  }

  /** Delete given company from database; returns undefined.
   *
   * Throws NotFoundError if company not found.
   **/

  static async remove(handle) {
    const result = await db.query(
      `DELETE
           FROM companies
           WHERE handle = $1
           RETURNING handle`,
      [handle]
    );
    const company = result.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);
  }
}

module.exports = Company;
