const chai = require('chai');
const config = require('../../config/env');
const expect = chai.expect;
const fs = require('fs-extra');
const path = require('path');
const server = require('../../server');
const testUtils = require('../utils');
chai.use(require('chai-as-promised'));
chai.use(require('chai-http'));
chai.use(require('chai-fs'));

describe('Album API', () => {

    beforeEach(async () => {
        await testUtils.beforeEach();
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
        const albumName = testUtils.generateTestName();
        const albumDesc = testUtils.generateTestParagraphs();

        chai.request(server)
            .post('/api/album')
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

    it("GET albums", (done) => {
        const albumName = testUtils.generateTestName();
        const albumDesc = testUtils.generateTestParagraphs();

        chai.request(server)
            .post('/api/album')
            .send({
                album_name: albumName,
                album_description: albumDesc
            })
            .then(() => {
                chai.request(server)
                    .get('/api/album')
                    .end((err, res) => {
                        expect(res).to.have.status(200);
                        expect(res.body).to.be.a('array');
                        expect(res.body).to.have.lengthOf(1);
                        done();
                    });
            });
    });

    it("GET specific album", (done) => {
        const albumName = testUtils.generateTestName();
        const albumDesc = testUtils.generateTestParagraphs();

        chai.request(server)
            .post('/api/album')
            .send({
                album_name: albumName,
                album_description: albumDesc
            })
            .then(() => {
                chai.request(server)
                    .get(`/api/album/${albumName}`)
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

    it('POST an image to an album', (done) => {
        const albumName = testUtils.generateTestName();
        const albumDesc = testUtils.generateTestParagraphs();
        const photoName = testUtils.generateTestName();
        const photoDesc = testUtils.generateTestParagraphs();

        chai.request(server)
            .post('/api/album')
            .send({
                album_name: albumName,
                album_description: albumDesc
            })
            .then(() => {
                chai.request(server)
                    .post(`/api/album/${albumName}`)
                    .field('photo_title', photoName)
                    .field('photo_description', photoDesc)
                    .attach(
                        'image',
                        fs.readFileSync('albums.bak/breck/image.jpg'),
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

    it('DELETE an image from an album', (done) => {
        const image = 'albums.bak/breck/image.jpg';
        const albumName = testUtils.generateTestName();
        const albumDesc = testUtils.generateTestParagraphs();
        const photoName = testUtils.generateTestName();
        const photoDesc = testUtils.generateTestParagraphs();
        const photoUrl  = path.join(config.album_root, albumName, path.basename(image));

        chai.request(server)
            .post('/api/album')
            .send({
                album_name: albumName,
                album_description: albumDesc
            })
            .then(() => {
                chai.request(server)
                    .post(`/api/album/${albumName}`)
                    .field('photo_title', photoName)
                    .field('photo_description', photoDesc)
                    .attach(
                        'image',
                        fs.readFileSync(image),
                        path.basename(image)
                    )
                    .then(() => {
                        chai.request(server)
                            .delete(`/api/album/${albumName}/${photoName}`)
                            .end((err, res) => {
                                expect(res).to.have.status(200);
                                expect(photoUrl).to.not.be.a.path();
                                done();
                        });

                    });
            });
    });

});

