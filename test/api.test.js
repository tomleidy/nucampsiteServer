const supertest = require('supertest');
const chai = require('chai');
const expect = chai.expect;
const app = require('../app');
const request = supertest(app);
const mongoose = require('mongoose');

const randomRating = () => Math.floor(Math.random() * 5) + 1
const timeString = () => new Date().toString()


const testUserLogin = { username: "testuser5", password: "password" }
const testUserLogin2 = { username: "testuser4", password: "password" }
const testUserSignup = { username: testUserLogin.username, password: testUserLogin.password, firstname: "test", lastname: "user" }
const testAdminLogin = { username: "admin", password: "password" }
let userToken;
let userToken2;
let adminToken;
let testCampsiteId = "";
let testCommentId = "";
let testPromotionId = "";
let testPartnerId = "";


const campsiteTest = () => ({
    name: timeString(),
    image: "image.jpg",
    elevation: Math.floor(Math.random() * 4000),
    description: "Hey, you can only know right now.",
    cost: Math.floor(Math.random() * 100)
})

const commentTest = () => ({ rating: randomRating(), text: timeString() })



// This seems faster than Postman to run every time, but now I need to go through and create tests for everything. Also I'm learning that Express responds to some of these with a 401 instead of a 403, and I'm not sure how to modify that. Or if I even want to.






const postCampsite = (done) => {
    if (!adminToken) return done("missing adminToken");
    request.post(`/campsites`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(campsiteTest())
        .expect(200)
        .end((err, res) => {
            if (err) return done(console.log(err));
            expect(res.body).to.have.property('_id')
            testCampsiteId = res.body._id;
            done();
        })

}
const postComment = (done, token = userToken) => {
    if (!testCampsiteId) return done("missing testCampsiteId")
    request.post(`/campsites/${testCampsiteId}/comments`)
        .set('Authorization', `Bearer ${token}`)
        .send(commentTest())
        .expect(200)
        .end((err, res) => {
            if (err) return done(err);
            expect(res.body).to.have.property('_id')
            testCommentId = res.body._id;
            done();
        })
}



before((done) => {
    mongoose.connection.once('open', done);
});
describe('API tests', function () {

    describe('Initial tests', function () {

        it('GET / should return 200 and text/html', done => {
            request.get('/')
                .expect(200)
                .expect('Content-Type', /html/)
                .end(done)
        });

        /*
        // Not sure how to execute this just once. Need to have a delete method for users, and clean it up after, but ... It works.
        describe('Users endpoints', function () {
            describe('POST /users/signup', function () {
                it(`should be able to signup with ${JSON.stringify(testUserSignup)}`, done => {
                    request.post('/users/signup')
                        .send(testUserSignup)
                        .expect(200)
                        .expect('Content-Type', /json/)
                        .end((err, res) => {
                            if (err) return done(console.log(err));
                            done();
                        });
    
                });
            })
            */
        it(`POST /users/login should be able to login as user with ${JSON.stringify(testUserLogin)}`, done => {
            request.post('/users/login')
                .send(testUserLogin)
                .expect(200)
                .expect('Content-Type', /json/)
                .end((err, res) => {
                    if (err) return done(console.log(err));
                    expect(res.body).to.have.property('token');
                    userToken = res.body.token;
                    done()
                })
        })

        it(`POST /users/login should be able to login as admin with ${JSON.stringify(testAdminLogin)}`, done => {
            request.post('/users/login')
                .send(testAdminLogin)
                .expect(200)
                .expect('Content-Type', /json/)
                .end((err, res) => {
                    if (err) return done(console.log(err));
                    expect(res.body).to.have.property('token');
                    adminToken = res.body.token;
                    done()
                })
        })
        it(`POST /users/login should be able to login second user with ${JSON.stringify(testUserLogin2)}`, done => {
            request.post('/users/login')
                .send(testUserLogin2)
                .expect(200)
                .expect('Content-Type', /json/)
                .end((err, res) => {
                    if (err) return done(console.log(err));
                    expect(res.body).to.have.property('token');
                    userToken2 = res.body.token;
                    done();
                })
        })
    })

    describe('Unauthorized user', function () {
        describe('Campsite endpoints', function () {
            it('GET /campsites should return 200 in JSON when unauthorized', done => {
                request.get('/campsites')
                    .expect(200)
                    .expect('Content-Type', /json/)
                    .end(done)
            })
            it('POST /campsites should return 401 when unauthorized', done => {
                request.post('/campsites')
                    .send(campsiteTest())
                    .expect(401)
                    .end(done)
            })
            it('PUT /campsites should return 401 when unauthorized', done => {
                request.put('/campsites')
                    .send(campsiteTest())
                    .expect(401)
                    .end(done)
            })
            it('DELETE /campsites should return 401 when unauthorized', done => {
                request.delete('/campsites')
                    .expect(401)
                    .end(done)
            })
        });
        describe("Specific campsite endpoints", function () {

            before(function (done) {
                postCampsite(done);
            })
            before(function (done) {
                postComment(done, userToken);
            })
            it(`GET /campsites/campsiteId should return 200 in JSON`, done => {
                request.get(`/campsites/${testCampsiteId}`)
                    .expect(200)
                    .expect('Content-Type', /json/)
                    .end((err, res) => {
                        if (err) done(console.log(err))
                        done();
                    })

            })
            it(`POST /campsites/campsiteId should return 401 when unauthorized`, done => {
                request.post(`/campsites/${testCampsiteId}`)
                    .send(commentTest())
                    .expect(401)
                    .end(done)
            })
            it(`PUT /campsites/campsiteId should return 401 when unauthorized`, done => {
                request.put(`/campsites/${testCampsiteId}`)
                    .send(campsiteTest())
                    .expect(401)
                    .end(done)
            })
            it(`DELETE /campsites/campsiteId should return 401 when unauthorized`, done => {
                request.delete(`/campsites/${testCampsiteId}`)
                    .expect(401)
                    .end(done)
            })
        });
        describe('Campsite comment endpoints', function () {
            it(`GET /campsites/campsiteId/comments should return 200 in JSON`, done => {
                request.get(`/campsites/${testCampsiteId}/comments`)
                    .expect(200)
                    .expect('Content-Type', /json/)
                    .end((err, res) => {
                        if (err) done(console.log(err))
                        done();
                    })

            })
            it(`POST /campsites/campsiteId/comments should return 401 when unauthorized`, done => {
                request.post(`/campsites/${testCampsiteId}/comments`)
                    .send(commentTest())
                    .expect(401)
                    .end(done)
            })
            it(`PUT /campsites/campsiteId/comments should return 401 when unauthorized`, done => {
                request.put(`/campsites/${testCampsiteId}/comments`)
                    .send(campsiteTest())
                    .expect(401)
                    .end(done)
            })
            it(`DELETE /campsites/campsiteId/comments should return 401 when unauthorized`, done => {
                request.delete(`/campsites/${testCampsiteId}/comments`)
                    .expect(401)
                    .end(done)
            })
        })

    })
    describe('Authorized user', function () {


        describe('Campsite endpoints', function () {
            it('GET /campsites should return 200 in JSON when user', done => {
                request.get('/campsites')
                    .set('Authorization', `Bearer ${userToken}`)
                    .expect(200)
                    .expect('Content-Type', /json/)
                    .end(done)
            })
            it('POST /campsites should return 403 when user', done => {
                request.post('/campsites')
                    .set('Authorization', `Bearer ${userToken}`)
                    .send(campsiteTest())
                    .expect(403)
                    .end(done)
            })
            it('PUT /campsites should return 403 when user', done => {
                request.put('/campsites')
                    .set('Authorization', `Bearer ${userToken}`)
                    .send(campsiteTest())
                    .expect(403)
                    .end(done)
            })
            it('DELETE /campsites should return 403 when user', done => {
                request.delete('/campsites')
                    .set('Authorization', `Bearer ${userToken}`)
                    .expect(403)
                    .end(done)
            })
        });




        describe("Specific campsite endpoints", function () {
            it(`GET /campsites/campsiteId should return 200 in JSON when user`, done => {
                request.get(`/campsites/${testCampsiteId}`)
                    .set('Authorization', `Bearer ${userToken}`)
                    .expect(200)
                    .expect('Content-Type', /json/)
                    .end(done)
            })
            it(`POST /campsites/campsiteId should return 403 when user`, done => {
                request.post(`/campsites/${testCampsiteId}`)
                    .set('Authorization', `Bearer ${userToken}`)
                    .send(commentTest())
                    .expect(403)
                    .end(done)
            })
            it(`PUT /campsites/campsiteId should return 403 when user`, done => {
                request.put(`/campsites/${testCampsiteId}`)
                    .set('Authorization', `Bearer ${userToken}`)
                    .send(campsiteTest())
                    .expect(403)
                    .end(done)
            })
            it(`DELETE /campsites/campsiteId should return 403 when user`, done => {
                request.delete(`/campsites/${testCampsiteId}`)
                    .set('Authorization', `Bearer ${userToken}`)
                    .expect(403)
                    .end(done)
            })

        })
        describe('Campsite comment endpoints', function () {
            it(`GET /campsites/campsiteId/comments should return 200 in JSON when user`, done => {
                request.get(`/campsites/${testCampsiteId}/comments`)
                    .set('Authorization', `Bearer ${userToken}`)
                    .expect(200)
                    .expect('Content-Type', /json/)
                    .end((err, res) => {
                        if (err) done(console.log(err))
                        done();
                    })

            })
            it(`POST /campsites/campsiteId/comments should return 200 when user2`, done => {
                request.post(`/campsites/${testCampsiteId}/comments`)
                    .set('Authorization', `Bearer ${userToken2}`)
                    .send(commentTest())
                    .expect(200)
                    .end((err, res) => {
                        if (err) done(err)
                        expect(res.body).to.have.property('_id')
                        testCommentId = res.body._id;
                        done();
                    })
            })
            it(`PUT /campsites/campsiteId/comments should return 403 when user`, done => {
                request.put(`/campsites/${testCampsiteId}/comments`)
                    .set('Authorization', `Bearer ${userToken}`)
                    .send(campsiteTest())
                    .expect(403)
                    .end(done)
            })
            it(`DELETE /campsites/campsiteId/comments should return 403 when user`, done => {
                request.delete(`/campsites/${testCampsiteId}/comments`)
                    .set('Authorization', `Bearer ${userToken}`)
                    .expect(403)
                    .end(done)
            })
        })
    })
    describe('Admin', function () {
        describe('Campsite specific comment endpoints', function () {
            it(`GET /campsites/campsiteId/comments/commentId should return 200 in JSON when admin`, done => {
                request.get(`/campsites/${testCampsiteId}/comments/${testCommentId}`)
                    .set('Authorization', `Bearer ${adminToken}`)
                    .expect(200)
                    .expect('Content-Type', /json/)
                    .end((err, res) => {
                        if (err) done();
                        console.log(testCampsiteId, testCommentId);
                        done()
                    })

            })
            it(`POST /campsites/campsiteId/comments/commentId should return 200 when admin`, done => {
                request.post(`/campsites/${testCampsiteId}/comments/${testCommentId}`)
                    .set('Authorization', `Bearer ${adminToken}`)
                    .send(commentTest())
                    .expect(200)
                    .end((err, res) => {
                        if (err) done(err)
                        expect(res.body).to.have.property('_id')
                        testCommentId = res.body._id;
                        done();
                    })
            })
            it(`PUT /campsites/campsiteId/comments/commentId should return 403 when admin`, done => {
                request.put(`/campsites/${testCampsiteId}/comments/${testCommentId}`)
                    .set('Authorization', `Bearer ${adminToken}`)
                    .send(campsiteTest())
                    .expect(403)
                    .end(done)
            })
            it(`DELETE /campsites/campsiteId/comments/commentId should return 200 when admin`, done => {
                request.delete(`/campsites/${testCampsiteId}/comments/${testCommentId}`)
                    .set('Authorization', `Bearer ${adminToken}`)
                    .expect(200)
                    .end((err, res) => {
                        console.log(testCommentId)
                        if (err) done(err);
                        expect(res.body).to.have.property('featured');
                        done();
                    })
            })

        })
        describe('Campsite comment endpoints', function () {
            before((done) => {
                request.post(`/campsites`)
                    .send(campsiteTest())
                    .set('Authorization', `Bearer ${adminToken}`)
                    .expect(200)
                    .expect('Content-Type', /json/)
                    .end((err, res) => {
                        if (err) return done(err);
                        expect(res.body).to.have.property('_id')
                        testCampsiteId = res.body._id;
                        done()
                    })

            })
            before((done) => {
                request.post(`/campsites/${testCampsiteId}/comments`)
                    .set('Authorization', `Bearer ${userToken2}`)
                    .send(commentTest())
                    .expect(200)
                    .end((err, res) => {
                        if (err) done(err)
                        expect(res.body).to.have.property('_id')
                        testCommentId = res.body._id;
                        done();
                    })
            })
            it(`GET /campsites/campsiteId/comments should return 200 in JSON when admin`, done => {
                request.get(`/campsites/${testCampsiteId}/comments`)
                    .set('Authorization', `Bearer ${adminToken}`)
                    .expect(200)
                    .expect('Content-Type', /json/)
                    .end((err, res) => {
                        if (err) done(console.log(err))
                        done();
                    })

            })
            it(`POST /campsites/campsiteId/comments should return 200 when admin`, done => {
                request.post(`/campsites/${testCampsiteId}/comments`)
                    .set('Authorization', `Bearer ${adminToken}`)
                    .send(commentTest())
                    .expect(200)
                    .end((err, res) => {
                        if (err) done(err)
                        expect(res.body).to.have.property('_id')
                        testCommentId = res.body._id;
                        done();
                    })
            })
            it(`PUT /campsites/campsiteId/comments should return 403 when admin`, done => {
                request.put(`/campsites/${testCampsiteId}/comments`)
                    .set('Authorization', `Bearer ${adminToken}`)
                    .send(campsiteTest())
                    .expect(403)
                    .end(done)
            })
            it(`DELETE /campsites/campsiteId/comments should return 200 when admin`, done => {
                request.delete(`/campsites/${testCampsiteId}/comments`)
                    .set('Authorization', `Bearer ${adminToken}`)
                    .expect(200)
                    .end((err, res) => {
                        if (err) done(err);
                        expect(res.body).to.have.property('featured');
                        testCommentId = "";
                        done();
                    })
            })

        })


        describe('Campsite endpoints', function () {
            it('GET /campsites should return 200 in JSON when admin', done => {
                request.get('/campsites')
                    .set('Authorization', `Bearer ${adminToken}`)
                    .expect(200)
                    .expect('Content-Type', /json/)
                    .end(done)
            });
            it(`POST /campsites should return 200 when admin`, done => {
                request.post('/campsites')
                    .set('Authorization', `Bearer ${adminToken}`)
                    .send(campsiteTest())
                    .expect(200)
                    .expect('Content-Type', /json/)

                    .end((err, res) => {
                        if (err) return done(err);
                        expect(res.body).to.have.property('_id');
                        testCampsiteId = res.body._id;
                        done();
                    })
            })
            it('PUT /campsites should return 403 when admin', done => {
                request.put('/campsites')
                    .set('Authorization', `Bearer ${adminToken}`)
                    .send(campsiteTest())
                    .expect(403)
                    .end(done)
            })
            it('DELETE /campsites should return 200 when admin', done => {
                request.delete('/campsites')
                    .set('Authorization', `Bearer ${adminToken}`)
                    .expect(200)
                    .end((err, res) => {
                        if (err) done(console.log(err));
                        expect(res.body).to.have.property('deletedCount');
                        testCampsiteId = "";
                        done()
                    })
            })
        });
    })

    describe('Final tests/cleanup', function (done) {
        it('GET /users/logout for user should redirect to /', done => {
            request.get('/users/logout')
                .set('Authorization', `Bearer ${userToken}`)
                .expect(302)
                .end((err, res) => {
                    if (err) return done(err);
                    done();
                });
        })
    })
})

after(done => {
    request.get('/users/logout')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(302)
        .end((err, res) => {
            if (err) return done(err);
            done();
        });
})



module.exports = {
    testUserLogin, testUserLogin2, testAdminLogin,
    userToken, userToken2, adminToken,
    campsiteTest, commentTest,
    postCampsite, postComment
}
