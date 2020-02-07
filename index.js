'use strict';

class Nsweeper {
    constructor(dim, size, density) {
        this.dim = dim || 2;
        this.size = size || 10;
        this.moves = [];
        this.density = density || .2;
        this.board = this.buildBoard();
    }

    buildBoard() {

    }
}


module.exports = Nsweeper;