const supertest = require('supertest');
const chai = require('chai');
const expect = chai.expect;

const app = require('../app');
const request = supertest(app);
let userToken = {};
let adminToken = {};
let campsiteTest = {
    name: Date.toString(),
    image: "",
    elevation: Math.floor(Math.random() * 4000),
    description: "Hey, you can only know right now.",
    cost: Math.floor(Math.random() * 100),
    featured: false
}

// This seems faster than Postman every time, but now I need to go through and create tests for everything. Also I'm learning that Express responds to some of these with a 401 instead of a 403, and I'm not sure how.

describe('API tests', function () {
    before(function (done) { this.timeout(4000); setTimeout(done, 3000); })
    describe('GET /', function () {
        it('should return 200 and text/html', done => {
            request.get('/')
                .expect(200)
                .expect('Content-Type', /html/)
                .end(done)
        });
    });
    describe('Campsite endpoints', function () {
        describe('GET /campsites', function () {
            it('should return 200 in JSON for GET /campsites', done => {
                request.get('/campsites')
                    .expect(200)
                    .expect('Content-Type', /json/)
                    .end(done)
            })
        });
        describe('POST /campsites', function () {
            it('should return 401 when unauthorized POST /campsites', done => {
                request.post('/campsites')
                    .send(campsiteTest)
                    .expect(401)
                    .end(done)
            })
        })
        describe('PUT /campsiites', function () {
            it('should return 401 when unauthorized PUT /campsites', done => {
                request.post('/campsites')
                    .send(campsiteTest)
                    .expect(401)
                    .end(done)
            })
        })
    });
})

/*
        describe('GET /partners', function() { {
            it('should return 200 in JSON', done => {
                request.get('/partners')
                    .expect(200)
                    .expect('Content-Type', /json/)
                    .end(done)
            })
        });
        describe('GET /promotions', function() { {
            it('should return 200 in JSON', done => {
                request.get('/promotions')
                    .expect(200)
                    .expect('Content-Type', /json/)
                    .end(done)
            })
        });
    });

    */