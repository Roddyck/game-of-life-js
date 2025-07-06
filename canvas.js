// @ts-check
// <reference path="./types.d.ts" />

import { createGameOfLife } from "./life.js";

/**
 * @param {HTMLSelectElement} select
 * @param {HTMLButtonElement} selectBtn
 * @param {Patterns} patterns
 */
function createSelect(select, selectBtn, patterns) {
  select.id = "patternSelect";
  selectBtn.textContent = "Add Pattern";
  selectBtn.id = "addPatternBtn";

  const option = document.createElement("option");
  option.value = "none";
  option.textContent = "none";
  select.appendChild(option);

  Object.keys(patterns).forEach((pattern) => {
    const option = document.createElement("option");
    option.value = pattern;
    option.textContent = pattern;
    select.appendChild(option);
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  /** @type {Config} */
  let config = {
    width: 500,
    height: 500,
    cellSize: 10,
    liveColor: "#000000",
    deadColor: "#ffffff",
    gridColor: "#dddddd",
    initialDensity: 0.3,
    frameDelay: 100,
    patterns: {},
  };

  try {
    const response = await fetch("config.json");
    console.log("fetching config");
    config = await response.json();
  } catch (e) {
    console.warn("No config file found. Using default config.");
  }

  console.log(config);

  /** @type {HTMLCanvasElement} */
  let canvas = document.createElement("canvas");
  /** @type {CanvasRenderingContext2D | null} */
  const ctx = canvas.getContext("2d");

  document.body.appendChild(canvas);

  const startBtn = document.getElementById("startBtn");
  const stopBtn = document.getElementById("stopBtn");
  const clearBtn = document.getElementById("clearBtn");
  const randomBtn = document.getElementById("randomBtn");
  const patternSelect = document.createElement("select");
  const addPatternBtn = document.createElement("button");
  const generation = document.getElementById("generation");
  const population = document.getElementById("population");

  let patternAddX = 5;
  let patternAddY = 5;

  canvas.width = config.width || 500;
  canvas.height = config.height || 500;

  const game = createGameOfLife(config);

  createSelect(patternSelect, addPatternBtn, game.getConfig().patterns);

  document.querySelector("div")?.appendChild(patternSelect);
  document.querySelector("div")?.appendChild(addPatternBtn);

  function drawGrid() {
    config = game.getConfig();
    if (!ctx) {
      throw new Error("Canvas context is null");
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const cellSize = config.cellSize;
    const grid = game.getGrid();

    for (let i = 0; i < game.getRows(); i++) {
      for (let j = 0; j < game.getCols(); j++) {
        if (grid[i][j] === 1) {
          ctx.fillStyle = config.liveColor;
          ctx.fillRect(j * cellSize, i * cellSize, cellSize, cellSize);
        } else {
          ctx.fillStyle = config.deadColor;
          ctx.fillRect(j * cellSize, i * cellSize, cellSize, cellSize);
        }

        ctx.strokeStyle = config.gridColor;
        ctx.strokeRect(j * cellSize, i * cellSize, cellSize, cellSize);
      }
    }

    if (!generation) {
      throw new Error("Generation element is null");
    }
    if (!population) {
      throw new Error("Population element is null");
    }

    generation.textContent = `Generation: ${game.getGeneration()}`;
    population.textContent = `Population: ${game.getPopulation()}`;
  }

  function animate() {
    game.nextGeneration();
    drawGrid();
    game.setAnimationId(requestAnimationFrame(animate));
  }

  canvas.addEventListener("click", (e) => {
    if (game.isRunning()) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cellSize = game.getConfig().cellSize;
    const grid = game.getGrid();

    const col = Math.floor(x / cellSize);
    const row = Math.floor(y / cellSize);

    if (patternSelect.value === "none") {
      grid[row][col] = grid[row][col] ? 0 : 1;
      drawGrid();
    } else {
      patternAddX = col;
      patternAddY = row;
    }
  });

  if (!startBtn) {
    throw new Error("Start button is null");
  }
  if (!stopBtn) {
    throw new Error("Stop button is null");
  }
  if (!clearBtn) {
    throw new Error("Clear button is null");
  }
  if (!randomBtn) {
    throw new Error("Random button is null");
  }
  if (!patternSelect) {
    throw new Error("Pattern select is null");
  }
  if (!addPatternBtn) {
    throw new Error("Add pattern button is null");
  }

  startBtn.addEventListener("click", () => {
    if (!game.isRunning()) {
      game.setRunning(true);
      animate();
    }
  });

  stopBtn.addEventListener("click", () => {
    if (game.isRunning()) {
      cancelAnimationFrame(game.getAnimationId());
      game.setRunning(false);
    }
  });

  clearBtn.addEventListener("click", () => {
    if (game.isRunning()) {
      cancelAnimationFrame(game.getAnimationId());
      game.setRunning(false);
    }
    game.clearGrid();
    drawGrid();
  });

  randomBtn.addEventListener("click", () => {
    if (game.isRunning()) {
      cancelAnimationFrame(game.getAnimationId());
      game.setRunning(false);
    }
    game.randomizeGrid();
    drawGrid();
  });

  addPatternBtn.addEventListener("click", () => {
    if (game.isRunning()) return;

    // Can I enforce user to select position from here?
    const pattern = patternSelect.value;
    const added = game.addPattern(pattern, patternAddX, patternAddY);
    if (added) {
      drawGrid();
    }
  });

  game.randomizeGrid();
  drawGrid();
});
