const appRoot = require('app-root-path');
const router = require('express').Router();
const logger = require(appRoot + '/config/winston');
const path = require('path');
const upload = require('multer')({dest: 'uploads/'});
const Album = require('./album');

router.get('/', (request, response) => {
    const options = {
        offset: +request.query.offset || 0,
        limit:  +request.query.limit || 9999
    };

    Album.list(options).then((albums) => {
        response.status(200).json({albums: albums});
    }).catch((error) => {
           response.status(500).json({msg: error});
    });
});

router.get('/:album', (request, response) => {
    logger.info('Retrieving contents of ' + request.album.album_name);
    const options = {
        offset: +request.query.offset || 0,
        limit:  +request.query.limit || 9999
    };

    request.album.fetchContents(options).then((contents) => {
        console.log(contents);
        response.status(200).json(contents);
    }).catch((error) => {
        response.status(500).json({msg: error});
    });
});

router.post('/:album', upload.single('image'), (request, response) => {
    logger.info('Adding to contents of %s', request.album.album_name);

    const fileUploadLocation = path.join(request.file.destination, request.file.filename);
    const fileName = request.file.originalname;
    request.album.addImage(fileUploadLocation, fileName).then((contents) => {
        console.log(contents);
        response.status(200).json(contents);
    }).catch((error) => {
        response.status(409).json({msg: error});
    });
});

router.param('album', (request, response, next, id) => {
    try {
        logger.debug('looking up album: ' + id);
        request.album = new Album(id);
        next();
    }
    catch(error) {
        logger.error('could not find album: ' + error);
        response.status(404).send(error);
    }
});

router.put('/:album', (request, response) => {
    request.album.update(request.body).then((contents) => {
        console.log(contents);
        response.status(200).json(contents);
    }).catch((error) => {
        response.status(500).json({msg: error});
    });
});

router.put('/:album/undelete/:image', (request, response) => {
    request.album.undeleteImage(request.params.image).then((contents) => {
        console.log(contents);
        response.status(200).json(contents);
    }).catch((error) => {
        response.status(500).json({msg: error});
    });
});

router.delete('/:album/:image', (request, response) => {
    logger.info('Deleting image \'%s\' from %s', request.params.image, request.album.album_name);

    request.album.deleteImage(request.params.image).then((contents) => {
        console.log(contents);
        response.status(200).json(contents);
    }).catch((error) => {
        response.status(500).json({msg: error});
    });
});

module.exports = router;
