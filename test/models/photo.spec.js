const albumDb = require('../../server/models/album');
const chai = require('chai');
const expect = chai.expect;
const config = require('../../config/env');
const path = require('path');
const photoDb = require('../../server/models/photo');
const testUtils = require('../utils');
chai.use(require('chai-as-promised'));

describe('PhotoDb', () => {

    beforeEach(async () => {
        await testUtils.beforeEach();
    });

    it('should be able to create a photo in an album', async () => {
        const album = await albumDb.createAlbum(testUtils.generateTestName());

        const photoName = testUtils.generateTestName();
        const photoDesc = testUtils.generateTestParagraphs();
        const photoFile = `${photoName}.jpg`;

        const photo = await photoDb.createPhoto(album, photoName, photoFile, { photo_description: photoDesc});

        expect(photo).to.have.property('photo_title', photoName);
        expect(photo).to.have.property('photo_description', photoDesc);
        expect(photo).to.have.property('photo_url', path.join(config.album_root, album.album_dir, photoFile));
    });

    it('should create and find multiple photos in an album', async () => {
        const album = await albumDb.createAlbum(testUtils.generateTestName());

        for(let i = 0; i < 10; ++i) {
            const photoName = testUtils.generateTestName();
            const photoDesc = testUtils.generateTestParagraphs();

            await photoDb.createPhoto(album, photoName, `${photoName}.jpg`, {photo_description: photoDesc});
        }

        const results = await photoDb.photosForAlbum(album);

        expect(results).to.have.lengthOf(10);
    });

    it('should find using offset', async () => {
        const album = await albumDb.createAlbum(testUtils.generateTestName());

        for(let i = 0; i < 10; ++i) {
            const photoName = testUtils.generateTestName();
            const photoDesc = testUtils.generateTestParagraphs();

            await photoDb.createPhoto(album, photoName, `${photoName}.jpg`, {photo_description: photoDesc});
        }

        const results = await photoDb.photosForAlbum(album,{offset: 5});

        expect(results).to.have.lengthOf(5);
    });

    it('should find using limit', async () => {
        const album = await albumDb.createAlbum(testUtils.generateTestName());

        for(let i = 0; i < 10; ++i) {
            const photoName = testUtils.generateTestName();
            const photoDesc = testUtils.generateTestParagraphs();

            await photoDb.createPhoto(album, photoName, `${photoName}.jpg`, {photo_description: photoDesc});
        }

        const results = await photoDb.photosForAlbum(album,{limit: 2});

        expect(results).to.have.lengthOf(2);
    });

});
