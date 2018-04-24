const StudentApi = require('./student-api');
const JSONStream = require('jsonstream');
const Transform = require('stream').Transform;
const _ = require('lodash');
const pump = require('pump');
const fs = require('fs');

module.exports = async function () {
  var studentApi = new StudentApi();
  var schoolData = [];
  var schools = await studentApi.getSchools();
  var enrollmentStream = await studentApi.getEnrollments();
  var schoolObjectStream = JSONStream.parse('*');
  var jsonObjectStream = JSONStream.parse('*');

  schoolObjectStream.on('data', (data) => {
    schoolData.push(data);
  });
  await pump(schools,schoolObjectStream);

  var appendSchoolDataStream = new Transform({
    objectMode: true,
    transform(enrollment, enc, next) {
      var result = schoolData.filter(function (school) {
        return school["id"] === enrollment["school_id"];
      })[0];
      _.forOwn(result, function(value, key) { 
          enrollment[key] =value;
      } );
      this.push(enrollment);
      next();
    }
  });

  var jsonStringifyStream = JSONStream.stringify();
  try {
    fs.unlinkSync('./students.json');
  }
  catch (error) {

  }
  var fileStream = fs.createWriteStream('./enrollments_with_schools.json');

  return new Promise((resolve, reject) => {
    pump(enrollmentStream, jsonObjectStream, appendSchoolDataStream, jsonStringifyStream, fileStream, (err) => {
      return resolve();
    });

  });
};