const supertest = require('supertest');
const chai = require('chai');
const expect = chai.expect;

const app = require('../path-to-your-express-app');  // Adjust the path to point to your Express app file
const request = supertest(app);

describe('API tests', function() {

    describe('POST /signin', function() {
        it('should authenticate a user with valid credentials', function(done) {
            const userData = {
                username: 'testuser',
                password: 'testpassword'
            };

            request.post('/signin')
                .send(userData)
                .expect(200)  // Expecting HTTP status code 200
                .end(function(err, res) {
                    if (err) return done(err);

                    expect(res.body).to.have.property('token');  // Assuming server responds with a token on successful signin
                    done();
                });
        });

        // You can add more tests here...
    });

    // You can add more endpoint tests here...

});
