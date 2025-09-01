const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Task = require("../models/Task");
const ApiError = require("../utils/ApiError");

// GET /api/tasks?limit=10&cursor=<id>&status=done
router.get("/", async (req, res, next) => {
  try {
    let { limit = 10, cursor, status, search } = req.query;

    // Validate limit
    limit = parseInt(limit, 10);
    if (isNaN(limit) || limit <= 0 || limit > 50) {
      throw new ApiError("Limit must be between 1 and 50", 400);
    }

    // Validate status if provided
    const allowedStatus = ["todo", "doing", "done"];
    if (status && !allowedStatus.includes(status)) {
      throw new ApiError("Invalid status value", 400);
    }

    // Build query
    const query = {};

    if (status) query.status = status;
    if (cursor && mongoose.Types.ObjectId.isValid(cursor)) {
      query._id = { $lt: cursor }; // get tasks "after" last cursor
    }

    // Add search filter (case-insensitive partial match)
    if (search) {
      query.title = { $regex: search, $options: "i" }; // "i" = case-insensitive
    }

    const items = await Task.find(query)
      .sort({ createdAt: -1, _id: -1 })
      .limit(limit + 1) // fetch one extra to check if nextCursor exists
      .select("title status priority createdAt");

    let nextCursor = null;
    if (items.length > limit) {
      const nextItem = items.pop(); // remove extra
      nextCursor = nextItem._id;
    }

    res.json({ items, nextCursor });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
