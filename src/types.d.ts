type Pattern = {
    cells: [number, number][];
    description: string;
};

type Patterns = {
    [key: string]: Pattern;
};

type Config = {
    width: number;
    height: number;
    cellSize: number;
    liveColor: string;
    deadColor: string;
    gridColor: string;
    initialDensity: number;
    frameDelay: number;
    patterns: Patterns;
};

type GameOfLife = {
    getConfig: () => Config;
    getGrid: () => number[][];
    getGeneration: () => number;
    getPopulation: () => number;
    randomizeGrid: (density?: number) => void;
    clearGrid: () => void;
    addPattern: (pattern: string, x: number, y: number) => boolean;
    nextGeneration: () => number[][];
    setRunning: (running: boolean) => void;
    isRunning: () => boolean;
    setAnimationId: (id: number) => void;
    getAnimationId: () => number | null;
    getRows: () => number;
    getCols: () => number;
};
