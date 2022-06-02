import styled from "@emotion/styled";

export const StyledWrapper = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: column;
`;

export const Grid = styled.div`
  margin: 50px auto;
  display: grid;
  grid-template-columns: repeat(8, 60px);
  grid-template-rows: repeat(8, 60px);
  border: solid 5px #000;
`;

export const GridItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  background: ${(props) =>
    props.highlighted
      ? "red"
      : props.active
      ? "yellow"
      : props.white
      ? "#fff"
      : "#9FC088"};
`;

export const Checker = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  background: ${(props) => (props.white ? "#fff" : "#303030")};
  height: 40px;
  width: 40px;
  border: solid 2px #000;
`;

export const StyledButton = styled.button`
  letter-spacing: 2px;
  text-decoration: none;
  text-transform: uppercase;
  margin: 0 auto;
  color: #000;
  cursor: pointer;
  border: 3px solid;
  padding: 0.25em 0.5em;
  box-shadow: 1px 1px 0px 0px, 2px 2px 0px 0px, 3px 3px 0px 0px, 4px 4px 0px 0px,
    5px 5px 0px 0px;
  position: relative;
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;

  &:active {
    box-shadow: 0px 0px 0px 0px;
    top: 5px;
    left: 5px;
  }
`;
