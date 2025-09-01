const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    status: {
      type: String,
      enum: ["todo", "doing", "done"],
      default: "todo",
    },
    priority: { type: Number, default: 1 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Index for pagination and status filtering
taskSchema.index({ createdAt: -1, status: 1 });

module.exports = mongoose.model("Task", taskSchema);
