const config = require('../../config/env');
const fs = require('fs-extra');
const path = require('path');

class FileSystemPhotoRepository {

    static async create(src, dest, options = {removeOriginal: false}) {
        // Note: Manually join the root and dest, because
        // path.join removes the leading "./"
        const actualDest = `${config.album_root}/${dest}`;

        console.log('@@@@@ actualDest: ', actualDest);

        if(fs.existsSync(actualDest)) {
            throw new Error('Image with that name already exists');
        }

        await fs.ensureDir(path.dirname(actualDest));
        await fs.copyFile(src, actualDest);

        if(options.removeOriginal) {
            await fs.remove(src);
        }

        // Now, the URL needs to be "absolute", which actually means
        // relative to the web root:
        return actualDest.replace('./', '/');
    }

    static async move(src, dest) {
        const actualDest = path.join(config.album_root, dest);

        if(fs.existsSync(actualDest)) {
            throw new Error('Image with that name already exists');
        }

        await fs.ensureDir(path.dirname(actualDest));
        await fs.rename(src, actualDest);
    }

    static async destroy(target) {
        await fs.remove(target);
    }

}

module.exports = FileSystemPhotoRepository;
