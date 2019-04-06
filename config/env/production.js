module.exports = {
    env: 'production',
    db: 'mongodb://heroku_lzbg9002:f2b7fmincasoldaqhujmmciknm@ds263707.mlab.com:63707/heroku_lzbg9002',
    port: process.env.PORT,
    album_root: './albums-production',
    archive_root: './albums-archive-production',
    file_log_level: 'info',
    console_log_level: 'error',
    session_secret: 'msse663'
}
