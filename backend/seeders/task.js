const mongoose = require("mongoose");
const { faker } = require("@faker-js/faker");
const Task = require("../models/Task");
require("dotenv").config();

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    // Clear old data
    await Task.deleteMany({});
    console.log("Old tasks removed");

    const statuses = ["todo", "doing", "done"];
    const tasks = [];

    for (let i = 0; i < 100; i++) {
      tasks.push({
        title: faker.lorem.words(4),
        status: faker.helpers.arrayElement(statuses),
        priority: faker.number.int({ min: 1, max: 5 }),
        createdAt: faker.date.recent({ days: 30 }), // random date within last 30 days
      });
    }

    await Task.insertMany(tasks);
    console.log("Seeded 100 tasks");

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();
