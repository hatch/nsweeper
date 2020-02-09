'use strict';
const check = require('check-types');
const MINE = 'X';

class Nsweeper {
  constructor({ dim = 2, size = 10, density = 0.2 } = {}) {
    Nsweeper.validate({ dim, size, density, maxBoardSize: 1000 * 1000 * 1000 });

    this.board = Nsweeper.buildBoard({ dim, size, density });

    // For read use by front end
    this.dim = dim;
    this.size = size;
    this.density = density;

    // List of selections by player in chronological order
    this.moves = [];
    this.mineSelected = false;
  }

  select(indexesArray, board = this.board) {
    this.validateSelection(indexesArray);
    this.moves.push(indexesArray);
    const val = this.peek(indexesArray, board);
    if (val === MINE) {
      this.mineSelected = true;
    }
    return val;
  }

  peek(indexesArray, board = this.board) {
    let toReturn = board;
    indexesArray.forEach(indexVal => {
      toReturn = toReturn[indexVal];
    });
    return toReturn;
  }

  validateSelection(indexesArray, dim = this.dim, size = this.size) {
    check.assert.array.of.integer(indexesArray);
    check.assert.array.of.lessOrEqual(indexesArray, size);
    check.assert.equal(indexesArray.length, dim);
  }

  static buildBoard({ dim, size, density }) {
    function createMine() {
      return Math.random() < density;
    }

    // Size board
    const board = Nsweeper.createArray(dim, size);

    // First pass, add mines
    for (let i = 0; i < board.length; i++) {
      if (createMine()) {
        board[i] = MINE;
      }
    }

    // Second pass, add numbers
    for (let i = 0; i < board.length; i++) {
      // Don't want to override mines with their neighbor mine count
      if (board[i] === MINE) {
        continue;
      }
      // Get neighbors based on size & dimensions
      const neighbors = this.getNeighbors({ dim, size, index: i });

      // Add up mines on neighbors
      board[i] = neighbors.reduce((acc, cur) => {
        if (cur === MINE) {
          acc++;
        }
        return acc;
      }, 0);
    }
    return board;
  }

  static getNeighbors({ dim, size, index }) {
    // TODO INPROG, BROKEN
    let n = [];
    const withinDimIndex = index % size;
    // Iterate through dimensions
    for (let d = 0; d < dim; d++) {
      const base = size * d + withinDimIndex;
      n.push(base);
      if (withinDimIndex !== 0) {
        n.push(base - 1);
      }
      if (withinDimIndex !== size - 1) {
        n.push(base + 1);
      }
    }
    // Remove the original index
    n.splice(n.indexOf(index), 1);
    return n;
  }

  static validate({ dim, size, density, maxBoardSize }) {
    check.assert.integer(dim);
    check.assert.greaterOrEqual(dim, 1);
    check.assert.integer(size);
    check.assert.greaterOrEqual(size, 1);
    check.assert.number(density);
    check.assert.greaterOrEqual(density, 0);
    check.assert.lessOrEqual(density, 1);

    check.assert.lessOrEqual(Math.pow(size, dim), maxBoardSize);
  }

  static createArray(dim, size) {
    var arr = new Array(size);

    if (dim > 1) {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Nsweeper.createArray(dim - 1, size);
      }
    }

    return arr;
  }
}

module.exports = Nsweeper;
