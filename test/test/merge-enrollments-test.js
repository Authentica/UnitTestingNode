const chai = require('chai'),
  chaiAsPromised = require('chai-as-promised'),
  sinon = require('sinon'),
  sinonChai = require('sinon-chai'),
  expect = chai.expect,
  proxyquire = require('proxyquire').noPreserveCache(),
  {Readable, PassThrough} = require('stream'),
  nock = require('nock');

chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('produce-enrollment-output-test', function () {
      it.only('should write merge school data with enrollments', async function () {
        let studentApiStub = sinon.stub().returns({
          getSchools: () => new Readable({
            read() {
              this.push('[{"id":1,"school_name":"Springview School","school_number":"RYG-532"}]');
              this.push(null);
            }
          }),
          getEnrollments: () => new Readable({
            read() {
              this.push('[{"id": 2,"student_id": 1,"school_id": 1}]');
              this.push(null);
            }
          })
        });
    
        const passThroughStream = new PassThrough();
        const writeSpy = sinon.spy(passThroughStream,'write');
        let fsStub ={
          createWriteStream: () => passThroughStream,
          unlinkSync() {}
        };
    
        var produce = proxyquire.noCallThru().load('./../../consumer/produce-enrollment-output', {
          './student-api': studentApiStub,
          'fs' : fsStub
        });
    
        await produce();
    
        var response = '';
    
        writeSpy.getCalls().forEach(call => {
          response+=call.args[0];
        });
    
        var array = JSON.parse(response);
    
        expect(array).to.have.length(1);
        var firstItem = array[0];
    
        expect(firstItem).to.have.property('student_id').that.eq(1);
        expect(firstItem).to.have.property('school_id').that.eq(1);
        expect(firstItem).to.have.property('school_name').that.eq("Springview School");
        expect(firstItem).to.have.property('school_number').that.eq("RYG-532");
    
        })
  });