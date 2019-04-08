module.exports = {
    env: 'development',
    db: 'mongodb://localhost/photo-album-dev',
    port: 3000,
    album_root: './albums-dev',
    file_log_level: 'debug',
    console_log_level: 'debug',
    session_secret: 'msse663',
    photo_repository_type: 'FileSystem',
};
