const assert = require('chai').assert;
const Nsweeper = require('../nsweeper');

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

  describe('select', function() {
    it('should be able to play a game', function() {
      const dim = 2;
      const size = 5;
      const game = new Nsweeper({ dim, size });
      let mineSelectedState = false;
      assert(game.mineSelected === mineSelectedState);
      for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
          const resp = game.select([i, j]);
          const revealed = resp.val;
          assert(resp.err === null);
          if (revealed === Nsweeper.MINE) {
            mineSelectedState = true;
          }
          assert.include([0, 1, 2, 3, 4, 5, 6, 7, 8, Nsweeper.MINE], revealed);
          assert(game.mineSelected === mineSelectedState);
          assert.deepEqual([i, j], game.moves[game.moves.length - 1]);
        }
      }
      assert(game.moves.length === Math.pow(size, dim));
    });
    it('should not throw but return error strings', function() {
      const dim = 2;
      const size = 5;
      const game = new Nsweeper({ dim, size });
      let resp;

      // Invalid selections
      resp = game.select([5, 0]);
      assert(resp.val === null);
      assert.isString(resp.err);
      resp = game.select([0, 5]);
      assert(resp.val === null);
      assert.isString(resp.err);
      resp = game.select([3, -1]);
      assert(resp.val === null);
      assert.isString(resp.err);
      resp = game.select([3]);
      assert(resp.val === null);
      assert.isString(resp.err);
      resp = game.select([1, 2, 3]);
      assert(resp.val === null);
      assert.isString(resp.err);

      // Shouldn't have made moves or changed mineSelected
      assert.isFalse(game.mineSelected);
      assert(game.moves.length === 0);
    });
  });

  describe('Nsweeper.createArray', function() {
    it('should handle 1 dimension', function() {
      const arr = Nsweeper.createArray(1, 5);
      assert(arr.length === 5);
      assert(!Array.isArray(arr[0]));
      assert(!Array.isArray(arr[4]));
    });
    it('should handle 2 dimensions', function() {
      const arr = Nsweeper.createArray(2, 7);
      assert(arr[0].length === 7);
      assert(Array.isArray(arr[0]));
      assert(arr[6].length === 7);
      assert(Array.isArray(arr[6]));
    });
    it('should handle 3 dimensions', function() {
      const arr = Nsweeper.createArray(3, 3);
      assert(arr[0][0].length === 3);
      assert(Array.isArray(arr[0]));
      assert(Array.isArray(arr[0][0]));
      assert(arr[2][2].length === 3);
      assert(Array.isArray(arr[2]));
      assert(Array.isArray(arr[2][2]));
    });
  });

  describe.skip('Nsweeper.nestedArrayIterator', function() {
    it('should have tests', function() {});
  });

  describe('Nsweeper.peek', function() {
    it('should work on a 1 dimensional board', function() {
      const board = [0, 1, 2, 3, 4];
      assert(Nsweeper.peek([0], board) === 0);
      assert(Nsweeper.peek([1], board) === 1);
      assert(Nsweeper.peek([4], board) === 4);
    });
    it('should work on a 2 dimensional board', function() {
      const board = [
        [0, 1, 2, 3, 4],
        [5, 6, 7, 8, 9],
        [10, 11, 12, 13, 14],
        [15, 16, 17, 18, 19],
        [20, 21, 22, 23, 24],
      ];
      assert(Nsweeper.peek([0, 2], board) === 2);
      assert(Nsweeper.peek([1, 2], board) === 7);
      assert(Nsweeper.peek([4, 4], board) === 24);
    });
  });

  describe('Nsweeper.buildBoard', function() {
    it('should handle 1 dimension', function() {
      const [dim, size, density] = [1, 5, 0.2];
      const board = Nsweeper.buildBoard({ dim, size, density });
      assert(board.length === 5);
      assert(!Array.isArray(board[0]));
      assert(!Array.isArray(board[4]));
    });
    it('should handle 2 dimensions all mines', function() {
      const [dim, size, density] = [2, 5, 1];
      const board = Nsweeper.buildBoard({ dim, size, density });
      assert(board.length === 5);
      const X = Nsweeper.MINE;
      assert.sameDeepOrderedMembers(board, [
        [X, X, X, X, X],
        [X, X, X, X, X],
        [X, X, X, X, X],
        [X, X, X, X, X],
        [X, X, X, X, X],
      ]);
    });
    it('should handle 2 dimensions no mines', function() {
      const [dim, size, density] = [2, 5, 0];
      const board = Nsweeper.buildBoard({ dim, size, density });
      assert(board.length === 5);
      const X = Nsweeper.MINE;
      assert.sameDeepOrderedMembers(board, [
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
      ]);
    });
  });

  describe('Nsweeper.validateSelection', function() {
    it('should work on in range input', function() {
      const indexesArray = [0, 1, 2];
      const dim = 3;
      const size = 3;
      assert.doesNotThrow(Nsweeper.validateSelection.bind(this, indexesArray, dim, size));
    });
    it('should throw on out of range input (dim)', function() {
      const indexesArray = [0, 1, 2, 1];
      const dim = 3;
      const size = 3;
      assert.throws(Nsweeper.validateSelection.bind(this, indexesArray, dim, size));
    });
    it('should throw on out of range input (size)', function() {
      const indexesArray = [0, 4, 2];
      const dim = 3;
      const size = 3;
      assert.throws(Nsweeper.validateSelection.bind(this, indexesArray, dim, size));
    });
    it('should throw on out of range input (negative index)', function() {
      const indexesArray = [0, -1, 2];
      const dim = 3;
      const size = 3;
      assert.throws(Nsweeper.validateSelection.bind(this, indexesArray, dim, size));
    });
  });

  describe('Nsweeper.getNeighbors', function() {
    describe('1 dimension', function() {
      it('middle', function() {
        const [dim, size, indexesArray] = [1, 5, [3]];
        const neighbors = Nsweeper.getNeighbors({ dim, size, indexesArray });
        assert(Array.isArray(neighbors));
        assert(neighbors.length == 2);
        assert.sameDeepMembers(neighbors, [[2], [4]]);
      });

      it('left', function() {
        const [dim, size, indexesArray] = [1, 5, [0]];
        const neighbors = Nsweeper.getNeighbors({ dim, size, indexesArray });
        assert(Array.isArray(neighbors));
        assert(neighbors.length == 1);
        assert.sameDeepMembers(neighbors, [[1]]);
      });

      it('right', function() {
        const [dim, size, indexesArray] = [1, 5, [4]];
        const neighbors = Nsweeper.getNeighbors({ dim, size, indexesArray });
        assert(Array.isArray(neighbors));
        assert(neighbors.length == 1);
        assert.sameDeepMembers(neighbors, [[3]]);
      });
    });

    describe('2 dimensions', function() {
      it('top of grid', function() {
        const [dim, size, indexesArray] = [2, 5, [0, 3]];
        const neighbors = Nsweeper.getNeighbors({ dim, size, indexesArray });
        assert(Array.isArray(neighbors));
        assert(neighbors.length == 5);
        assert.sameDeepMembers(neighbors, [
          [0, 2],
          [0, 4],
          [1, 2],
          [1, 3],
          [1, 4],
        ]);
      });

      it('middle of grid', function() {
        const [dim, size, indexesArray] = [2, 5, [2, 2]];
        const neighbors = Nsweeper.getNeighbors({ dim, size, indexesArray });
        assert(Array.isArray(neighbors));
        assert(neighbors.length == 8);
        assert.sameDeepMembers(neighbors, [
          [1, 1],
          [1, 2],
          [1, 3],
          [2, 1],
          [2, 3],
          [3, 1],
          [3, 2],
          [3, 3],
        ]);
      });

      it('bottom of grid', function() {
        const [dim, size, indexesArray] = [2, 5, [4, 2]];
        const neighbors = Nsweeper.getNeighbors({ dim, size, indexesArray });
        assert(Array.isArray(neighbors));
        assert(neighbors.length == 5);
        assert.sameDeepMembers(neighbors, [
          [4, 1],
          [3, 1],
          [3, 2],
          [3, 3],
          [4, 3],
        ]);
      });

      it('left middle of grid', function() {
        const [dim, size, indexesArray] = [2, 5, [2, 0]];
        const neighbors = Nsweeper.getNeighbors({ dim, size, indexesArray });
        assert(Array.isArray(neighbors));
        assert(neighbors.length == 5);
        assert.sameDeepMembers(neighbors, [
          [1, 0],
          [1, 1],
          [2, 1],
          [3, 0],
          [3, 1],
        ]);
      });

      it('right bottom corner of grid', function() {
        const [dim, size, indexesArray] = [2, 5, [4, 4]];
        const neighbors = Nsweeper.getNeighbors({ dim, size, indexesArray });
        assert(Array.isArray(neighbors));
        assert(neighbors.length == 3);
        assert.sameDeepMembers(neighbors, [
          [3, 3],
          [3, 4],
          [4, 3],
        ]);
      });

      it('top left  corner of grid', function() {
        const [dim, size, indexesArray] = [2, 5, [0, 0]];
        const neighbors = Nsweeper.getNeighbors({ dim, size, indexesArray });
        assert(Array.isArray(neighbors));
        assert(neighbors.length == 3);
        assert.sameDeepMembers(neighbors, [
          [0, 1],
          [1, 1],
          [1, 0],
        ]);
      });
    });
  });

  describe('Nsweeper.validate', function() {
    it('should throw if dim/size args too large', function() {
      const [dim, size, density] = [10000000, 10000000, 0.1];
      const maxBoardSize = 1000000000;
      assert.throws(Nsweeper.validate.bind(null, { dim, size, density, maxBoardSize }));
    });
    it('should throw if dim arg is negative', function() {
      const [dim, size, density] = [-1, 10000000, 0.1];
      const maxBoardSize = 1000000000;
      assert.throws(Nsweeper.validate.bind(null, { dim, size, density, maxBoardSize }));
    });
    it('should throw if size arg is negative', function() {
      const [dim, size, density] = [10000000, -1, 0.1];
      const maxBoardSize = 1000000000;
      assert.throws(Nsweeper.validate.bind(null, { dim, size, density, maxBoardSize }));
    });
    it('should throw if density arg too high', function() {
      const [dim, size, density] = [10000000, 10000000, 1.1];
      const maxBoardSize = 1000000000;
      assert.throws(Nsweeper.validate.bind(null, { dim, size, density, maxBoardSize }));
    });
    it('should throw if density arg too low', function() {
      const [dim, size, density] = [10000000, 10000000, -0.1];
      const maxBoardSize = 1000000000;
      assert.throws(Nsweeper.validate.bind(null, { dim, size, density, maxBoardSize }));
    });
  });
});
