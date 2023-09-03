const supertest = require('supertest');
const chai = require('chai');
const expect = chai.expect;
const app = require('../app');
const request = supertest(app);
const { postCampsite, postComment, fakeCampsite, fakeComment } = require('./utilities');
const { logins, tokens, posts } = require('./identification');



describe('POST endpoints', () => {
    describe('Unauthorized', () => {
        it('POST /campsites should return 401 when unauthorized', done => {
            request.post('/campsites')
                .send(fakeCampsite())
                .expect(401)
                .end(done)
        })

        it(`POST /campsites/campsiteId should return 401 when unauthorized`, done => {
            request.post(`/campsites/${posts.campsiteId}`)
                .send(fakeComment())
                .expect(401)
                .end(done)
        })

        it(`POST /campsites/campsiteId/comments should return 401 when unauthorized`, done => {
            request.post(`/campsites/${posts.campsiteId}/comments`)
                .send(fakeComment())
                .expect(401)
                .end(done)
        })
        it('POST /imageUpload should return 401 when unauthorized', function (done) {
            request.post('/imageUpload')
                .expect(401)
                .end(done);
        });

    })
    describe('User', () => {
        it('POST /campsites should return 403 when user', done => {
            request.post('/campsites')
                .set('Authorization', `Bearer ${tokens.user1}`)
                .send(fakeCampsite())
                .expect(403)
                .end(done)
        })
        it(`POST /campsites/campsiteId should return 403 when user`, done => {
            request.post(`/campsites/${posts.campsiteId}`)
                .set('Authorization', `Bearer ${tokens.user1}`)
                .send(fakeComment())
                .expect(403)
                .end(done)
        })
        it('POST /imageUpload should return 403 for user1', function (done) {
            request
                .post('/imageUpload')
                .set('Authorization', `Bearer ${tokens.user1}`)
                .attach('imageFile', __dirname + '/sample-image.jpg')
                .expect(403)
                .end(done);
        });


    })
    describe('Admin', () => {


        it(`POST /campsites should return 200 when admin`, done => {
            request.post('/campsites')
                .set('Authorization', `Bearer ${tokens.admin}`)
                .send(fakeCampsite())
                .expect(200)
                .expect('Content-Type', /json/)
                .end((err, res) => {
                    if (err) return done(err);
                    expect(res.body).to.have.property('_id');
                    return done();
                })
        })

        it(`POST /campsites/${posts.commentCampsiteId}/comments/${posts.commentId} should return 403 when admin`, done => {
            if (!posts.commentId || !posts.commentCampsiteId) return done(new Error("missing commentId"))
            request.post(`/campsites/${posts.commentCampsiteId}/comments/${posts.commentId}`)
                .set('Authorization', `Bearer ${tokens.admin}`)
                .send(fakeComment())
                .expect(403)
                .end(done);
        })


        it(`POST /campsites/campsiteId/comments should return 200 when admin`, done => {
            request.post(`/campsites/${posts.campsiteId}/comments`)
                .set('Authorization', `Bearer ${tokens.admin}`)
                .send(fakeComment())
                .expect(200)
                .end((err, res) => {
                    if (err) return done(err)
                    expect(res.body).to.have.property('_id')
                    done();
                })
        })
    })
    it('POST /imageUpload should return 200 and appropriate JSON response for admin', function (done) {
        request
            .post('/imageUpload')
            .set('Authorization', `Bearer ${tokens.admin}`)
            .attach('imageFile', __dirname + '/sample-image.jpg')
            .expect(200)
            .expect('Content-Type', /json/)
            .end(
                (err, res) => {
                    if (err) return done(err);
                    expect(res.body).to.have.property('filename');
                    expect(res.body).to.have.property('size');
                    expect(res.body).to.have.property('path');
                    done();
                });
    });

})