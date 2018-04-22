const StudentApi = require('./student-api');
const JSONStream = require('jsonstream');
const Transform = require('stream').Transform;
const pump = require('pump');
const fs = require('fs');

const result = {
  enrollmentsCount: 0,
  transformedCount: 0
};

module.exports = async function() {
  const transformedFilePath = './consumer/enrollments_with_schools.json';
  const schools = [];
  const studentApi = new StudentApi();
  const schoolStream = await studentApi.getSchools();
  const enrollmentsStream = await studentApi.getEnrollments();
  const schoolsJsonStream = JSONStream.parse('*');
  const enrollmentsJsonStream = JSONStream.parse('*');
  schoolsJsonStream.on('data', (data) => {
    schools.push({ schoolId: data.id, schoolData: data });
  });
  
  const studentEnrollmentTransformStream = new Transform({
      objectMode: true,
      transform(enrollment, enc, next) {
        var school = schools.find((element) => {
          return element.schoolId === enrollment.school_id;
        });
        if (school) {
          result.transformedCount += 1;
          enrollment.school_name = school.schoolData.school_name;
          enrollment.school_number = school.schoolData.school_number
        }
        this.push(enrollment);
        result.enrollmentsCount += 1;
        next();
      }
    });
  
  const jsonStringifyStream = JSONStream.stringify();
  try {
    fs.unlinkSync(transformedFilePath);
  } catch(error) {}
  const fileStream = fs.createWriteStream(transformedFilePath);
  return new Promise((resolve, reject) =>  {
    pump(schoolStream, schoolsJsonStream);
    pump(enrollmentsStream, enrollmentsJsonStream, studentEnrollmentTransformStream, jsonStringifyStream, fileStream, (error) => {
      if (error) {
        return reject(error);
      }
      return resolve(result);
    })
  });
};