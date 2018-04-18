const fs = require('fs');
const path = require('path');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const proxyquire = require('proxyquire').noPreserveCache();
const { Readable, PassThrough } = require('stream');
const nock = require('nock');

chai.use(chaiAsPromised);
chai.use(sinonChai);

const { expect } = chai;

const fixtures = {
  schools: JSON.parse(
    fs.readFileSync(path.join(__dirname, '../fixtures/schools.json'))
  ),
  enrollments: JSON.parse(
    fs.readFileSync(path.join(__dirname, '../fixtures/enrollments.json'))
  ),
  missingSchoolEnrollments: JSON.parse(
    fs.readFileSync(path.join(__dirname, '../fixtures/missing-school-enrollments.json'))
  )
};

const getComponentResponse = async (additionalStubs) => {
  let response = '';

  const passThroughStream = new PassThrough();
  const writeSpy = sinon.spy(passThroughStream, 'write');
  const fsStub = {
    createWriteStream: () => passThroughStream,
    unlinkSync: () => {}
  };

  let stubs = { 'fs': fsStub };
  if (additionalStubs) { Object.assign(stubs, additionalStubs); }

  await proxyquire.noCallThru().load('../../consumer/merge-school-enrollment-info.js', stubs)();

  writeSpy.getCalls().forEach(call => {
    response += call.args[0];
  });

  return JSON.parse(response);
};

describe('Merge School Enrollment Info', () => {
  it('should write merged enrollment and school data to the merged-enrollments.json file', async () => {
    nock('http://localhost:3000')
      .get('/schools')
      .reply(200, fixtures.schools)
      .get('/enrollments')
      .reply(200, fixtures.enrollments);

    const response = await getComponentResponse();

    expect(response).to.be.lengthOf(9);
    expect(response[0]).to.have.property('id', 1);
    expect(response[0]).to.have.property('student_id', 1);
    expect(response[0]).to.have.property('school');
    expect(response[0].school).to.have.property('id', 1);
    expect(response[0].school).to.have.property('school_name', 'Demo School');
    expect(response[0].school).to.have.property('school_number', 'PA-880');
  });

  it('should write null value to school attribute if school_id not found in schools.json', async () => {
    nock('http://localhost:3000')
      .get('/schools')
      .reply(200, fixtures.schools)
      .get('/enrollments')
      .reply(200, fixtures.missingSchoolEnrollments);

    const response = await getComponentResponse();

    expect(response).to.be.lengthOf(3);
    expect(response[0]).to.have.property('id', 1);
    expect(response[0]).to.have.property('student_id', 1);
    expect(response[0]).to.have.property('school', null);
  });

  it('should throw error if error occurs in a stream', async () => {
    const studentApiStub = sinon.stub().returns({
      getSchools: () => new Readable({
        read() {
          this.push(JSON.stringify(fixtures.schools));
          this.push(null);
        }
      }),

      getEnrollments: () => new Readable({
        read() {
          this.emit('error', 'UNKNOWN_ERROR');
          this.push(null);
        }
      })
    });

    const componentFunc = async () => {
      await getComponentResponse({ './student-api': studentApiStub });
    };

    expect(componentFunc()).to.be.rejectedWith('UNKNOWN_ERROR')
  });
});
