const config = require('../../config/env');
const albumDb = require('../models/album');
const fs = require('fs-extra');
const logger = require('../../config/winston');
const path = require('path');
const photoDb = require('../models/photo');
const { promisify } = require("util");
const sanitize = require('sanitize-filename');

class Album {

    static list(options = { offset: 0, limit: 9999 }) {
        return albumDb.allAlbums(options);
    }

    static create(name, options = {}) {
        const {description = ''} = options;

        if(!name) {
            throw new Error(name + ' is not a valid identifier.');
        }

        const albumDir = sanitize(name);
        const albumPath = path.join(config.album_root, albumDir);
        fs.ensureDirSync(albumPath);

        return albumDb.createAlbum(name, albumDir, {album_description: description});
    }

    static async retrieve(name) {
        return await albumDb.findByAlbumName(name);
    }

    async updateName(name) {
        logger.debug('Album[%s].updateName(%s)', this.album_name, name);

        const newName = name;
        const newPath = path.join(this.album_root, name);

        await fs.rename(this.album_dir, newPath);

        this.album_name = newName;
        this.album_path = newPath;

        return new Promise((resolve, reject) => {
            resolve(this);
        });
    }

    async update(options = {}) {
        logger.debug('Album[%s].update(%s)', this.album_name, JSON.stringify(options));
        for(const key of Object.keys(options)) {
            const capitalizedKey = key.charAt(0).toUpperCase() + string.slice(1);
            const fn = `update${capitalizedKey}`;
            if((this[key] != options[key]) && (typeof this[fn] === 'function')) {
                logger.debug('Album[%s].update(%s: %s => %s)', this.album_name, key, this[key], options[key]);
                await this[fn](options[key]);
            }
        }

        return this.fetchContents(callback);
    }

    static async addImage(album, source, title, filename, description) {
        if(fs.existsSync(path.join(album.album_path, filename))) {
            throw new Error('Image with that name already exists');
        }

        const func = (config.env === 'test' || config.env === 'development') ? fs.copyFile : fs.rename;

        await promisify(func)(source, path.join(album.album_path, filename));
        return await photoDb.createPhoto(album, title, filename, {photo_description: description});
    }

    static async deleteImage(photo) {
        logger.debug('Album[%s].deleteImage(%s) ==> %s', photo.album.album_name, photo.photo_title, photo.photo_url);

        await fs.remove('.' + photo.photo_url);
        await photo.remove();
    }

    async undeleteImage(name) {
        logger.debug('Album[%s].undeleteImage(%s) ==> %s', this.album_name, name, path.join(config.archive_root, this.album_name, name));

        await fs.rename(path.join(config.archive_root, this.album_name, name), path.join(this.album_dir, name));

        return this.fetchContents();
    }
}

module.exports = Album;
