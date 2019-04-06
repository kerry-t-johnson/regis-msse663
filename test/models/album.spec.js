const chai = require('chai');
const expect = chai.expect;
const config = require('../../config/env');
const db = require('../../server/models/album');
const path = require('path');
const testUtils = require('../utils');
chai.use(require('chai-as-promised'));

describe('AlbumDb', () => {

    beforeEach(async () => {
        await testUtils.beforeEach();
    });

    it('should be able to create an album', async () => {
        const test_name = testUtils.generateTestName();
        const test_desc = testUtils.generateTestParagraphs();

        const album = await db.createAlbum(test_name, test_name, { album_description: test_desc});

        expect(album).to.have.property('album_name', test_name);
        expect(album).to.have.property('album_dir', test_name);
        expect(album).to.have.property('album_description', test_desc);
        expect(album).to.have.property('album_path', path.join(config.album_root, album.album_dir));
    });

    it('should create and find multiple albums', async () => {
        for(let i = 0; i < 10; ++i) {
            const test_name = testUtils.generateTestName();
            const test_desc = testUtils.generateTestParagraphs();

            await db.createAlbum(test_name, test_name, {album_description: test_desc});
        }

        const results = await db.allAlbums();

        expect(results).to.have.lengthOf(10);
    });

    it('should find using offset', async () => {
        for(let i = 0; i < 10; ++i) {
            const test_name = testUtils.generateTestName();
            const test_desc = testUtils.generateTestParagraphs();

            await db.createAlbum(test_name, test_name, {album_description: test_desc});
        }

        const results = await db.allAlbums({offset: 5});

        expect(results).to.have.lengthOf(5);
    });

    it('should find using limit', async () => {
        for(let i = 0; i < 10; ++i) {
            const test_name = testUtils.generateTestName();
            const test_desc = testUtils.generateTestParagraphs();

            await db.createAlbum(test_name, test_name, {album_description: test_desc});
        }

        const results = await db.allAlbums({limit: 2});

        expect(results).to.have.lengthOf(2);
    });

});
