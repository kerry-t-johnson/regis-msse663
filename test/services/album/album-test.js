const appRoot = require('app-root-path');
const chai = require('chai');
const expect = chai.expect;
const fs = require('fs-extra');
chai.use(require('chai-as-promised'));
const Album = require(appRoot + '/src/services/album/album');

describe('Album', () => {

    after(() => {
        fs.removeSync('test-albums');
    });

    let testAlbum = Album.create({name:'test-album', root: 'test-albums'});

    it('should initially have no images', () => {
        const contentsPromise = testAlbum.fetchContents();

        return Promise.all([
            expect(contentsPromise).to.eventually.be.fulfilled,
            expect(contentsPromise).to.eventually.have.property('name', 'test-album')
        ]);
    });

    it('should be able to add an image', () => {
        const addImagePromise = testAlbum.addImage('/win/dev/hello-world/albums.bak/breck/image.jpg', 'image.jpg', true);

        return Promise.all([
           expect(addImagePromise).to.eventually.be.fulfilled,
           expect(addImagePromise).to.eventually.have.property('images').with.length(1)
        ]);
    });

    it('should be able to delete an image', () => {
        const deleteImagePromise = testAlbum.deleteImage('image.jpg');

        return Promise.all([
            expect(deleteImagePromise).to.eventually.be.fulfilled,
            expect(deleteImagePromise).to.eventually.have.property('images').with.length(0)
        ]);
    });

    it('should be able to undelete an image', () => {
        const undeleteImagePromise = testAlbum.undeleteImage('image.jpg');

        return Promise.all([
            expect(undeleteImagePromise).to.eventually.be.fulfilled,
            expect(undeleteImagePromise).to.eventually.have.property('images').with.length(1)
        ]);
    });

    it('should be able to rename', () => {
        const undeleteImagePromise = testAlbum.updateName('foo');

        return Promise.all([
            expect(undeleteImagePromise).to.eventually.be.fulfilled,
            expect(undeleteImagePromise).to.eventually.have.property('name', 'foo')
        ]);
    });
});