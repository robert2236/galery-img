import { createContext, useContext, useState,useEffect } from 'react';
import React from 'react'
import { MyRoutes } from "./routers/routes";
import { BrowserRouter, useLocation } from "react-router-dom";
import { Light, Dark } from "./styles/Themes";
import { ThemeProvider } from "styled-components";
import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import styled from "styled-components";
import "./styles/Style.css";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import AuthProvider from "./Auth/Auth";
import { ToastContainer, toast } from "react-toastify";
import MobileFooter from "./components/Footer";

import AOS from "aos";
import "aos/dist/aos.css";

export const ThemeContext = React.createContext(null);
const SearchContext = createContext();

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch debe usarse dentro de un SearchProvider');
  }
  return context;
};

export const SearchProvider = ({ children }) => {
  const [search, setSearch] = useState("");
  
  return (
    <SearchContext.Provider value={{ search, setSearch }}>
      {children}
    </SearchContext.Provider>
  );
};

// Componente Layout para rutas que necesitan sidebar
const Layout = ({ children, sidebarOpen }) => {
  
  return (
    <SearchProvider>
    <AppWrapper>
      <Sidebar sidebarOpen={sidebarOpen} />
      <ContentWrapper sidebarOpen={sidebarOpen}>
        <Header  />
         <MainContent>
          {children}
        </MainContent>
        <MobileFooter />
      </ContentWrapper>
    </AppWrapper>
    </SearchProvider>
  );
};

const MainContent = styled.main`
  flex: 1;
  padding: 1rem 2rem;
  padding-bottom: 80px; /* Espacio para el footer móvil */

  @media (max-width: 768px) {
    padding: 1rem;
    padding-bottom: 80px; /* Ajusta según la altura de tu footer */
  }
`;

function App() {
  const [theme, setTheme] = useState("dark");
  const themeStyle = theme === "light" ? Light : Dark;
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    AOS.init();
  }, []);

  axios.defaults.baseURL = import.meta.env.VITE_API_URL;

  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      const { response } = error;
      if (response && response.status === 401) {
        window.location.href = "/login";
      }
      return Promise.reject(error);
    }
  );

  useEffect(() => {
    document.body.style.color = themeStyle.text;
    document.body.style.backgroundColor = themeStyle.bgtotal;
  }, [theme, themeStyle]);

  return (
    <AuthProvider>
      <ThemeContext.Provider value={{ setTheme, theme }}>
        <ThemeProvider theme={themeStyle}>
          <BrowserRouter>
            <ToastContainer
              position="top-center"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme={theme}
            />
            <RouterContent
              sidebarOpen={sidebarOpen}
              setSidebarOpen={setSidebarOpen}
            />
          </BrowserRouter>
        </ThemeProvider>
      </ThemeContext.Provider>
    </AuthProvider>
  );
}

// Componente separado para manejar el routing
const RouterContent = ({ sidebarOpen, setSidebarOpen }) => {
  const location = useLocation();
  // Cambia esta condición para identificar correctamente la página de login
  const isLoginPage =
    location.pathname === "/" || 
    location.pathname === "/login" || 
    location.pathname === "/register";



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
  height: auto;
  background: ${({ theme }) => theme.bgtotal};
`;

const ContentWrapper = styled.div`
  flex: 1;
  transition: margin-left 0.3s;
  margin-left: 90px;
  min-width: 0; // Fix para flexbox
  margin-top: 30px;

   @media (max-width: 768px) {
   margin-left: 0px !important;
}

`;

export default App;
