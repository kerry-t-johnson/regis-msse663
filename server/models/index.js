const allDbs = [
    require('./AlbumModel'),
    require('./PhotoModel'),
    require('./UserModel')
];

module.exports.clearAll = () => {
    return new Promise(async(resolve, reject) => {
        try {
            if (process.env.NODE_ENV !== 'test' && process.env.NODE_ENV !== 'development') {
                return reject(new Error('Attempt to clear non testing database!'));
            }

            for (db of allDbs) {
                await db.clearAll();
            }

            resolve();
        }
        catch(error) {
            reject(error);
        }
    });
};

