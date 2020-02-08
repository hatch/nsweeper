const assert = require('chai').assert;
const Nsweeper = require('../index');

describe('nsweeper', function() {
  describe('constructor', function() {
    it('should create a game', function() {
      const game = new Nsweeper();
      assert.exists(game);
    });
    it('should create a game that handles args', function() {
      const [dim, size, density] = [1, 5, 0.1];
      const game = new Nsweeper({ dim, size, density });
      assert(game.dim === dim);
      assert(game.size === size);
      assert(game.density === density);
    });
  });

  describe('getNeighbors', function() {
    describe('1 dimension', function() {
      it('should work', function() {
        const [dim, size, index] = [1, 5, 3];
        const neighbors = Nsweeper.getNeighbors({ dim, size, index });
        assert(Array.isArray(neighbors));
        assert(neighbors.length == 2);
        assert.sameMembers(neighbors, [2, 4]);
      });
    });

    describe('2 dimensions', function() {
      it('top of grid', function() {
        const [dim, size, index] = [2, 5, 3];
        const neighbors = Nsweeper.getNeighbors({ dim, size, index });
        assert(Array.isArray(neighbors));
        assert(neighbors.length == 5);
        assert.sameMembers(neighbors, [2, 4, 7, 8, 9]);
      });

      it('middle of grid', function() {
        const [dim, size, index] = [2, 5, 12];
        const neighbors = Nsweeper.getNeighbors({ dim, size, index });
        assert(Array.isArray(neighbors));
        assert(neighbors.length == 8);
        assert.sameMembers(neighbors, [6, 7, 8, 11, 13, 16, 17, 18]);
      });

      it('bottom of grid', function() {
        const [dim, size, index] = [2, 5, 21];
        const neighbors = Nsweeper.getNeighbors({ dim, size, index });
        assert(Array.isArray(neighbors));
        assert(neighbors.length == 5);
        assert.sameMembers(neighbors, [20, 15, 16, 17, 22]);
      });

      it('left middle of grid', function() {
        const [dim, size, index] = [2, 5, 10];
        const neighbors = Nsweeper.getNeighbors({ dim, size, index });
        assert(Array.isArray(neighbors));
        assert(neighbors.length == 5);
        assert.sameMembers(neighbors, [5, 6, 11, 15, 16]);
      });

      it('right bottom corner of grid', function() {
        const [dim, size, index] = [2, 5, 24];
        const neighbors = Nsweeper.getNeighbors({ dim, size, index });
        assert(Array.isArray(neighbors));
        assert(neighbors.length == 3);
        assert.sameMembers(neighbors, [18, 19, 23]);
      });
    });
  });

  describe('validation', function() {
    it('should throw if dim/size args too large', function() {
      let err;
      const [dim, size, density] = [10000000, 10000000, 0.1];
      try {
        const game = new Nsweeper({ dim, size, density });
      } catch (e) {
        err = e;
      }
      assert.exists(err);
    });
    it('should throw if dim arg is negative', function() {
      let err;
      const [dim, size, density] = [-1, 10000000, 0.1];
      try {
        const game = new Nsweeper({ dim, size, density });
      } catch (e) {
        err = e;
      }
      assert.exists(err);
    });
    it('should throw if size arg is negative', function() {
      let err;
      const [dim, size, density] = [10000000, -1, 0.1];
      try {
        const game = new Nsweeper({ dim, size, density });
      } catch (e) {
        err = e;
      }
      assert.exists(err);
    });
    it('should throw if density arg too high', function() {
      let err;
      const [dim, size, density] = [10000000, 10000000, 1.1];
      try {
        const game = new Nsweeper({ dim, size, density });
      } catch (e) {
        err = e;
      }
      assert.exists(err);
    });
    it('should throw if density arg too low', function() {
      let err;
      const [dim, size, density] = [10000000, 10000000, -0.1];
      try {
        const game = new Nsweeper({ dim, size, density });
      } catch (e) {
        err = e;
      }
      assert.exists(err);
    });
  });
});
