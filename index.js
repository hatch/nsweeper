'use strict';
const check = require('check-types');
const MINE = 'X';

class Nsweeper {
    constructor({ dim = 2, size = 10, density = 0.2 } = {}) {
        this.maxBoardSize = 1000 * 1000 * 1000;
        this.dim = dim;
        this.size = size;
        this.density = density;
        this.moves = [];
        this.validateSelf();
        this.board = this.buildBoard(this.dim, this.size, this.density);
    }

    buildBoard(dim, size, density) {
        function createMine() {
            return Math.random() < density;
        }

        // Size board
        const board = new Array(Math.pow(this.size, this.dim));

        // First pass, add mines
        for (let i = 0; i < board.length; i++) {
            if (createMine()) {
                board[i] = MINE;
            }
        }

        // Second pass, add numbers
        for (let i = 0; i < board.length; i++) {
            if (board[i] === MINE) {
                continue;
            }
            // Get neighbors based on size & dimensions
            const neighbors = this.getNeighbors(i)
                // Add up mines on neighbors
            board[i] = neighbors.reduce((acc, cur) => {
                if (cur === MINE) {
                    acc++;
                }
                return acc;
            }, 0)
        }
        return board;
    }

    getNeighbors(i) {
        const n = [];
        // TODO BUILD THIS FUNCTION
        return n;
    }

    validateSelf() {
        check.assert.integer(this.dim);
        check.assert.greaterOrEqual(this.dim, 1);
        check.assert.integer(this.size);
        check.assert.greaterOrEqual(this.size, 1);
        check.assert.number(this.density);
        check.assert.greaterOrEqual(this.density, 0);
        check.assert.lessOrEqual(this.density, 1);

        check.assert.lessOrEqual(Math.pow(this.size, this.dim), this.maxBoardSize);
    }
}


module.exports = Nsweeper;