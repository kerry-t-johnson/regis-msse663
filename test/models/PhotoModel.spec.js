const AlbumDb = require('../../server/models/AlbumModel');
const chai = require('chai');
const expect = chai.expect;
const PhotoDb = require('../../server/models/PhotoModel');
const testUtils = require('../utils');
const UserDb = require('../../server/models/UserModel');
chai.use(require('chai-as-promised'));

describe('PhotoDb', () => {

    beforeEach(async () => {
        await testUtils.beforeEach();
    });

    it('should be able to create a photo in an album', async () => {
        const album = await createTestAlbum();

        const photoName = testUtils.generateTestName();
        const photoDesc = testUtils.generateTestParagraphs();
        const photoFile = `${photoName}.jpg`;

        const photo = await PhotoDb.createPhoto(album, photoName, photoFile, { photo_description: photoDesc});

        expect(photo).to.have.property('photo_title', photoName);
        expect(photo).to.have.property('photo_description', photoDesc);
    });

    it('should create and find multiple photos in an album', async () => {
        const album = await createTestAlbum();

        for(let i = 0; i < 10; ++i) {
            const photoName = testUtils.generateTestName();
            const photoDesc = testUtils.generateTestParagraphs();

            await PhotoDb.createPhoto(album, photoName, `${photoName}.jpg`, {photo_description: photoDesc});
        }

        const results = await PhotoDb.photosForAlbum(album);

        expect(results).to.have.lengthOf(10);
    });

    it('should find using offset', async () => {
        const album = await createTestAlbum();

        for(let i = 0; i < 10; ++i) {
            const photoName = testUtils.generateTestName();
            const photoDesc = testUtils.generateTestParagraphs();

            await PhotoDb.createPhoto(album, photoName, `${photoName}.jpg`, {photo_description: photoDesc});
        }

        const results = await PhotoDb.photosForAlbum(album,{offset: 5});

        expect(results).to.have.lengthOf(5);
    });

    it('should find using limit', async () => {
        const album = await createTestAlbum();

        for(let i = 0; i < 10; ++i) {
            const photoName = testUtils.generateTestName();
            const photoDesc = testUtils.generateTestParagraphs();

            await PhotoDb.createPhoto(album, photoName, `${photoName}.jpg`, {photo_description: photoDesc});
        }

        const results = await PhotoDb.photosForAlbum(album,{limit: 2});

        expect(results).to.have.lengthOf(2);
    });

});

createTestAlbum = async () => {

    const test_username = 'test-user';
    const test_password = 'password';

    const user = await UserDb.createUser(test_username, test_password);
    const test_album_name = testUtils.generateTestName();
    const test_album_desc = testUtils.generateTestParagraphs();

    return await AlbumDb.createAlbum(user, test_album_name, { album_description: test_album_desc});
};
