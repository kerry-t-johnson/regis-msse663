const config = require('../../config/env');
const mongoose = require('mongoose');
const path = require('path');
const uniqueValidator = require("mongoose-unique-validator");

const AlbumSchema = new mongoose.Schema({
    album_name: {type: String, required: true, unique: true},
    album_dir: {type: String, required: true},
    album_description: {type: String}
});

AlbumSchema.plugin(uniqueValidator);

AlbumSchema.statics.clearAll = () => {
    return new Promise(async (resolve, reject) => {
        Album.deleteMany({}, (error) => {
            if(error) {
                reject(error);
            }
            else {
                resolve();
            }
        });
    });
};

AlbumSchema.statics.createAlbum = (album_name, album_dir = null, attrs = {}) => {
    return new Promise(async (resolve, reject) => {
        try {
            const album = await Album.create({
                album_name: album_name,
                album_dir: album_dir || album_name,
                album_description: attrs.album_description || ''
            });
            resolve(album);
        }
        catch(error) {
            reject(error);
        }
    });
};

AlbumSchema.statics.findByAlbumName = (album_name) => {
    return new Promise(async (resolve, reject) => {
        try {
            const album = await Album.findOne({album_name: album_name});
            resolve(album);
        }
        catch(error) {
            reject(error);
        }
    });
};

AlbumSchema.statics.allAlbums = (options = { sort_field: 'album_name', sort_asc: true, offset: 0, limit: 9999}) => {
    return new Promise(async (resolve, reject) => {
        const { sort_field = 'album_name', sort_asc = true, offset = 0, limit = 9999} = options;
        try {
            let sort = {};
            sort[sort_field] = sort_asc ? 1 : -1;
            const query = Album.find()
                .sort(sort)
                .skip(offset)
                .limit(limit);

            query.exec((error, items) => {
                if(error) {
                    reject(error);
                }
                else {
                    resolve(items);
                }
            });
        }
        catch(error) {
            reject(error);
        }
    })
};

AlbumSchema.virtual('album_path').get(function() {
    return path.join(config.album_root, this.album_dir);
});

mongoose.set('useCreateIndex', true);
const Album = mongoose.model("Album", AlbumSchema);
module.exports = Album;
