/**
 * @typedef {Object} Pattern
 * @property {number[][]} cells The cells of the pattern.
 * @property {string} description The description of the pattern.
 */

/**
 * @typedef {Object} Patterns
 * @property {Pattern} pattern The pattern object.
 */

/**
 * @typedef {Object} Config
 * @property {number} width The width of the canvas.
 * @property {number} height The height of the canvas.
 * @property {number} cellSize The size of each cell.
 * @property {string} liveColor The color of live cells.
 * @property {string} deadColor The color of dead cells.
 * @property {string} gridColor The color of the grid.
 * @property {number} initialDensity The initial density of the grid.
 * @property {number} frameDelay The delay between frames.
 * @property {Patterns} patterns The patterns to add to the grid.
 */

/**
 * @typedef {Object} GameOfLife
 * @property {function} getConfig Returns the configuration object.
 * @property {function} getGrid Returns the current grid.
 * @property {function} getGeneration Returns the current generation.
 * @property {function} randomizeGrid Randomizes the grid with the given density.
 * @property {function} clearGrid Clears the grid.
 * @property {function} addPattern Adds a pattern to the grid.
 * @property {function} nextGeneration Returns the next generation of the grid.
 * @property {function} setRunning Sets whether the game is running.
 * @property {function} isRunning Returns whether the game is running.
 * @property {function} setAnimationId Sets the animation ID.
 * @property {function} getAnimationId Returns the animation ID.
 * @property {function} getRows Returns the number of rows in the grid.
 * @property {function} getCols Returns the number of columns in the grid.
 */

/**
 * Creates a game of life object.
 * @param {Config} config The configuration object.
 * @returns {GameOfLife}
 */
export function createGameOfLife(config) {
  const defaultConfig = {
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

  const mergedConfig = { ...defaultConfig, ...config };

  const rows = Math.floor(mergedConfig.height / mergedConfig.cellSize);
  const cols = Math.floor(mergedConfig.width / mergedConfig.cellSize);

  let grid = createEmptyGrid();
  let isRunning = false;
  let animationId = null;
  let generation = 0;

  function createEmptyGrid() {
    return Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => 0),
    );
  }

  function randomizeGrid(density = mergedConfig.initialDensity) {
    grid = grid.map((row) => row.map(() => (Math.random() < density ? 1 : 0)));
    generation = 0;
  }

  function clearGrid() {
    grid = createEmptyGrid();
    generation = 0;
  }

  /**
   * Adds a pattern to the grid.
   *
   * @param {Pattern} pattern The pattern object.
   * @param {number} x The x-coordinate of the pattern's center.
   * @param {number} y The y-coordinate of the pattern's center.
   * @returns {boolean} Whether the pattern was added successfully.
   */
  function addPattern(pattern, x = 0, y = 0) {
    if (!mergedConfig.patterns[pattern]) return false;

    const patternCells = mergedConfig.patterns[pattern].cells;
    patternCells.forEach(([px, py]) => {
      const nx = x + px;
      const ny = y + py;
      if (nx >= 0 && nx < rows && ny >= 0 && ny < cols) {
        grid[ny][nx] = 1;
      }
    });

    return true;
  }

  /**
   * Returns the next generation of the grid.
   *
   * @param {number} row The row of the cell to check.
   * @param {number} col The column of the cell to check.
   * @returns {number} The number of live neighbors.
   * */
  function countNeighbors(row, col) {
    let count = 0;
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        if (i === 0 && j === 0) continue;
        const neighborRow = row + i;
        const neighborCol = col + j;
        if (
          neighborRow >= 0 &&
          neighborRow < rows &&
          neighborCol >= 0 &&
          neighborCol < cols
        ) {
          count += grid[neighborRow][neighborCol];
        }
      }
    }
    return count;
  }

  function nextGeneration() {
    const newGrid = createEmptyGrid();

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < rows; j++) {
        const cell = grid[i][j];
        const neighbors = countNeighbors(i, j);

        if (cell === 1 && (neighbors < 2 || neighbors > 3)) {
          newGrid[i][j] = 0;
        } else if (cell === 0 && neighbors === 3) {
          newGrid[i][j] = 1;
        } else {
          newGrid[i][j] = cell;
        }
      }
    }

    grid = newGrid;
    generation++;
    return grid;
  }

  return {
    getConfig: () => ({ ...mergedConfig }),
    getGrid: () => grid,
    getGeneration: () => generation,
    randomizeGrid,
    clearGrid,
    addPattern,
    nextGeneration,
    setRunning: (running) => {
      isRunning = running;
    },
    isRunning: () => isRunning,
    setAnimationId: (id) => {
      animationId = id;
    },
    getAnimationId: () => animationId,
    getRows: () => rows,
    getCols: () => cols,
  };
}
