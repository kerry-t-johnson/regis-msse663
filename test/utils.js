const allDbs = require('../server/models');
const config = require('../config/env');
const fs = require('fs-extra');
const LoremIpsumGenerator = require('lorem-ipsum').LoremIpsum;
const mongoose = require('mongoose');
const randomstring = require('randomstring');

const lorem = new LoremIpsumGenerator({
    sentencesPerParagraph: {
        max: 8,
        min: 4
    },
    wordsPerSentence: {
        max: 16,
        min: 4
    }
});

module.exports.beforeEach = async () => {
    await mongoose.connect(config.db, {useNewUrlParser: true});
    await allDbs.clearAll();
    await fs.remove(config.album_root);
};

module.exports.generateTestName = () => {
    return randomstring.generate({
        length: 12,
        charset: 'alphabetic'
    });
};

module.exports.generateTestParagraphs = (numParagraphs = 1) => {
    return lorem.generateParagraphs(numParagraphs);
};
