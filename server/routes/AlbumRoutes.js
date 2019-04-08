const path = require('path');
const router = require('express').Router();
const upload = require('multer')({dest: 'uploads/'});
const AlbumController = require('../controllers/AlbumController');
const PhotoController = require('../controllers/PhotoController');
const PhotoModel = require('../models/PhotoModel');
const restrictToLoggedInUsers = require('./util').restrictToLoggedInUsers;

router.param('album', async (request, response, next, param) => {
    try {
        request.album = await AlbumController.retrieve(param);
        next();
    }
    catch(error) {
        response.status(404).send(error);
    }
});

router.get('/', async (request, response) => {
    try {
        const options = {
            offset: +request.query.offset || 0,
            limit: +request.query.limit || 9999
        };

        const albums = await AlbumController.list(options);
        response.status(200).json(albums);
    }
    catch(error) {
        response.status(500).json({msg: error});
    }
});

router.post('/', restrictToLoggedInUsers, async (request, response) => {
    try {
        const album = await AlbumController.create(request.session.user, request.body.album_name, {description: request.body.album_description});
        response.status(200).json(album);
    }
    catch(error) {
        response.status(500).json({msg: error});
    }
});

router.get('/:album', async (request, response) => {
    try {
        const options = {
            offset: +request.query.offset || 0,
            limit: +request.query.limit || 9999
        };
        const photos = await AlbumController.retrievePhotos(request.album, options);

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
        const fileUploadLocation = path.join(request.file.destination, request.file.filename);
        const fileName = request.file.originalname;
        const photo = await AlbumController.addImage(
            request.album,
            fileUploadLocation,
            request.body.photo_title,
            fileName,
            request.body.photo_description
        );
        response.status(200).json(photo.toObject({virtuals: true}));
    }
    catch(error) {
        console.log(error);
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

router.param('photo', async (request, response, next, param) => {
    try {
        request.photo = await PhotoModel.retrievePhoto(request.album, param);
        next();
    }
    catch(error) {
        console.log(error);
        response.status(404).send(error);
    }
});

router.delete('/:album/:photo', restrictToLoggedInUsers, async (request, response) => {
    try {
        await PhotoController.deleteImage(request.photo);
        response.status(200).json({});
    }
    catch(error) {
        response.status(500).json({msg: error});
    }
});

router.put('/:album/:photo/undelete', restrictToLoggedInUsers, (request, response) => {
    request.album.undeleteImage(request.photo).then((contents) => {
        response.status(200).json(contents);
    }).catch((error) => {
        response.status(500).json({msg: error});
    });
});

module.exports = router;
