const produceStudentOutput = require('./produce-student-output');
const mergeSchoolEnrollmentInfo = require('./merge-school-enrollment-info');

(async () => {
  // await produceStudentOutput();
  await mergeSchoolEnrollmentInfo();
})();
