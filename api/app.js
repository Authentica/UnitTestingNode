const express = require('express');
const app = express();
const fs = require('fs');
app.get("/students", (req, res) => {
  var fileContent = fs.readFileSync('api/students.json');
  res.json(JSON.parse(fileContent.toString()));
});

app.get("/schools", (req, res) => {
var fileContent = fs.readFileSync('api/schools.json');
res.json(JSON.parse(fileContent.toString()));
});

app.get("/enrollments", (req, res) => {
  var fileContent = fs.readFileSync('api/enrollments.json');
  res.json(JSON.parse(fileContent.toString()));
});

app.listen(3000);
