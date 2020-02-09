#!/usr/bin/env node

'use strict';
const readline = require('readline');
const Nsweeper = require('./nsweeper');
const commander = require('commander');
const program = new commander.Command();
program.version('1.0.0');

function optParseInt(value) {
  return parseInt(value);
}

function optParsePercent(value) {
  return parseFloat(value);
}

program
  .option('-s, --size <number>', 'size of board along each dimension', optParseInt, 10)
  .option('-d, --dimension <number>', 'number of dimensions', optParseInt, 2)
  .option(
    '-x, --difficulty <float>',
    'difficulty, a float between 0 and 1 that reflects mine density',
    optParsePercent,
    0.1
  )
  .parse(process.argv);

async function main() {
  let game;
  try {
    game = new Nsweeper({
      dim: program.dimension,
      size: program.size,
      density: program.difficulty,
    });
  } catch (err) {
    console.log('Could not initialize game, see error below.');
    console.log(err);
    process.exit(1);
  }

  console.log(
    `\nInitialized nsweeper board with ${game.dim} dimensions, ${game.size} size per dimension, containing ${Math.floor(
      game.density * 100
    )}% mines.\n`
  );

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  printGame(game);
  process.stdout.write('Pick coordinates, exit, or help: ');
  for await (const line of rl) {
    if (line === 'quit' || line === 'exit') {
      rl.close();
    }
    if (line === 'help' || line === 'h') {
      console.log(
        '\nSelect coordination with a list of numbers separated by a non number character.\nExample: "0 1" will pick top row, one to the right on a grid.\nAdditional dimensions just require additional numbers.'
      );
      process.stdout.write('\nPick coordinates, exit, or help: ');
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
      printGame(game);
      console.log('You hit a mine! Game over.');
      rl.close();
    } else {
      printGame(game);
      process.stdout.write('Pick coordinates, exit, or help: ');
    }
  }
}

function printGame(game) {
  // print top indexes
  writeCell(' ');
  Array.from({ length: game.size }, (_, x) => writeCell(x + 1));
  writeNewline();

  function condition() {
    return true;
  }
  function effect({ arr, indices, i }) {
    let visibile = false;
    const curIndexString = JSON.stringify([...indices, i]);
    const row = indices[indices.length - 1];
    const val = arr[i];
    const transition = i + 1 === game.size;
    for (let i = 0; i < game.moves.length; i++) {
      if (JSON.stringify(game.moves[i]) === curIndexString) {
        visibile = true;
        break;
      }
    }
    if (i === 0) {
      writeCell(row + 1);
    }

    if (visibile) {
      writeCell(val);
    } else {
      writeCell('*');
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

function padCell(s, padTo = 4) {
  while (s.length < padTo) {
    s = ' ' + s;
  }
  return s;
}

function writeCell(input) {
  const stringPaddedInput = padCell(input.toString());
  process.stdout.write(stringPaddedInput);
}

main();
