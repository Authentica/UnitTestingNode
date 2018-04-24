
const produceStudentOutput = require('./produce-student-output');
const produceEnrollmentOutput = require('./produce-enrollment-output');

(async function() {
await produceStudentOutput();
await produceEnrollmentOutput();
}
)();