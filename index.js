import { cursorTo, clearScreenDown } from "readline";
import { stdout } from "process";
import { createGameOfLife } from "./life.js";

const width = process.stdout.columns || 80;
const height = (process.stdout.rows || 24) - 2;

const game = createGameOfLife(width, height, 1);
game.randomizeGrid();

function renderTerminal() {
  cursorTo(stdout, 0, 0);
  clearScreenDown(stdout);

  let output = "";
  const grid = game.getGrid();

  for (let i = 0; i < game.getRows(); i++) {
    for (let j = 0; j < game.getCols(); j++) {
      output += grid[i][j] === 1 ? "@" : " ";
    }
    output += "\n";
  }
  output += "\nGeneration: " + game.getGeneration();
  console.log(output);
}

function runTerminal() {
  renderTerminal();
  game.nextGeneration();

  if (!process.env.NO_ANIMATION) {
    setTimeout(runTerminal, 100);
  }
}

runTerminal();
