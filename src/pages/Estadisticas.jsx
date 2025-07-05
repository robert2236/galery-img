import styled from "styled-components";7
import { Header } from "../components/Header";
export function Estadisticas() {
  return (
    <Container>
      <Header/>
      <h1>Estadistica</h1>
    </Container>
  );
}
const Container = styled.div`
 height:100vh;`;
