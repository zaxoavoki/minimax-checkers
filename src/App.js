import { useEffect, useState } from "react";
import { CheckerColor, PlayerType } from "./types";
import { Grid, GridItem, Checker, StyledWrapper } from "./styled";
import {
  arrayContains,
  computeMove,
  getAllByColor,
  getPlayersColor,
  getPossibleMoves,
  hasAnyQueen,
  isLooping,
} from "./utils/helpers";
import config from "./config";
import { minimax, minimaxWithPrunning } from "./utils/bot";

export const previousMoves = {
  0: [],
  1: [],
};

function App() {
  const [activeCell, setActiveCell] = useState();
  const [players, setPlayers] = useState([
    PlayerType.COMPUTER,
    PlayerType.COMPUTER,
  ]);
  const [state, setState] = useState({
    grid: config.INITIAL_FIELD,
    turn: config.INITIAL_TURN,
    started: false,
    ended: false,
  });

  function handleStart() {
    previousMoves[0] = [];
    previousMoves[1] = [];

    setState((p) => ({
      ...p,
      started: true,
    }));
  }

  function botMove() {
    const { move } = minimaxWithPrunning(
      -Infinity,
      Infinity,
      0,
      true,
      state,
      config.MAX_DEPTH[state.turn],
      state.turn
    );

    // const { move } = minimax(0, true, state, config.MAX_DEPTH, state.turn);

    if (!move) {
      console.log(state.turn ^ 1, 'is winner')
      return setState((p) => ({ ...p, ended: true }));
    }

    const [moveFrom, moveTo] = move;
    if (hasAnyQueen(state)) {
      previousMoves[state.turn].push(moveTo);
      if (isLooping(previousMoves[0]) && isLooping(previousMoves[1])) {
        return setState((p) => ({ ...p, ended: true }));
      }
    }

    const newState = computeMove(moveFrom, moveTo, state);
    setState(newState);
  }

  useEffect(() => {
    if (
      state.started &&
      !state.ended &&
      players[state.turn] === PlayerType.COMPUTER
    ) {
      setTimeout(() => {
        botMove();
      }, 200);
    }
  }, [state]);

  function handleSelect(cell) {
    const turns = {
      1: CheckerColor.BLACK,
      0: CheckerColor.WHITE,
    };

    if (players[state.turn] !== PlayerType.PERSON) return;
    if (activeCell?.active) {
      if (
        arrayContains(
          cell,
          activeCell.possibleMoves.map((e) => e.slice(0, 2))
        )
      ) {
        const cellWithFlag = activeCell.possibleMoves.find(
          ([a, b]) => a === cell[0] && b === cell[1]
        );
        move(cellWithFlag);
      }
    }

    const [x, y] = cell;
    if (turns[state.turn] === CheckerColor[state.grid[x][y]?.color]) {
      const [myColor] = getPlayersColor(state.turn);
      const checkers = getAllByColor(state, myColor);

      const checkersPossibleMoves = checkers.map(([a, b]) =>
        getPossibleMoves([a, b], state)
      );
      const hasAnyObligatoryMove = checkersPossibleMoves.some((pms) =>
        pms.some(([, , hasToBit]) => hasToBit)
      );

      const possibleMoves = getPossibleMoves(cell, state);
      const obligatoryMoves = possibleMoves.filter(
        ([, , hasToBit]) => hasToBit
      );

      setActiveCell({
        active: cell,
        possibleMoves: hasAnyObligatoryMove ? obligatoryMoves : possibleMoves,
      });
    } else {
      setActiveCell(undefined);
    }
  }

  function move(cell) {
    const computedMove = computeMove(activeCell.active, cell, state);
    setState(computedMove);
  }

  return (
    <StyledWrapper>
      <Grid>
        {state.grid.map((row, i) =>
          row.map((v, j) => (
            <GridItem
              key={`${i}${j}`}
              onClick={() => handleSelect([i, j])}
              active={
                activeCell &&
                activeCell.active[0] === i &&
                activeCell.active[1] === j
              }
              highlighted={arrayContains(
                [i, j],
                activeCell?.possibleMoves.map((e) => e.slice(0, 2))
              )}
              white={j % 2 === i % 2}
            >
              {v && (
                <Checker
                  queen={v.isQueen}
                  white={v.color === CheckerColor.WHITE}
                />
              )}
            </GridItem>
          ))
        )}
      </Grid>
      {state.ended && (
        <h4 style={{ textAlign: "center " }}>The game has been ended</h4>
      )}
      <button onClick={handleStart} style={{ width: "100px", margin: "auto" }}>
        Start game
      </button>
    </StyledWrapper>
  );
}

export default App;
