const router = require('express').Router();
const logger = require('../../config/winston');
const path = require('path');
const upload = require('multer')({dest: 'uploads/'});
const Album = require('../controllers/album');
const photoDb = require('../models/photo');
const restrictToLoggedInUsers = require('./util').restrictToLoggedInUsers;
const restrictToGuests = require('./util').restrictToGuests;

router.param('album', async (request, response, next, param) => {
    try {
        request.album = await Album.retrieve(param);
        next();
    }
    catch(error) {
        logger.error('could not find album: ' + error);
        response.status(404).send(error);
    }
});

router.param('photo', async (request, response, next, param) => {
    try {
        request.photo = await photoDb.retrievePhoto(request.album, param);
        next();
    }
    catch(error) {
        logger.error('could not find photo: ' + error);
        response.status(404).send(error);
    }
});

router.get('/', async (request, response) => {
    try {
        const options = {
            offset: +request.query.offset || 0,
            limit: +request.query.limit || 9999
        };

        const albums = await Album.list(options);
        response.status(200).json(albums);
    }
    catch(error) {
        response.status(500).json({msg: error});
    }
});

router.post('/', restrictToLoggedInUsers, async (request, response) => {
    try {
        const album = await Album.create(request.body.album_name, {description: request.body.album_description});
        response.status(200).json(album);
    }
    catch(error) {
        logger.error(error);
        response.status(500).json({msg: error});
    }
});

router.get('/:album', async (request, response) => {
    try {
        logger.info('Retrieving contents of ' + request.album.album_name);
        const options = {
            offset: +request.query.offset || 0,
            limit: +request.query.limit || 9999
        };
        const photos = await photoDb.photosForAlbum(request.album, options);

        const albumData = request.album.toObject({virtuals: true});
        albumData.photos = photos.map((item) => { return item.toObject({virtuals: true})});

        response.status(200).json(albumData);
    }
    catch(error) {
        response.status(500).json({msg: error});
    }
});

router.post('/:album', restrictToLoggedInUsers, upload.single('image'), async (request, response) => {
    try {
        logger.info('Adding to contents of %s', request.album.album_name);

        const fileUploadLocation = path.join(request.file.destination, request.file.filename);
        const fileName = request.file.originalname;
        const photo = await Album.addImage(
            request.album,
            fileUploadLocation,
            request.body.photo_title,
            fileName,
            request.body.photo_description
        );
        response.status(200).json(photo.toObject({virtuals: true}));
    }
    catch(error) {
        logger.error(error);
        response.status(409).json({msg: error});
    }
});

// router.put('/:album', (request, response) => {
//     request.album.update(request.body).then((contents) => {
//         console.log(contents);
//         response.status(200).json(contents);
//     }).catch((error) => {
//         response.status(500).json({msg: error});
//     });
// });

// router.put('/:album/undelete/:photo', (request, response) => {
//     request.album.undeleteImage(request.params.image).then((contents) => {
//         console.log(contents);
//         response.status(200).json(contents);
//     }).catch((error) => {
//         response.status(500).json({msg: error});
//     });
// });

router.delete('/:album/:photo', restrictToLoggedInUsers, async (request, response) => {
    try {
        await Album.deleteImage(request.photo);
        response.status(200).json({});
    }
    catch(error) {
        logger.error(error);
        response.status(500).json({msg: error});
    }
});

module.exports = router;
