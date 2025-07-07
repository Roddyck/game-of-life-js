import { cursorTo, clearScreenDown } from "readline";
import { stdout } from "process";
import { createGameOfLife } from "./life.js";
import { readFileSync } from "fs";

let config = {};
try {
  const configFile = readFileSync("./config.json", "utf8");
  config = JSON.parse(configFile);
} catch (e) {
  console.warn("No config file found. Using default config.");
}

const width = process.stdout.columns || config.width || 80;
const height = (process.stdout.rows || config.height ||  24) - 2;

const game = createGameOfLife({ ...config, width, height, cellSize: 1 });
game.randomizeGrid(config.initialDensity);

if (process.argv[2] && game.getConfig().patterns[process.argv[2]]) {
  game.addPattern(process.argv[2], 5, 5);
}

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
