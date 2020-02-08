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

    // List of indexes selected by player in order of selection
    this.moves = [];
  }

  static buildBoard({ dim, size, density }) {
    function createMine() {
      return Math.random() < density;
    }

    // Size board
    const board = new Array(Math.pow(size, dim));

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
}

module.exports = Nsweeper;
