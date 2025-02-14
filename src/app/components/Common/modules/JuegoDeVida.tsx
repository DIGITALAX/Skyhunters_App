import { useRef, useEffect } from "react";

const CELL_SIZE = 10;
const WIDTH = 1000;
const HEIGHT = 400;
const COLS = WIDTH / CELL_SIZE;
const ROWS = HEIGHT / CELL_SIZE;

const crearMatrizVacia = (): number[][] =>
  Array.from({ length: ROWS }, () => Array(COLS).fill(0));

const crearMatrizAleatoria = (): number[][] =>
  Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => (Math.random() > 0.7 ? 1 : 0))
  );

const inyectarActividad = (grid: number[][], probabilidad = 0.1) => {
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      if (Math.random() < probabilidad) {
        grid[y][x] = 1;
      }
    }
  }
  return grid;
};

const JuegoDeVida = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gridRef = useRef<number[][]>(crearMatrizAleatoria());
  const frameCountRef = useRef(0);

  const dibujar = (ctx: CanvasRenderingContext2D, grid: number[][]) => {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        if (grid[y][x]) {
          const hue = (x * 17 + y * 23) % 360;
          ctx.fillStyle = `hsl(${hue}, 80%, 60%)`;
          ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        }
      }
    }
  };

  const contarVecinos = (grid: number[][], x: number, y: number) => {
    let total = 0;
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        if (i === 0 && j === 0) continue;
        const col = x + j;
        const row = y + i;
        if (row >= 0 && row < ROWS && col >= 0 && col < COLS) {
          total += grid[row][col];
        }
      }
    }
    return total;
  };

  const actualizar = (grid: number[][]) => {
    const nuevaGrid = crearMatrizVacia();
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        const vecinos = contarVecinos(grid, x, y);
        if (grid[y][x] && (vecinos === 2 || vecinos === 3)) {
          nuevaGrid[y][x] = 1;
        } else if (!grid[y][x] && vecinos === 3) {
          nuevaGrid[y][x] = 1;
        }
      }
    }
    return nuevaGrid;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let animationFrameId: number;
    const loop = () => {
      frameCountRef.current++;
      if (frameCountRef.current % 300 === 0) {
        gridRef.current = inyectarActividad(gridRef.current, 0.1);
      }
      gridRef.current = actualizar(gridRef.current);
      dibujar(ctx, gridRef.current);
      animationFrameId = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={WIDTH}
      height={HEIGHT}
      className="overflow-hidden rounded-lg"
      style={{ border: "1px solid #000" }}
    />
  );
};

export default JuegoDeVida;
