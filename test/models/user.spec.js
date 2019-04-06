const chai = require('chai');
const expect = chai.expect;
const config = require('../../config/env');
const db = require('../../server/models/user');
const mongoose = require('mongoose');
chai.use(require('chai-as-promised'));

describe('UserDb', () => {

    const test_username = 'test-user';
    const test_password = 'password';

    beforeEach(async () => {
        await mongoose.connect(config.db, {useNewUrlParser: true});
        await db.clearAll();
    });

    it('should be able to create a user', async () => {
        const user = await db.createUser(test_username, test_password);

        expect(user).to.have.property('email', test_username);
    });

    it("should be able to validate a user's password", async () => {
        const user = await db.createUser(test_username, test_password);

        expect(() => user.validatePassword(test_password)).to.not.throw();
        expect(() => user.validatePassword("foo")).to.throw('Invalid username or password');
    });

    it('should prevent duplicate username', (done) => {
        db.createUser(test_username, test_password).then(() => {
            db.createUser(test_username, test_password).then(() => {
                done(new Error('Expected duplicate username error'));
            }).catch(() => {
                done();
            });
        });
    });

    it('should be able to find by id', async() => {
        const createdUser   = await db.createUser(test_username, test_password);
        const retrievedUser = await db.findByDbId(createdUser.id);

        expect(retrievedUser).to.have.property('id', createdUser.id);
        expect(retrievedUser).to.have.property('email', createdUser.email);
    });

    it('should be able to find by username', async() => {
        const createdUser   = await db.createUser(test_username, test_password);
        const retrievedUser = await db.findByUsername(test_username);

        expect(retrievedUser).to.have.property('id', createdUser.id);
        expect(retrievedUser).to.have.property('email', createdUser.email);
    });

});


