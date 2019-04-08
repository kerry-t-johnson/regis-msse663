const chai = require('chai');
const config = require('../../config/env');
const expect = chai.expect;
const fs = require('fs-extra');
const path = require('path');
const server = require('../../server');
const testUtils = require('../utils');
const UserDb = require('../../server/models/UserModel');
chai.use(require('chai-as-promised'));
chai.use(require('chai-http'));
chai.use(require('chai-fs'));

describe('Album API', () => {

    beforeEach(async () => {
        await testUtils.beforeEach();

        // const user = await UserDb.createUser(test_username, test_password);

    });

    it('GET empty array', (done) => {
        chai.request(server)
            .get('/api/album')
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.be.a('array');
                expect(res.body).to.have.lengthOf(0);
                done();
            });
    });

    it('POST new album', (done) => {
        const agent = chai.request.agent(server);

        // Register/login:
        createTestUser(agent).then(() => {
            const albumName = testUtils.generateTestName();
            const albumDesc = testUtils.generateTestParagraphs();

            agent.post('/api/album')
                .send({
                    album_name: albumName,
                    album_description: albumDesc
                })
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.have.property('album_name', albumName);
                    expect(res.body).to.have.property('album_description', albumDesc);
                    done();
                });
        });
    });

    it("GET albums", (done) => {
        const agent = chai.request.agent(server);

        // Register/login:
        createTestUser(agent).then(() => {
            const albumName = testUtils.generateTestName();
            const albumDesc = testUtils.generateTestParagraphs();

            agent.post('/api/album')
                .send({
                    album_name: albumName,
                    album_description: albumDesc
                })
                .end(() => {
                    agent.get('/api/album')
                        .end((err, res) => {
                            expect(res).to.have.status(200);
                            expect(res.body).to.be.a('array');
                            expect(res.body).to.have.lengthOf(1);
                            done();
                        });
                });
        });
    });

    it("GET specific album", (done) => {
        const agent = chai.request.agent(server);

        // Register/login:
        createTestUser(agent).then(() => {
            const albumName = testUtils.generateTestName();
            const albumDesc = testUtils.generateTestParagraphs();

            agent.post('/api/album')
                .send({
                    album_name: albumName,
                    album_description: albumDesc
                })
                .end(() => {
                    agent.get(`/api/album/${albumName}`)
                        .end((err, res) => {
                            expect(res).to.have.status(200);
                            expect(res.body).to.have.property('album_name', albumName);
                            expect(res.body).to.have.property('album_description', albumDesc);
                            expect(res.body.photos).to.be.a('array');
                            expect(res.body.photos).to.have.lengthOf(0);
                            done();
                        });
                });
        });
    });

    it('POST an image to an album', (done) => {
        const agent = chai.request.agent(server);

        // Register/login:
        createTestUser(agent).then(() => {
            const albumName = testUtils.generateTestName();
            const albumDesc = testUtils.generateTestParagraphs();
            const photoName = testUtils.generateTestName();
            const photoDesc = testUtils.generateTestParagraphs();

            agent.post('/api/album')
                .send({
                    album_name: albumName,
                    album_description: albumDesc
                })
                .then(() => {
                    agent.post(`/api/album/${albumName}`)
                        .field('photo_title', photoName)
                        .field('photo_description', photoDesc)
                        .attach(
                            'image',
                            fs.readFileSync('test/data/image.jpg'),
                            'image.jpg'
                        )
                        .end((err, res) => {
                            expect(res).to.have.status(200);
                            expect(res.body).to.have.property('photo_title', photoName);
                            expect(res.body).to.have.property('photo_description', photoDesc);
                            expect(res.body).to.have.property('photo_url');
                            expect(res.body.photo_url).to.be.a.file();
                            done();
                        });
                });
        });
    });

    it('DELETE an image from an album', (done) => {
        const agent = chai.request.agent(server);

        // Register/login:
        createTestUser(agent).then(() => {
            const image = 'test/data/image.jpg';
            const albumName = testUtils.generateTestName();
            const albumDesc = testUtils.generateTestParagraphs();
            const photoName = testUtils.generateTestName();
            const photoDesc = testUtils.generateTestParagraphs();
            const photoUrl = path.join(config.album_root, albumName, path.basename(image));

            agent.post('/api/album')
                .send({
                    album_name: albumName,
                    album_description: albumDesc
                })
                .then(() => {
                    agent.post(`/api/album/${albumName}`)
                        .field('photo_title', photoName)
                        .field('photo_description', photoDesc)
                        .attach(
                            'image',
                            fs.readFileSync(image),
                            path.basename(image)
                        )
                        .then(() => {
                            agent.delete(`/api/album/${albumName}/${photoName}`)
                                .end((err, res) => {
                                    expect(res).to.have.status(200);
                                    expect(photoUrl).to.not.be.a.path();
                                    done();
                                });

                        });
                });
        });
    });

    const createTestUser = async (agent) => {
        return new Promise((resolve, reject) => {
            const testUsername = testUtils.generateTestName();
            const testPassword = testUtils.generateTestName();
            const testFirstname = testUtils.generateTestName();
            const testLastname = testUtils.generateTestName();

            agent.post('/api/user/register')
                .send({
                    email: testUsername,
                    password: testPassword,
                    first_name: testFirstname,
                    last_name: testLastname
                })
                .then(() => {
                    agent.post('/api/user/login')
                        .send({
                            email: testUsername,
                            password: testPassword                        })
                        .then((res) => {
                            resolve(res.body);
                        });
                });
        });

    }

});

