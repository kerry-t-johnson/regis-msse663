module.exports = {
    env: 'test',
    db: 'mongodb://localhost/photo-album-test',
    port: 3000,
    album_root: './albums-test',
    file_log_level: 'debug',
    console_log_level: 'debug',
    session_secret: 'msse663',
    photo_repository_type: 'FileSystem',

}
