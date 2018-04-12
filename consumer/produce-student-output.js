const StudentApi = require('./student-api');
const JSONStream = require('jsonstream');
const Transform = require('stream').Transform;
const pump = require('pump');
const fs = require('fs');

module.exports = async function() {
  var studentApi = new StudentApi();
  var studentStream = await studentApi.getStudents();
  var jsonObjectStream = JSONStream.parse('*');

  var timeStampStream  = new Transform({
    objectMode: true,
    transform(student, enc, next) {
      if(!this.count)
        this.count = 0
      this.count++;
      console.log(this.count);
      student.timeStamp = (new Date).getTime();
      this.push(student);
      next();
    }
  });

  var jsonStringifyStream = JSONStream.stringify();
  try {
    fs.unlinkSync('./students.json');
  }
  catch(error) {

  }
  var fileStream = fs.createWriteStream('./students.json');

  return new Promise((resolve, reject) =>  {
    pump(studentStream, jsonObjectStream, timeStampStream,jsonStringifyStream,fileStream, (err) => {
      return resolve();
    });
  
  });
};