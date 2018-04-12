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

describe('product-student-output tests', function () {

  it("should invoke the call", async function () {
    nock('http://localhost:3000').post('/students')
    .reply(200, [{name: 'Sunil'}]);

    const passThroughStream = new PassThrough();
    const writeSpy = sinon.spy(passThroughStream,'write');
    let fsStub ={
      createWriteStream: () => passThroughStream,
      unlinkSync() {}
    };

    var produce = proxyquire.noCallThru().load('./../../consumer/produce-student-output', {
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

    expect(firstItem).to.have.property('name').that.eq('Sunil');
    expect(firstItem).to.have.property('timeStamp');




  });

  xit('should write data to the file with the timestamp', async function () {



    let studentApiStub = sinon.stub().returns({
      getStudents: () => new Readable({
        read() {
          this.push('[{"name":"Sunil"}]');
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

    var produce = proxyquire.noCallThru().load('./../../consumer/produce-student-output', {
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

    expect(firstItem).to.have.property('name').that.eq('Sunil');
    expect(firstItem).to.have.property('timeStamp');

    })
});
