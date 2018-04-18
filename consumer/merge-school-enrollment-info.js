const StudentApi = require('./student-api');
const JSONStream = require('jsonstream');
const { Writable, Transform } = require('stream');
const pump = require('pump');
const fs = require('fs');

const buildSchoolLookup = async (schoolStream) => {
  const schoolLookup = {};

  await new Promise((resolve) => {
    schoolStream
      .pipe(JSONStream.parse('*'))
      .pipe(new Writable({
        objectMode: true,
        write(chunk, encoding, callback) {
          schoolLookup[chunk.id] = chunk;
          callback();
        }
      }));

    schoolStream.on('end', () => {
      resolve();
    });
  });

  return schoolLookup;
};

module.exports = async function() {
  const api = new StudentApi();
  const schoolLookup = await buildSchoolLookup(await api.getSchools());
  const enrollmentStream = await api.getEnrollments();

  const processEnrollmentStream = new Transform({
    objectMode: true,
    transform(chunk, encoding, callback) {
      const school = schoolLookup[chunk.school_id] || null;
      this.push({
        id: chunk.id,
        student_id: chunk.student_id,
        school
      });
      callback();
    }
  });

  const resultFilePath = './merged-enrollments.json';

  try {
    fs.unlinkSync(resultFilePath);
  } catch(error) { }

  const fileStream = fs.createWriteStream(resultFilePath);

  return new Promise((resolve, reject) => {
    pump(
      enrollmentStream,
      JSONStream.parse('*'),
      processEnrollmentStream,
      JSONStream.stringify(),
      fileStream,
      (error) => {
        if (error) { reject(error); }
        resolve();
      }
    );
  });
};
