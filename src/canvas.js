// @ts-check
// <reference path="./types.d.ts" />

import { createGameOfLife } from "./life.js";

/**
 * @param {HTMLSelectElement} select
 * @param {Patterns} patterns
 */
function createSelect(select, patterns) {
  select.id = "patternSelect";

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

  document.body.prepend(canvas);

  const playPauseBtn = document.getElementById("play-pause-btn");
  const clearBtn = document.getElementById("clearBtn");
  const randomBtn = document.getElementById("randomBtn");
  const patternSelect = document.createElement("select");
  const generation = document.getElementById("generation");
  const population = document.getElementById("population");

  canvas.width = config.width || 500;
  canvas.height = config.height || 500;

  const game = createGameOfLife(config);

  createSelect(patternSelect, game.getConfig().patterns);

  document.querySelector("div")?.appendChild(patternSelect);

  function drawGrid() {
    config = game.getConfig();

    if (!ctx) {
      console.error("Canvas context is null");
      return;
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

    if (!generation || !population) {
      console.error("Generation or population element is null, do something");
      return;
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

    const patternValue = patternSelect.value;

    if (patternValue === "none") {
      grid[row][col] = grid[row][col] ? 0 : 1;
      drawGrid();
    } else {
      const added = game.addPattern(patternValue, col, row);
      if (added) {
        drawGrid();
      }
    }
  });

  const handlePlayPauseBtnClick = () => {
    if (!playPauseBtn) {
      return;
    }
    if (!game.isRunning()) {
      game.setRunning(true);
      playPauseBtn.textContent = "Pause";
      animate();
    } else {
      const animationId = game.getAnimationId();
      if (animationId != null) {
        cancelAnimationFrame(animationId);
        playPauseBtn.textContent = "Play";
        game.setRunning(false);
      }
    }
  };

  const handleClearBtnClick = () => {
    if (game.isRunning()) {
      const animationId = game.getAnimationId();
      if (animationId != null) {
        cancelAnimationFrame(animationId);
        game.setRunning(false);
      }
    }
    game.clearGrid();
    drawGrid();
  };

  const handleRandomBtnClick = () => {
    if (game.isRunning()) {
      const animationId = game.getAnimationId();
      if (animationId != null) {
        cancelAnimationFrame(animationId);
        game.setRunning(false);
      }
    }
    game.randomizeGrid();
    drawGrid();
  };

  playPauseBtn?.addEventListener("click", handlePlayPauseBtnClick);

  clearBtn?.addEventListener("click", handleClearBtnClick);

  randomBtn?.addEventListener("click", handleRandomBtnClick);

  game.randomizeGrid();
  drawGrid();

  document.addEventListener("keydown", (e) => {
    if (e.getModifierState("Control")) {
      return;
    }

    switch (e.key) {
      case " ":
      case "Enter":
        handlePlayPauseBtnClick();
        break;
      case "r":
        handleRandomBtnClick();
        break;
      case "c":
        handleClearBtnClick();
        break;
    }
  });
});
