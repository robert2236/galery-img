import React, { useState, useEffect } from "react";
import { MyRoutes } from "./routers/routes";
import { BrowserRouter, useLocation } from "react-router-dom";
import { Light, Dark } from "./styles/Themes";
import { ThemeProvider } from "styled-components";
import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import styled from "styled-components";
import './styles/Style.css';

export const ThemeContext = React.createContext(null);

// Componente Layout para rutas que necesitan sidebar
const Layout = ({ children, sidebarOpen }) => {
  return (
    <AppWrapper>
      <Sidebar sidebarOpen={sidebarOpen} />
      <ContentWrapper sidebarOpen={sidebarOpen}>
        <Header />
        {children}
      </ContentWrapper>
    </AppWrapper>
  );
};

function App() {
  const [theme, setTheme] = useState("dark");
  const themeStyle = theme === "light" ? Light : Dark;
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    document.body.style.color = themeStyle.text;
    document.body.style.backgroundColor = themeStyle.bgtotal;
  }, [theme, themeStyle]);

  return (
    <ThemeContext.Provider value={{ setTheme, theme }}>
      <ThemeProvider theme={themeStyle}>
        <BrowserRouter>
          <RouterContent sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        </BrowserRouter>
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}

// Componente separado para manejar el routing
const RouterContent = ({ sidebarOpen, setSidebarOpen }) => {
  const location = useLocation();
  const isLoginPage = location.pathname.includes("/login");

  return (
    <>
      {isLoginPage ? (
        <MyRoutes />
      ) : (
        <Layout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
          <MyRoutes />
        </Layout>
      )}
    </>
  );
};

// Estilos optimizados
const AppWrapper = styled.div`
  display: flex;
  min-height: 100vh;
  background: ${({ theme }) => theme.bgtotal};
`;

const ContentWrapper = styled.div`
  flex: 1;
  transition: margin-left 0.3s;
  margin-left: 80px;
  padding: 20px;
  min-width: 0; // Fix para flexbox

  @media (max-width: 768px) {
    margin-left: 0;
  }
`;

export default App;