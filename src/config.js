import { CheckerColor } from "./types";

const config = {
  MAX_DEPTH: [1, 2],
  INITIAL_TURN: 0,
  INITIAL_FIELD: Array(8)
    .fill(0)
    .map((_, i) =>
      Array(8)
        .fill(0)
        .map((_, j) => {
          if (i < 2 && j % 2 !== i % 2)
            return {
              isQueen: false,
              color: CheckerColor.WHITE,
            };
          if (i > 5 && i <= 7 && j % 2 !== i % 2)
            return {
              isQueen: false,
              color: CheckerColor.BLACK,
            };
          return null;
        })
    ),
};

export default config;
