const config = require('../../config/env');
const mongoose = require('mongoose');
const path = require('path');

const PhotoSchema = new mongoose.Schema({
    album: {type: mongoose.Schema.Types.ObjectId, ref: 'Album', required: true},
    photo_title: {type: String, required: true},
    photo_file: {type: String, required: true},
    photo_description: {type: String}
});

PhotoSchema.statics.clearAll = () => {
    return new Promise((resolve, reject) => {
        Photo.deleteMany({}, (error) => {
            if(error) {
                reject(error);
            }
            else {
                resolve();
            }
        });
    });
};

PhotoSchema.statics.createPhoto = (album, photo_title, photo_file, attrs = {}) => {
    return new Promise(async (resolve, reject) => {
        try {
            const photo = await Photo.create({
                album: album,
                photo_title: photo_title,
                photo_file: photo_file,
                photo_description: attrs.photo_description || ''
            });

            resolve(photo);
        }
        catch(error) {
            reject(error);
        }
    });
};

PhotoSchema.statics.retrievePhoto = (album, title) => {
    return new Promise(async (resolve, reject) => {
        try {
            const photo = Photo.findOne({album: album, photo_title: title})
                               .populate('album')
                               .exec();

            resolve(photo);
        }
        catch(error) {
            reject(error);
        }
    });
};

PhotoSchema.statics.photosForAlbum = (album, options = {sort_field: 'album_name', sort_asc: false, offset: 0, limit: 9999}) => {
    return new Promise(async (resolve, reject) => {
        const { sort_field = 'date', sort_asc = false, offset = 0, limit = 9999} = options;
        try {
            let sort = {};
            sort[sort_field] = sort_asc ? 1 : -1;
            const query = Photo.find({album: album.id})
                .populate('album')
                .skip(offset)
                .limit(limit)
                .sort(sort);

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
    });
};

PhotoSchema.virtual('photo_url').get(function() {
    return path.join('/', this.album.album_path, this.photo_file);
});

mongoose.set('useCreateIndex', true);
const Photo = mongoose.model("Photo", PhotoSchema);
module.exports = Photo;
