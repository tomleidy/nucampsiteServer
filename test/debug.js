const supertest = require('supertest');
const chai = require('chai');
const expect = chai.expect;
const app = require('../app');
const { secPort } = require('../config')
const request = supertest(`https://localhost:${secPort}`);
const mongoose = require('mongoose');
const { postCampsite, postComment, loginUser1, loginUser2, loginAdmin } = require('./utilities');
const { logins, tokens, posts } = require('./identification');



describe('Debug tests (desperation)', function () {
    it('GET /imageUpload should return 301', function (done) {
        request.get('/imageUpload')
            .expect(301)
            .end(done);

    })
    it('GET /imageUpload should follow a 301 and expect a 403', function (done) {

        request.get('/imageUpload')
            .redirects(1)
            .expect(403)
            .catch(err => {
                console.error('Request failed with error:', err);
                console.error('Failed request details:', err.request);
                throw err;
            });
    })
})