import { Readable, PassThrough } from 'stream';

const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const expect = chai.expect;


chai.use(sinonChai);

var calculator =  {
  addNNumbers(...args) { //Really expensive call
    var result = 0;
    args.forEach(number=> result+=number);
    return result;
  },
  add2Numbers(num1, num2) {
    return this.addNNumbers(num1, num2);
  },
  add3Numbers(num1, num2, num3) {
    return this.addNNumbers(num1, num2, num3);
  }
}

describe("Calculator" , function() {

  calculator.addNNumbers = sinon.mock();
  calculator.addNNumbers.atLeast(1).atMost(3);


  it("should be able to add two numbers", function () {
    var result = add2Numbers(3,4);
    expect(result).to.be.equals(6);
  });

  xit('should be able to add 3 numbers', function() {
    var result = add3Numbers(1,2,3);
    expect(result).to.be.equals(6);
  });

  xit('should be able to add n numbers', function() {

  });


  xit('should invoke addNNumber only once', function() {
    var spy  = sinon.spy(calculator,'addNNumbers');

    var result = calculator.add2Numbers(2,3);

    expect(result).to.be.equals(5);
    expect(spy.callCount).to.be.equals(1);
    var firstCallArguments = spy.firstCall.args;

   expect(calculator.addNNumbers.callCount).to.be.equals(5);
   expect(calculator.addNNumbers).to.have.callCount(5);
  });

  it.only('should return the value which is returned by addNNUmbers functions', function() {
    // calculat.addNNumbers = function () {
    //   // add all spy functionality

    //   throw new Error()
    // }
    calculator.addNNumbers = sinon.mock();
    calculator.addNNumbers.atLeast(1).atMost(3);
    var result = addNNumbers(2,3)    ;

    calculator.addNNumbers.verify();
});


var myStream = new Readable({
  read() {
    //fetch from api

    getStudents()
    .then(student => {
      this.push(student);
    })
  }  



  it("test the api read stream", function (done) {
    
    myStream.on('data', (student) => {
      expect(student).to.have.property(studentId).to.equals(123);
      
    })

    myStream.on("end", () => {
      done();
    })

    var passThrough = new PassThrough();
    myStream.pipe(passThrough);

    var spy = sinon.spy(passThrough,'write');

    passThrough.on('data', () => {

    });
  });
})