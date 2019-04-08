const chai = require('chai');
const expect = chai.expect;
const server = require('../../server');
const testUtils = require('../utils');
chai.use(require('chai-as-promised'));
chai.use(require('chai-http'));
chai.use(require('chai-fs'));

describe('User API', () => {

    beforeEach(async () => {
        await testUtils.beforeEach();
    });

    it('should register a new user', (done) => {
        const testUsername = testUtils.generateTestName();
        const testPassword = testUtils.generateTestName();
        const testFirstname = testUtils.generateTestName();
        const testLastname = testUtils.generateTestName();

        chai.request(server)
            .post('/api/user/register')
            .send({
                email: testUsername,
                password: testPassword,
                first_name: testFirstname,
                last_name: testLastname
            })
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('email', testUsername);
                expect(res.body).to.have.property('first_name', testFirstname);
                expect(res.body).to.have.property('last_name', testLastname);
                done();
            });
    });

    it('should prevent duplicate usernames', (done) => {
        const testUsername = testUtils.generateTestName();
        const testPassword = testUtils.generateTestName();
        const testFirstname = testUtils.generateTestName();
        const testLastname = testUtils.generateTestName();

        chai.request(server)
            .post('/api/user/register')
            .send({
                email: testUsername,
                password: testPassword,
                first_name: testFirstname,
                last_name: testLastname
            })
            .end((err, res) => {
                expect(res).to.have.status(200);

                chai.request(server)
                    .post('/api/user/register')
                    .send({
                        email: testUsername,
                        password: testPassword,
                        first_name: testFirstname,
                        last_name: testLastname
                    })
                    .end((err, res) => {
                        expect(res).to.have.status(409);
                        done();
                    });
            });
    });

    it('should allow login for registered users', (done) => {
        const testUsername = testUtils.generateTestName();
        const testPassword = testUtils.generateTestName();
        const testFirstname = testUtils.generateTestName();
        const testLastname = testUtils.generateTestName();

        chai.request(server)
            .post('/api/user/register')
            .send({
                email: testUsername,
                password: testPassword,
                first_name: testFirstname,
                last_name: testLastname
            })
            .end((err, res) => {
                expect(res).to.have.status(200);

                chai.request(server)
                    .post('/api/user/login')
                    .send({
                        email: testUsername,
                        password: testPassword
                    })
                    .end((err, res) => {
                        expect(res).to.have.status(200);
                        done();
                    });
            });
    });

    it('should NOT allow login for unregistered users', (done) => {
        const testUsername = testUtils.generateTestName();
        const testPassword = testUtils.generateTestName();

        chai.request(server)
            .post('/api/user/login')
            .send({
                email: testUsername,
                password: testPassword            })
            .end((err, res) => {
                expect(res).to.have.status(401);
                done();
            });
    });

    it('should NOT allow login with bad password', (done) => {
        const testUsername = testUtils.generateTestName();
        const testPassword = testUtils.generateTestName();
        const testFirstname = testUtils.generateTestName();
        const testLastname = testUtils.generateTestName();

        chai.request(server)
            .post('/api/user/register')
            .send({
                email: testUsername,
                password: testPassword,
                first_name: testFirstname,
                last_name: testLastname
            })
            .end((err, res) => {
                expect(res).to.have.status(200);

                chai.request(server)
                    .post('/api/user/login')
                    .send({
                        email: testUsername,
                        password: 'foo'
                    })
                    .end((err, res) => {
                        expect(res).to.have.status(401);
                        done();
                    });
            });
    });

    it('should allow logout', (done) => {
        const testUsername = testUtils.generateTestName();
        const testPassword = testUtils.generateTestName();
        const testFirstname = testUtils.generateTestName();
        const testLastname = testUtils.generateTestName();

        chai.request(server)
            .post('/api/user/register')
            .send({
                email: testUsername,
                password: testPassword,
                first_name: testFirstname,
                last_name: testLastname
            })
            .end((err, res) => {
                expect(res).to.have.status(200);

                chai.request(server)
                    .post('/api/user/logout')
                    .end((err, res) => {
                        expect(res).to.have.status(200);
                        done();
                    });
            });
    });

});

