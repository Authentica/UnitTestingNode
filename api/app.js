const express = require('express');
const app = express();
const fs = require('fs');
app.get("/students", (req, res) => {
  var fileContent = fs.readFileSync("students.json");
  res.json(JSON.parse(fileContent.toString()));
});

app.get("/schools", (req, res) => {
var fileContent = fs.readFileSync("school.json");
res.json(JSON.parse(fileContent.toString()));
});

app.get("/enrollments", (req, res) => {
  var fileContent = fs.readFileSync("enrollments.json");
  res.json(JSON.parse(fileContent.toString()));
});

app.listen(3000);