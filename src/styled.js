import styled from '@emotion/styled';

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
  border: solid 5px #b0935d;
`;

export const GridItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  background: ${props => props.highlighted ? 'red' : props.active ? '#aaa' : props.white ? '#f2f2f2' : '#b0935d'};
`;

export const Checker = styled.div`
  border-radius: 50%;
  background: ${props => props.white ? '#ddd' : '#404040'};
  height: 40px;
  width: 40px;
  border: solid 2px ${props => props.queen ? 'yellow': props.white ? '#aaa' : '#000'};
`;