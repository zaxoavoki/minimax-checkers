import {
  computeMove,
  getAllByColor,
  getPlayersColor,
  getPossibleMoves,
} from "./helpers";
import config from "../config";

function cost(state, isMoving) {
  const { grid, turn } = state;
  const [myColor, enemyColor] = getPlayersColor(turn);
  const [color] = getPlayersColor(isMoving);

  let cost = 0;
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      if (grid[i][j]?.color === myColor) {
        cost += grid[i][j].isQueen ? 5 : 1;
      }
      if (grid[i][j]?.color === enemyColor) {
        cost -= grid[i][j].isQueen ? 5 : 1;
      }
    }
  }
  return color === myColor ? cost : -cost;
}

export function minimax(
  depth = 0,
  expectMax = true,
  state,
  maxDepth = config.MAX_DEPTH,
  isMoving = 0
) {
  const [myColor, enemyColor] = getPlayersColor(state.turn);
  const myCheckers = getAllByColor(state, myColor);
  const enemyCheckers = getAllByColor(state, enemyColor);

  if (myCheckers.length === 0) {
    return { value: isMoving === state.turn ? -Infinity : Infinity, move: null };
  }
  if (enemyCheckers.length === 0) {
    return { value: isMoving === state.turn ? Infinity : -Infinity, move: null };
  }

  if (depth === maxDepth) {
    return { value: cost(state, isMoving), move: null };
  }

  const cellsWithPossibleMoves = myCheckers
    .map((cell) => [cell, getPossibleMoves(cell, state)])
    .filter(([, b]) => b.length > 0);
  const cellsWithObligatoryMoves = cellsWithPossibleMoves.map(([cell, pms]) => {
    return [cell, pms.filter(([, , hasToBit]) => hasToBit === true)];
  });

  const hasAnyObligatoryMove = cellsWithObligatoryMoves.some(
    ([, pms]) => pms.length > 0
  );

  const finalMoves = !hasAnyObligatoryMove
    ? cellsWithPossibleMoves
    : cellsWithObligatoryMoves;

  const states = finalMoves
    .map(([moveFrom, possibleMoves]) => {
      return possibleMoves.map((moveTo) => {
        return {
          moveFrom,
          moveTo,
          state: computeMove(moveFrom, moveTo, state),
        };
      });
    })
    .flat();

  let max = { value: -Infinity, move: null };
  let min = { value: Infinity, move: null };

  for (const { state, moveTo, moveFrom } of states) {
    const { value } = minimax(
      depth + 1,
      state.turn === isMoving,
      state,
      maxDepth,
      isMoving
    );
    if (expectMax && max.value <= value)
      max = { value, move: [moveFrom, moveTo] };
    if (!expectMax && min.value >= value)
      min = { value, move: [moveFrom, moveTo] };
  }

  return expectMax ? max : min;
}

export function minimaxWithPrunning(
  alpha,
  beta,
  depth = 0,
  expectMax = true,
  state,
  maxDepth = config.MAX_DEPTH,
  isMoving = 0
) {
  const [myColor, enemyColor] = getPlayersColor(state.turn);
  const myCheckers = getAllByColor(state, myColor);
  const enemyCheckers = getAllByColor(state, enemyColor);

  if (myCheckers.length === 0) {
    return { value: isMoving === state.turn ? -Infinity : Infinity, move: null };
  }
  if (enemyCheckers.length === 0) {
    return { value: isMoving === state.turn ? Infinity : -Infinity, move: null };
  }

  if (depth === maxDepth) {
    return { value: cost(state, isMoving), move: null };
  }

  const cellsWithPossibleMoves = myCheckers
    .map((cell) => [cell, getPossibleMoves(cell, state)])
    .filter(([, b]) => b.length > 0);
  const cellsWithObligatoryMoves = cellsWithPossibleMoves.map(([cell, pms]) => {
    return [cell, pms.filter(([, , hasToBit]) => hasToBit === true)];
  });

  const hasAnyObligatoryMove = cellsWithObligatoryMoves.some(
    ([, pms]) => pms.length > 0
  );

  const finalMoves = !hasAnyObligatoryMove
    ? cellsWithPossibleMoves
    : cellsWithObligatoryMoves;

  const states = finalMoves
    .map(([moveFrom, possibleMoves]) => {
      return possibleMoves.map((moveTo) => {
        return {
          moveFrom,
          moveTo,
          state: computeMove(moveFrom, moveTo, state),
        };
      });
    })
    .flat();

  let max = { value: -Infinity, move: null };
  let min = { value: Infinity, move: null };

  if (expectMax) {
    for (const { state, moveTo, moveFrom } of states) {
      const { value } = minimaxWithPrunning(
        alpha,
        beta,
        depth + 1,
        state.turn === isMoving,
        state,
        maxDepth,
        isMoving
      );
      if (max.value < value) {
        max = { value, move: [moveFrom, moveTo] };
      }
      alpha = Math.max(alpha, max.value);
      if (beta <= alpha) {
        break;
      }
    }

    return max;
  }

  for (const { state, moveTo, moveFrom } of states) {
    const { value } = minimaxWithPrunning(
      alpha,
      beta,
      depth + 1,
      state.turn === isMoving,
      state,
      maxDepth,
      isMoving
    );
    if (min.value > value) {
      min = { value, move: [moveFrom, moveTo] };
    }
    beta = Math.min(beta, min.value);
    if (beta <= alpha) {
      break;
    }
  }   

  return min;
}
