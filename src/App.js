import { useEffect, useState } from "react";
import { CheckerColor, PlayerType } from "./types";
import { ReactComponent as Icon } from "./assets/crown.svg";
import { Grid, GridItem, Checker, StyledWrapper, StyledButton } from "./styled";
import {
  arrayContains,
  computeMove,
  getAllByColor,
  getPlayersColor,
  getPossibleMoves,
  hasAnyQueen,
  isEnd,
  isLooping,
} from "./utils/helpers";
import config from "./config";
import { minimaxWithPrunning } from "./utils/bot";

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

    if (!move) {
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
    if (isEnd(newState)) {
      return setState({ ...newState, ended: true });
    }
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
    const newState = computeMove(activeCell.active, cell, state);
    if (isEnd(newState)) {
      setState({ ...newState, ended: true });
    } else {
      setState(newState);
    }
  }

  function handleReset() {
    setState({
      grid: config.INITIAL_FIELD,
      turn: config.INITIAL_TURN,
      started: false,
      ended: false,
    });
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
                >
                  {v.isQueen && <Icon />}
                </Checker>
              )}
            </GridItem>
          ))
        )}
      </Grid>
      {state.ended && (
        <h2 style={{ textAlign: "center" }}>
          The game has been ended, {getPlayersColor(state.turn ^ 1)[0]} won!
        </h2>
      )}
      <StyledButton
        onClick={() => (state.started ? handleReset() : handleStart())}
      >
        {state.started ? "Reset" : "Start"} game
      </StyledButton>
    </StyledWrapper>
  );
}

export default App;
