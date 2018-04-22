const chai = require('chai'),
  expect = chai.expect,
  chaiAsPromised = require('chai-as-promised'),
  sinon = require('sinon'),
  proxyquire = require('proxyquire').noPreserveCache(),
  fs = require('fs'),
  path = require('path');
  
  chai.use(chaiAsPromised);
  
  class StudentApiStub {
    constructor() {}
    getSchools() { 
      return fs.createReadStream(path.join(__dirname, 'schools.json'));
    }
    getEnrollments() {
      return fs.createReadStream(path.join(__dirname, 'enrollments.json'));
    }
  };

  describe('Merge school info to enrollments', () => {
    let studentApi;
    const transformedFilePath = './consumer/enrollments_with_schools.json';
    const mergeSchoolInfoToEnrollments = proxyquire.noCallThru().load('./../../consumer/merge-school-info-to-enrollments', 
    {
      './student-api': StudentApiStub
    });
    beforeEach(() => {
      try {
        fs.unlinkSync(transformedFilePath);
      } catch(error) {}
    });
    it('should match entrollments to schools based on school id', async () => {
      const response = await mergeSchoolInfoToEnrollments();
      expect(response.enrollmentsCount).to.equal(900);
      expect(response.transformedCount).to.equal(900);
    });
    it('should create enrollments_with_schools.json', async () => {
      await mergeSchoolInfoToEnrollments();
      fs.exists(transformedFilePath, (exists) => {
        expect(exists).to.be.true;
      });  
    });
  });