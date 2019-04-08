const mongoose = require('mongoose');

const PhotoSchema = new mongoose.Schema({
    album: {type: mongoose.Schema.Types.ObjectId, ref: 'Album', required: true},
    photo_title: {type: String, required: true},
    photo_url: {type: String, required: true},
    photo_description: {type: String},
    archived: {type: Boolean}
});

PhotoSchema.statics.clearAll = () => {
    return new Promise((resolve, reject) => {
        PhotoModel.deleteMany({}, (error) => {
            if(error) {
                reject(error);
            }
            else {
                resolve();
            }
        });
    });
};

PhotoSchema.statics.createPhoto = (album, photo_title, photo_url, attrs = {}) => {
    return new Promise(async (resolve, reject) => {
        try {
            const photo = await PhotoModel.create({
                album: album,
                photo_title: photo_title,
                photo_url: photo_url,
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
            const photo = PhotoModel.findOne({album: album, photo_title: title})
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
            const query = PhotoModel.find({album: album.id, archived: {$exists: false}})
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

mongoose.set('useCreateIndex', true);
const PhotoModel = mongoose.model("Photo", PhotoSchema);
module.exports = PhotoModel;
