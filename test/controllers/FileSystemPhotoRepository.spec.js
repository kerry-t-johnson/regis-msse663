const chai = require('chai');
const config = require('../../config/env');
const expect = chai.expect;
const fs = require('fs-extra');
const path = require('path');
const PhotoRepo = require('../../server/controllers/FileSystemPhotoRepository');
const testUtils = require('../utils');

describe('File System Photo Repository', () => {

    // Relative to application root, I think:
    const test_src_file = './test/data/image.jpg';

    beforeEach(async () => {
        await fs.removeSync(config.album_root);
    });

    it('should be able to create files', async () => {
        const test_userid = testUtils.generateTestName();
        const test_filename = testUtils.generateTestName();
        const test_target = path.join(test_userid, test_filename);

        const result = await PhotoRepo.create(test_src_file, test_target);
    });

});
