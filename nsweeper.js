'use strict';
const check = require('check-types');
const Combinatorics = require('js-combinatorics');

class Nsweeper {
  static MINE = 'X';
  static ERROR_STRINGS = {
    invalid: 'Invalid selection for this board',
    dup: 'Already selected those coordinations',
  };

  constructor({ dim = 2, size = 10, density = 0.2 } = {}) {
    Nsweeper.validate({ dim, size, density, maxBoardSize: 1000 * 1000 * 1000 });

    [this.board, this.mineCount] = Nsweeper.buildBoard({ dim, size, density });

    // For read use by front end
    this.dim = dim;
    this.size = size;
    this.density = density;

    // List of selections by player in chronological order
    this.moves = [];
    this.flags = [];
    this.validFlags = [];
    this.mineSelected = false;
    this.boardSize = Math.pow(size, dim);
  }

  select(indexesArray) {
    const err = Nsweeper.validateSelection(indexesArray, this.dim, this.size, this.moves);
    if (err) {
      return { val: null, err };
    }
    let val = Nsweeper.peek(indexesArray, this.board);
    if (val === Nsweeper.MINE && this.moves.length > 0) {
      this.mineSelected = true;
    }
    // If a mine is selected as first move, cheat and remove it
    if (val === Nsweeper.MINE && this.moves.length === 0) {
      this.mineCount--;
      const neighbors = Nsweeper.getNeighbors({ dim: this.dim, size: this.size, indexesArray });
      const nearbyMines = Nsweeper.countMines(neighbors, this.board);
      Nsweeper.setCell(this.board, indexesArray, nearbyMines);
      val = nearbyMines;
    }
    Nsweeper.addMoveAndOpenNeighbors(
      this.dim,
      this.size,
      indexesArray,
      this.board,
      this.moves,
      this.flags,
      this.validFlags
    );

    if (this.checkWin()) {
      val = `All ${this.mineCount} mines flagged or found, congrats!`;
    }

    return { val, err: null };
  }

  toggleFlag(indexesArray) {
    const err = Nsweeper.validateSelection(indexesArray, this.dim, this.size, this.moves);
    if (err) {
      return { val: null, err };
    }
    const flagString = JSON.stringify(indexesArray);
    if (this.flags.indexOf(flagString) !== -1) {
      Nsweeper.removeValueFromArray(flags, flagString);
      Nsweeper.removeValueFromArray(validFlags, flagString);
    } else {
      this.flags.push(flagString);
      let val = Nsweeper.peek(indexesArray, this.board);
      if (val === Nsweeper.MINE) {
        this.validFlags.push(flagString);
      }
    }
  }

  checkWin() {
    if (
      !this.mineSelected &&
      (this.moves.length + this.mineCount === this.boardSize ||
        (this.flags.length === this.validFlags.length && this.validFlags.length === this.mineCount))
    ) {
      return true;
    }
    return false;
  }

  static setCell(board, indexesArray, val) {
    let cur = board;
    for (let i = 0; i < indexesArray.length; i++) {
      if (i === indexesArray.length - 1) {
        cur[indexesArray[i]] = val;
      }
      cur = cur[indexesArray[i]];
    }
  }

  static addMoveAndOpenNeighbors(dim, size, indexesArray, board, moves, flags, validFlags) {
    const curIndexString = JSON.stringify(indexesArray);
    if (moves.indexOf(curIndexString) !== -1) {
      return;
    }
    moves.push(curIndexString);

    // Selection removes the flag
    Nsweeper.removeValueFromArray(flags, curIndexString);
    Nsweeper.removeValueFromArray(validFlags, curIndexString);

    const neighbors = Nsweeper.getNeighbors({ dim, size, indexesArray });
    const validNeighbors = neighbors.filter(nIndexes => {
      const nVal = Nsweeper.peek(nIndexes, board);
      return nVal !== Nsweeper.MINE && moves.indexOf(JSON.stringify(nIndexes)) === -1;
    });
    validNeighbors.map(nIndexes => {
      Nsweeper.addMoveAndOpenNeighbors(dim, size, nIndexes, board, moves, flags, validFlags);
    });
  }

  static removeValueFromArray(arr, val) {
    const index = arr.indexOf(val);
    if (index !== -1) arr.splice(index, 1);
  }

  static peek(indexesArray, board) {
    let toReturn = board;
    indexesArray.forEach(indexVal => {
      toReturn = toReturn[indexVal];
    });
    return toReturn;
  }

  static buildBoard({ dim, size, density }) {
    // Size board
    const board = Nsweeper.createArray(dim, size);
    let mineCount = 0;

    // First pass, add mines
    const addMineCondition = () => Math.random() < density;
    const addMineEffect = ({ arr, i }) => {
      arr[i] = Nsweeper.MINE;
      mineCount++;
    };
    Nsweeper.nestedArrayIterator({
      originalArr: board,
      arr: board,
      indices: [],
      condition: addMineCondition,
      effect: addMineEffect,
    });

    // Second pass, add numbers
    const addNumberCondition = ({ arr, i }) => {
      // Skip mines, don't want to overwrite with numbers
      return arr[i] !== Nsweeper.MINE;
    };
    const addNumberEffect = ({ originalArr, arr, indices, i }) => {
      // Get neighbor index sets
      const neighbors = Nsweeper.getNeighbors({
        dim,
        size,
        indexesArray: [...indices, i],
      });

      // Add up mines on neighbors
      arr[i] = Nsweeper.countMines(neighbors, originalArr);
    };
    Nsweeper.nestedArrayIterator({
      originalArr: board,
      arr: board,
      indices: [],
      condition: addNumberCondition,
      effect: addNumberEffect,
    });

    return [board, mineCount];
  }

  static countMines(indexesArray, board) {
    return indexesArray.reduce((acc, cur) => {
      if (Nsweeper.peek(cur, board) === Nsweeper.MINE) {
        acc++;
      }
      return acc;
    }, 0);
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

  static nestedArrayIterator({ originalArr, arr, indices, condition, effect }) {
    if (Array.isArray(arr[0])) {
      for (let i = 0; i < arr.length; i++) {
        Nsweeper.nestedArrayIterator({ originalArr, arr: arr[i], indices: [...indices, i], condition, effect });
      }
    } else {
      for (let i = 0; i < arr.length; i++) {
        if (condition({ originalArr, arr, indices, i })) {
          effect({ originalArr, arr, indices, i });
        }
      }
    }
  }

  static getNeighbors({ dim, size, indexesArray }) {
    let neighbors = [];
    // Array of modifier sets which, when applied to the indexesArray,
    // will produce one of the possible neighbors
    // Still need to be checked to make sure they're within size and
    // not the starting point itself.
    const modifiers = Combinatorics.baseN([-1, 0, 1], dim);
    let mod = modifiers.next();
    while (mod !== undefined) {
      // Skip input indexesArray
      if (check.array.of.equal(mod, 0)) {
        mod = modifiers.next();
        continue;
      }
      const potentialNeighbor = [];
      for (let i = 0; i < indexesArray.length; i++) {
        const toAdd = indexesArray[i] + mod[i];
        if (toAdd >= 0 && toAdd < size) {
          potentialNeighbor.push(toAdd);
        }
      }
      // Potential neighbor will be shorter if any of its indices would be out of range
      if (potentialNeighbor.length === indexesArray.length) {
        neighbors.push(potentialNeighbor);
      }

      mod = modifiers.next();
    }
    return neighbors;
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

  static validateSelection(indexesArray, dim, size, moves) {
    if (
      !(
        check.array.of.integer(indexesArray) &&
        check.array.of.less(indexesArray, size) &&
        check.array.of.greaterOrEqual(indexesArray, 0) &&
        check.equal(indexesArray.length, dim)
      )
    ) {
      return Nsweeper.ERROR_STRINGS.invalid;
    }

    const curIndexString = JSON.stringify(indexesArray);
    if (moves.indexOf(curIndexString) !== -1) {
      return Nsweeper.ERROR_STRINGS.dup;
    }
  }
}

module.exports = Nsweeper;
