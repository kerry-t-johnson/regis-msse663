const cloudinary = require('cloudinary').v2;
const config = require('../../config/env');
const path = require('path');
const PhotoRepo = require('../../server/controllers/CloudinaryPhotoRepository');
const testUtils = require('../utils');

describe('Cloudinary Photo Repository', () => {

    // Relative to application root, I think:
    const test_src_file = './test/data/image.jpg';

    beforeEach(async () => {

        const searchResults = await cloudinary.search.expression('context.env=test')
                                                     .execute();

        await Promise.all(searchResults.resources.map(async (r) => {
            await cloudinary.uploader.destroy(r.public_id);
        }));
    });

    it('should be able to create files', async () => {
        const test_userid = config.env;
        const test_filename = testUtils.generateTestName();
        const test_target = path.join(test_userid, test_filename);

        // Will throw/reject if not successful:
        await PhotoRepo.create(test_src_file, test_target);
    });

});
