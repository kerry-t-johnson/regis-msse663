const appRoot = require('app-root-path');
const fs = require('fs-extra');
const listDirectories = require('list-directories');
const logger = require(appRoot + '/config/winston');
const path = require('path');
const { promisify } = require("util");
const ALBUM_ROOT = appRoot + '/albums';
const ARCHIVE_ROOT = appRoot + '/albums-archive';

class Album {

    static async list(options = { offset: 0, limit: 9999, root: ALBUM_ROOT}) {
        const {offset = 0, limit = 9999, root = ALBUM_ROOT} = options;

        return new Promise((resolve, reject) => {
            listDirectories(root).then(directories => {
                resolve([...directories].slice(offset * limit, offset + limit)
                                        .map((el) => {
                                            return { name: path.basename(el) };
                                        }));

            }).catch((error) => {
                reject(error);
            })
        });
    }

    static create(options = { root: ALBUM_ROOT }) {
        const {name, root = ALBUM_ROOT} = options;

        if(!name) {
            throw new Error(name + ' is not a valid identifier.');
        }

        const albumDir = path.join(root, name);
        fs.ensureDirSync(albumDir);

        return new Album(name, root);
    }

    constructor(name, root) {
        this.album_name   = name;
        this.album_root   = root || ALBUM_ROOT;
        this.album_path   = path.join(this.album_root, name);

        if(!fs.existsSync(this.album_path) || !fs.lstatSync(this.album_path).isDirectory()) {
            throw new Error(this.album_path + ' does not exist');
        }
        logger.info('Album[%s]', this.album_name);
    }

    fetchContents(options = { offset: 0, limit: 9999}) {
        const {offset = 0, limit = 9999} = options;
        logger.debug('Album[%s].fetchContents(offset = %d, limit = %d)', this.album_name, offset, limit);

        return new Promise((resolve, reject) => {
            const helper = async (p) => {
                let files = [];
                for (const file of await promisify(fs.readdir)(p)) {
                    if((await promisify(fs.stat)(path.join(p, file))).isFile()) {
                        files.push(file);
                    }
                }
                return files;
            };

            helper(this.album_path).then((files) => {
                this.images = files.slice(offset * limit, offset + limit)
                    .map((el) => {
                        return {
                            image_name: path.basename(el),
                            image_url: path.join(this.album_path.replace(appRoot, ''), el),
                            image_description: 'Description not implemented yet.'
                        };
                    });

                resolve(this)
            })
            .catch((error) => {
                logger.debug(error);
                reject(error);
            });
        });
    }

    async updateName(name) {
        logger.debug('Album[%s].updateName(%s)', this.album_name, name);

        const newName = name;
        const newPath = path.join(this.album_root, name);

        await fs.rename(this.album_path, newPath);

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

    async addImage(source, name, copy = false) {
        if(fs.existsSync(path.join(this.album_path, name))) {
            throw new Error('Image with that name already exists');
        }

        const func = copy ? fs.copyFile : fs.rename;

        await promisify(func)(source, path.join(this.album_path, name));

        return this.fetchContents();
    }

    async deleteImage(name) {
        logger.debug('Album[%s].deleteImage(%s) ==> %s', this.album_name, name, path.join(this.album_path, name));

        await fs.ensureDir(path.join(ARCHIVE_ROOT, this.album_name));

        await fs.rename(path.join(this.album_path, name), path.join(ARCHIVE_ROOT, this.album_name, name));

        return this.fetchContents();
    }

    async undeleteImage(name) {
        logger.debug('Album[%s].undeleteImage(%s) ==> %s', this.album_name, name, path.join(ARCHIVE_ROOT, this.album_name, name));

        await fs.rename(path.join(ARCHIVE_ROOT, this.album_name, name), path.join(this.album_path, name));

        return this.fetchContents();
    }
}

module.exports = Album;
