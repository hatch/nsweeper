const assert = require('chai').assert;
const Nsweeper = require('../index');


describe('nsweeper', function() {
    describe('index', function() {
        it('should create a game', function() {
            const game = new Nsweeper();
            assert.exists(game);
        });
    });
});