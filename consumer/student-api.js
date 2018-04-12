
const http = require('http');
class StudentApi {
  constructor() {
    this.options = {
      host: 'localhost',
      path: '',
      port: 3000,
      method: 'GET'
    }
  }
    
  async getStudents() {
    return this.fetchData('/students');
  }

  async fetchData(url) {
    var options = this.options;
    options.path = url;
    return new Promise((resolve) => {
      http.request(options, (response) => {
        resolve(response)
      }).end();
    });
  }

  async getSchools() {
    return this.fetchData("/schools");
  }

  async getEnrollments() {
    return this.fetchData('/enrollments');
  }
}

module.exports = StudentApi