const albumDb = require('../models/AlbumModel');
const logger = require('../../config/winston');
const PhotoController = require('./PhotoController');

class AlbumController {

    static list(options = { offset: 0, limit: 9999 }) {
        return albumDb.allAlbums(options);
    }

    static create(user, name, options = {}) {
        const {description = ''} = options;

        if(!name) {
            throw new Error(name + ' is not a valid identifier.');
        }

        return albumDb.createAlbum(user, name, {album_description: description});
    }

    static async retrieve(name) {
        return await albumDb.findByAlbumName(name);
    }

    static async retrievePhotos(album, options = { offset: 0, limit: 9999 }) {
        return await PhotoController.list(album);
    }

    static async addImage(album, source, title, filename, description) {
        return await PhotoController.createImage(album, source, title, filename, description);
    }
}

module.exports = AlbumController;
