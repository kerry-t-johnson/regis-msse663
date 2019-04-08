const config = require('../../config/env');
const logger = require('../../config/winston');
const path = require('path');
const photoDb = require('../models/PhotoModel');
const photoRepo = require(`./${config.photo_repository_type}PhotoRepository`);

class PhotoController {

    static async list(album, options = { offset: 0, limit: 9999 }) {
        return await photoDb.photosForAlbum(album, options);
    }

    static async createImage(album, source, title, filename, description) {
        const target = path.join(album.user._id.toString(), filename);
        const url = await photoRepo.create(source, target);

        return await photoDb.createPhoto(album, title, url, {photo_description: description});
    }

    static async deleteImage(photo) {
        logger.debug('Album[%s].deleteImage(%s)', photo.album.album_name, photo.photo_title);

        // For now, DB entry is marked as 'archived'.
        // The actual deletion will occur via cron.
        await photo.update({archived: true});
    }

    async undeleteImage(photo) {
        logger.debug('Album[%s].undeleteImage(%s)', photo.album.album_name, photo.photo_title);

        await photo.update({$unset: {archived: ''}});
    }

}

module.exports = PhotoController;