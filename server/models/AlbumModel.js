const config = require('../../config/env');
const mongoose = require('mongoose');
const path = require('path');
const uniqueValidator = require("mongoose-unique-validator");

const AlbumSchema = new mongoose.Schema({
    album_name: {type: String, required: true, unique: true},
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    album_description: {type: String}
});

AlbumSchema.plugin(uniqueValidator);

AlbumSchema.statics.clearAll = () => {
    return new Promise(async (resolve, reject) => {
        AlbumModel.deleteMany({}, (error) => {
            if(error) {
                reject(error);
            }
            else {
                resolve();
            }
        });
    });
};

AlbumSchema.statics.createAlbum = (user, album_name, attrs = {}) => {
    return new Promise(async (resolve, reject) => {
        try {
            const album = await AlbumModel.create({
                user: user,
                album_name: album_name,
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
            const album = await AlbumModel.findOne({album_name: album_name});
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
            const query = AlbumModel.find()
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

mongoose.set('useCreateIndex', true);
const AlbumModel = mongoose.model("Album", AlbumSchema);
module.exports = AlbumModel;
