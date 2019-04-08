const chai = require('chai');
const expect = chai.expect;
const AlbumDb = require('../../server/models/AlbumModel');
const UserDb = require('../../server/models/UserModel');
const testUtils = require('../utils');
chai.use(require('chai-as-promised'));

describe('Album Model', () => {

    const test_username = 'test-user';
    const test_password = 'password';

    beforeEach(async () => {
        await testUtils.beforeEach();
    });

    it('should be able to create an album', async () => {
        const user = await UserDb.createUser(test_username, test_password);
        const test_album_name = testUtils.generateTestName();
        const test_album_desc = testUtils.generateTestParagraphs();

        const album = await AlbumDb.createAlbum(user, test_album_name, { album_description: test_album_desc});

        expect(album).to.have.property('album_name', test_album_name);
        expect(album).to.have.property('album_description', test_album_desc);
        expect(album).to.have.property('user', user);
    });

    it('should create and find multiple albums', async () => {
        const user = await UserDb.createUser(test_username, test_password);

        for(let i = 0; i < 10; ++i) {
            const test_album_name = testUtils.generateTestName();
            const test_album_desc = testUtils.generateTestParagraphs();

            await AlbumDb.createAlbum(user, test_album_name, {album_description: test_album_desc});
        }

        const results = await AlbumDb.allAlbums();

        expect(results).to.have.lengthOf(10);
    });

    it('should find using offset', async () => {
        const user = await UserDb.createUser(test_username, test_password);

        for(let i = 0; i < 10; ++i) {
            const test_album_name = testUtils.generateTestName();
            const test_album_desc = testUtils.generateTestParagraphs();

            await AlbumDb.createAlbum(user, test_album_name, {album_description: test_album_desc});
        }

        const results = await AlbumDb.allAlbums({offset: 5});

        expect(results).to.have.lengthOf(5);
    });

    it('should find using limit', async () => {
        const user = await UserDb.createUser(test_username, test_password);

        for(let i = 0; i < 10; ++i) {
            const test_album_name = testUtils.generateTestName();
            const test_album_desc = testUtils.generateTestParagraphs();

            await AlbumDb.createAlbum(user, test_album_name, {album_description: test_album_desc});
        }

        const results = await AlbumDb.allAlbums({limit: 2});

        expect(results).to.have.lengthOf(2);
    });

});
