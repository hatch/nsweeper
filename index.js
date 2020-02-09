#!/usr/bin/env node

'use strict';
const readline = require('readline');
const clear = require('clear');
const Nsweeper = require('./nsweeper');
const commander = require('commander');

const unselectedChar = '▆';
const mineChar = 'X';
const flagChar = '⚑';
const helpText = `
Select coordination with a list of numbers separated by a non number character.
Example: "1 2" will pick top row, one to the right on a grid.
Additional dimensions require additional numbers, for example this would be a
 valid coordinate set for a 4 dimensional board: "1 2 3 4".
You can flag/unflag coordinates by preceeding them with the letter f.
`;

const program = new commander.Command();
program.version('1.0.0');

function optParseInt(value) {
  return parseInt(value);
}

function optParsePercent(value) {
  return parseFloat(value);
}

function optParseBool(value) {
  if (value === 'f' || value === 'false' || value === 'no' || value === '0') {
    return false;
  }
  return !!value;
}

program
  .option('-s, --size <number>', 'size of board along each dimension', optParseInt, 10)
  .option('-d, --dimension <number>', 'number of dimensions', optParseInt, 2)
  .option(
    '-x, --difficulty <float>',
    'difficulty, a float between 0 and 1 that reflects mine density',
    optParsePercent,
    0.5
  )
  .option('-w, --easywin <boolean>', 'do not require flagging all mines', optParseBool, false)
  .parse(process.argv);

async function main() {
  let game;
  try {
    game = new Nsweeper({
      dim: program.dimension,
      size: program.size,
      density: program.difficulty,
      autoWin: program.easywin,
    });
  } catch (err) {
    console.log('Could not initialize game, see error below.');
    console.log(err);
    process.exit(1);
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const prompt = 'Pick coordinates, exit, moves, or help: ';
  clear();
  console.log(
    `=> Initialized nsweeper board with ${game.dim} dimensions, ${
      game.size
    } length per dimension, containing ${Math.floor(game.density * 100)}% mines. Easy win is ${
      game.autoWin ? 'on' : 'off'
    }.
  `
  );
  printGame(game);
  process.stdout.write(prompt);
  for await (const line of rl) {
    clear();
    if (line === 'quit' || line === 'exit') {
      console.log('=> Exiting...');
      rl.close();
      continue;
    }
    if (line === 'help' || line === 'h') {
      console.log('=> Displaying help...\n');
      printGame(game);
      console.log(helpText);
      process.stdout.write(prompt);
      continue;
    }
    if (line === 'moves' || line === 'move') {
      console.log('=> Displaying moves...\n');
      printGame(game);
      console.log(game.moves);
      process.stdout.write(prompt);
      continue;
    }
    if (line.startsWith('f')) {
      console.log('=> Toggling flag...\n');
      const indexes = parseSelection(line);
      game.toggleFlag(indexes);
      printGame(game);
      process.stdout.write(prompt);
      continue;
    }
    const indexes = parseSelection(line);
    const resp = game.select(indexes);
    if (resp.err) {
      console.log(`=> ${resp.err}\n`);
    } else {
      console.log(`=> Revealed ${resp.val}\n`);
    }
    if (game.mineSelected) {
      printGame(game, true);
      console.log('You hit a mine! Game over.');
      rl.close();
    } else if (game.checkWin()) {
      printGame(game, true);
      console.log('You WON!');
      rl.close();
    } else {
      printGame(game);
      process.stdout.write(prompt);
    }
  }
}

function printGame(game, fullBoard = false) {
  function condition() {
    return true;
  }
  function effect({ arr, indices, i }) {
    let visibile = false;
    const curIndexString = JSON.stringify([...indices, i]);
    const row = indices[indices.length - 1] || 0;
    const val = arr[i];
    const transition = i + 1 === game.size;
    const horizontalHeaderNeeded = row === 0 && i === 0;
    const thirdDimesionHeader = indices.length > 1 ? indices[indices.length - 2] + 1 : null;
    for (let i = 0; i < game.moves.length; i++) {
      if (game.moves[i] === curIndexString) {
        visibile = true;
        break;
      }
    }
    if (horizontalHeaderNeeded) {
      printHeaderIndexes(game.size, thirdDimesionHeader);
    }
    if (i === 0) {
      if (indices.length > 0) {
        writeCell(row + 1);
      } else {
        writeCell(' ');
      }
    }

    if (visibile || fullBoard) {
      writeCell(val);
    } else {
      if (game.flags.indexOf(curIndexString) !== -1) {
        writeCell(flagChar);
      } else {
        writeCell(unselectedChar);
      }
    }
    if (transition) {
      writeNewline();
    }
  }
  Nsweeper.nestedArrayIterator({ originalArr: game.board, arr: game.board, indices: [], condition, effect });
  writeNewline();
}

function parseSelection(line) {
  const strings = line.split(/[^0-9]+/);
  const indexes = strings.reduce((acc, cur) => {
    if (cur !== null && cur !== undefined && cur !== '') {
      acc.push(parseInt(cur) - 1);
    }
    return acc;
  }, []);
  return indexes;
}

function writeNewline() {
  process.stdout.write('\n');
}

function padCell(input, rightPad = false, padTo = 4) {
  let s = input.toString();
  while (s.length < padTo) {
    s = rightPad ? s + ' ' : ' ' + s;
  }
  return s;
}

function writeCell(input) {
  if (input === Nsweeper.MINE) {
    input = mineChar;
  }
  const stringPaddedInput = padCell(input);
  process.stdout.write(stringPaddedInput);
}

function printHeaderIndexes(size, header = null) {
  writeNewline();
  if (header) {
    process.stdout.write(padCell(header, true));
  } else {
    writeCell(' ');
  }
  Array.from({ length: size }, (_, x) => writeCell(x + 1));
  writeNewline();
}

main();
