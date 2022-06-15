import _, { isEqual, differenceWith, cloneDeep, mean, groupBy } from "lodash";
import { previousMoves } from "../App";
import { CheckerColor } from "../types";

const AROUND = [
  [-1, -1],
  [-1, 1],
  [1, 1],
  [1, -1],
];

export function getPossibleMoves(cell, state) {
  const { grid, turn } = state;
  const [x, y] = cell;
  const isQueen = grid[x][y]?.isQueen;
  const [, enemyColor] = getPlayersColor(turn);

  if (isQueen) {
    const coordsAroundQueen = AROUND.map(([a, b]) => {
      const coords = [];

      // Get all possible coords around the queen
      for (let idx = 1; idx < 8; idx++) {
        const [newX, newY] = [a * idx + x, idx * b + y];

        if (grid[newX]?.[newY]?.color === enemyColor) {
          // Find first enemy and get all possible coords in that direction again
          for (let nextIdx = 1; nextIdx < 8; nextIdx++) {
            const [nextX, nextY] = [newX + a * nextIdx, newY + b * nextIdx];
            if (grid[nextX]?.[nextY]) {
              break;
            }
            coords.push([nextX, nextY, true]);
          }
        }

        if (grid[newX]?.[newY]) {
          break;
        }
        coords.push([newX, newY, false]);
      }

      return coords.filter(([a, b]) => a >= 0 && a <= 7 && b >= 0 && b <= 7);
    }).filter((e) => e.length > 0);

    const obligatoryMoves = coordsAroundQueen
      .flat()
      .filter(([, , hasToBit]) => hasToBit);

    if (obligatoryMoves.length > 0) {
      return obligatoryMoves;
    }

    const uniqueMoves = _.uniqWith(coordsAroundQueen.flat(), isEqual);
    return uniqueMoves;
  }

  const coordsAround = AROUND.map(([a, b]) => [a + x, b + y]);
  const mappedCoordsAround = coordsAround
    .map(([a, b], i) => {
      const isCellWithEnemy = !!(
        grid[a]?.[b] && grid[a][b].color === enemyColor
      );
      const [nextDiagX, nextDiagY] = isCellWithEnemy ? AROUND[i] : [0, 0];
      return [a + nextDiagX, b + nextDiagY, isCellWithEnemy];
    })
    .filter(([a, b, hasToBit], idx) => {
      const isInside = a >= 0 && a <= 7 && b >= 0 && b <= 7;
      // check if there is not any checker
      const isEmptyOnDiag = !grid[a]?.[b];
      // check if black can go up and white go down
      // [2, 3] and [0, 1] is related to coordsAround elements order
      const isMyPossibleTurn =
        (turn === 0 && [2, 3].includes(idx)) ||
        (turn === 1 && [0, 1].includes(idx));

      return isInside && isEmptyOnDiag && (hasToBit || isMyPossibleTurn);
    });
  const obligatoryMoves = mappedCoordsAround.filter(
    ([, , hasToBit]) => hasToBit
  );

  if (obligatoryMoves.length === 0) {
    return mappedCoordsAround;
  }
  return obligatoryMoves;
}

// moveToWithFlag - [x, y, isObligatoryFlag];
export function computeMove(moveFrom, moveToWithFlag, state) {
  const newState = cloneDeep(state);

  const { grid, turn } = newState;
  const [fromX, fromY] = moveFrom;
  const [toX, toY, enemyFlag] = moveToWithFlag;
  const isQueen = grid[fromX][fromY]?.isQueen;

  grid[toX][toY] = cloneDeep(grid[fromX][fromY]);
  grid[fromX][fromY] = null;

  if (enemyFlag) {
    if (isQueen) {
      const stepX = toX - fromX > 0 ? 1 : -1;
      const stepY = toY - fromY > 0 ? 1 : -1;
      for (let i = 0; i < Math.abs(fromX - toX); i++) {
        grid[fromX + stepX * i][fromY + stepY * i] = null;
      }
    } else {
      const [avgX, avgY] = [
        Math.floor(mean([toX, fromX])),
        Math.floor(mean([toY, fromY])),
      ];
      grid[avgX][avgY] = null;
    }

    const possibleMoves = getPossibleMoves([toX, toY], newState);
    const obligatoryMoves = possibleMoves.filter(([, , hasToBit]) => hasToBit);
    if (obligatoryMoves.length === 0) {
      newState.turn = turn === 0 ? 1 : 0;
    } else {
      previousMoves[newState.turn] = [];
      return newState;
    }
  } else {
    newState.turn = turn === 0 ? 1 : 0;
  }

  if ((toX === 7 && turn === 0) || (toX === 0 && turn === 1)) {
    grid[toX][toY].isQueen = true;
  }

  return newState;
}

export function arrayContains(elem, arr = []) {
  return differenceWith([elem], arr, isEqual).length === 0;
}

export function getPlayersColor(turn) {
  return [
    turn === 0 ? CheckerColor.WHITE : CheckerColor.BLACK,
    turn === 0 ? CheckerColor.BLACK : CheckerColor.WHITE,
  ];
}

export function getAllByColor(state, color) {
  const checkers = [];
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      if (state.grid[i][j]?.color === color) {
        checkers.push([i, j]);
      }
    }
  }
  return checkers;
}

export function isEnd(state) {
  const black = getAllByColor(state, CheckerColor.BLACK);
  const white = getAllByColor(state, CheckerColor.WHITE);
  return white.length === 0 || black.length === 0;
}

export function hasAnyQueen(state) {
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      if (state.grid[i][j] && state.grid[i][j].isQueen) {
        return true;
      }
    }
  }
  return false;
}

export function isLooping(array) {
  const grouped = groupBy(array);
  return (
    array.length >= 10 &&
    Object.keys(grouped).some((key) => grouped[key].length > 10)
  );
}
