"use strict";

/** Routes for jobs. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureIsAdmin } = require("../middleware/auth");
const Job = require("../models/job");

const jobNewSchema = require("../schemas/jobNew.json");
const jobUpdateSchema = require("../schemas/jobUpdate.json");

const router = new express.Router();
require("colors");

router.post("/", ensureIsAdmin, async (req, res, next) => {
  try {
    const validator = jsonschema.validate(req.body, jobNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const job = await Job.create(req.body);
    return res.status(201).json({ job });
  } catch (err) {
    return next(err);
  }
});

router.get("/", async (req, res, next) => {
  try {
    const { title, minSalary, hasEquity } = req.query;
    let filterObj = {
      title: title ? String(title) : undefined,
      minSalary: minSalary ? minSalary : undefined,
      hasEquity:
        hasEquity === "true" ? true : hasEquity === "false" ? false : undefined,
    };

    // console.log("filter object".yellow);

    const jobs = await Job.findAll(filterObj);

    return res.status(200).json({ jobs });
  } catch (err) {
    return next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const job = await Job.get(req.params.id);
    return res.status(200).json({ job });
  } catch (err) {
    return next(err);
  }
});

router.patch("/:id", ensureIsAdmin, async (req, res, next) => {
  try {
    const validator = jsonschema.validate(req.body, jobUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const job = await Job.update(req.params.id, req.body);
    console.log("Models ROUTE".bgMagenta, job);
    return res.status(201).json({ job });
  } catch (err) {
    return next(err);
  }
});

router.delete("/:id", ensureIsAdmin, async (req, res, next) => {
  try {
    const jobRemove = await Job.remove(req.params.id);
    console.log(jobRemove);
    return res.json({
      removed: `job with id:${jobRemove.id}, title: ${jobRemove.title}`,
    });
  } catch (err) {
    return next(err);
  }
});
module.exports = router;
