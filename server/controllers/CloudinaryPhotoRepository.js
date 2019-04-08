const config = require('../../config/env');
const cloudinary = require('cloudinary').v2;

// Cloudinary uses process.env.CLOUDINARY_URL
class CloudinaryPhotoRepository {

    static async create(source, target) {
        return new Promise((resolve, reject) => {
            cloudinary.uploader.upload(source, {public_id: target, context: {env: config.env}}, (error, result) => {
                if(error) {
                    reject(error);
                }
                else {
                    resolve(result.url);
                }
            });
        });
    }

    static async move(from, to) {
        return new Promise((resolve, reject) => {
            cloudinary.uploader.rename(from, to, (error, result) => {
                if(error) {
                    reject(error);
                }
                else {
                    resolve(result.url);
                }
            });
        });
    }

    static async destroy(target) {
        return new Promise((resolve, reject) => {
            cloudinary.uploader.destroy(target, (error) => {
                if(error) {
                    reject(error);
                }
                else {
                    resolve();
                }
            });
        });
    }

}

module.exports = CloudinaryPhotoRepository;
