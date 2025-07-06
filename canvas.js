import { createGameOfLife } from "./life.js";

document.addEventListener("DOMContentLoaded", async () => {
  let config = {};

  try {
    const response = await fetch("config.json");
    console.log("fetching config");
    config = await response.json();
  } catch (e) {
    console.warn("No config file found. Using default config.");
  }

  console.log(config);

  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");
  const startBtn = document.getElementById("startBtn");
  const stopBtn = document.getElementById("stopBtn");
  const clearBtn = document.getElementById("clearBtn");
  const randomBtn = document.getElementById("randomBtn");
  const patternSelect = document.createElement("select");
  const addPatternBtn = document.createElement("button");

  canvas.width = config.width || 500;
  canvas.height = config.height || 500;

  const game = createGameOfLife(config);

  patternSelect.id = "patternSelect";
  addPatternBtn.textContent = "Add Pattern";
  addPatternBtn.id = "addPatternBtn";

  Object.keys(game.getConfig().patterns).forEach((pattern) => {
    const option = document.createElement("option");
    option.value = pattern;
    option.textContent = pattern;
    patternSelect.appendChild(option);
  });

  document.querySelector("div").appendChild(patternSelect);
  document.querySelector("div").appendChild(addPatternBtn);

  function drawGrid() {
    config = game.getConfig();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const cellSize = config.cellSize;

    for (let i = 0; i < game.getRows(); i++) {
      for (let j = 0; j < game.getCols(); j++) {
        if (game.getGrid()[i][j] === 1) {
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

    ctx.fillStyle = "black";
    ctx.font = "16px Arial";
    ctx.fillText(`Generation: ${game.getGeneration()}`, 10, 20);
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

    grid[row][col] = grid[row][col] ? 0 : 1;
    drawGrid();
  });

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

    const pattern = patternSelect.value;
    const added = game.addPattern(pattern, 5, 5);
    if (added) {
      drawGrid();
    }
  });

  game.randomizeGrid();
  drawGrid();
});
