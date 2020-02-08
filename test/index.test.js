const assert = require('chai').assert;
const Nsweeper = require('../index');


describe('nsweeper', function() {
    describe('index', function() {
        it('should create a game', function() {
            const game = new Nsweeper();
            assert.exists(game);
        });
        it('should create a game that handles args', function() {
            const [dim, size, density] = [1, 5, .1];
            const game = new Nsweeper({ dim, size, density });
            assert(game.dim === dim);
            assert(game.size === size);
            assert(game.density === density);
        });
        it('should throw if dim/size args out of bounds', function() {
            let err;
            const [dim, size, density] = [100000 - 0, 10000000, 0.1];
            try {
                const game = new Nsweeper({ dim, size, density });
            } catch (e) {
                err = e;
            }
            assert.exists(err);
        });

    });
});