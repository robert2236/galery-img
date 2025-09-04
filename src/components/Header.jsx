import React, {  useContext,useState, useEffect } from "react";
import styled from "styled-components";
import { Form, Button } from "react-bootstrap";
import { IoIosArrowDown, IoMdCheckmarkCircle } from "react-icons/io";
import profile from "../images/bird_cockatiel.jpg";
import NavDropdown from "react-bootstrap/NavDropdown";
import api from "../Auth/Api";
import { toast } from "react-toastify";
import { useAuth } from "../Auth/Auth";
import { useSearch } from "../App";
import { MdOutlineSearch } from "react-icons/md";
import { ThemeContext } from "../App";

export function Header() {
   const { setTheme, theme } = useContext(ThemeContext);
  const [show, setShow] = useState(true);
  const [user, setUsers] = useState("");
  const { setSearch } = useSearch();
  const [darkMode, setDarkMode] = useState(false);
  const { close } = useAuth();
   console.log(darkMode);
   

  const handleLogout = () => {
    close();
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    changeTheme();
  };

  const getUsers = async () => {
    try {
      const response = await api.get("/api/users");
      setUsers(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || "Error al obtener usuarios");
      throw err;
    } finally {
    }
  };

  useEffect(() => {
    getUsers();
  }, []);

useEffect(() => {
  if (user?.theme) {
    setTheme("dark");
  } else {
    setTheme("light");
  }
}, [user]);

  const changeTheme = async () => {
    try {
      await api.put("/api/change-theme", { theme: darkMode });
      getUsers();
    } catch (error) {
      toast.error("No se pudo cambiar el tema");
    }finally{
    }
  };

  return (
    <HeaderContainer className="d-flex justify-content-between align-items-center gap-3">
      <div className="row align-items-center w-100">
        <div className="col-sm-9 gap-3">
          <div className="d-flex align-items-center ms-sm-5">
            <div className="d-sm-none d-inline me-3">Logo</div>
            <div className="d-none d-sm-flex align-items-center flex-grow-1">
              <ThemeFormControl
                type="text"
                placeholder="Buscar..."
                onChange={(e) => setSearch(e.target.value)}
                className="w-100"
                style={{ minWidth: "200px" }}
              />
            </div>

            {/* CONTENEDOR MOBILE */}
            <div className="d-flex d-sm-none align-items-center gap-2">
              {/* Barra mobile - Condicional */}
              {show && (
                <div className="d-flex align-items-center me-2">
                  <ThemeFormControl
                    type="text"
                    placeholder="Buscar..."
                    onChange={(e) => setSearch(e.target.value)}
                    className="me-4"
                    style={{ minWidth: "90px" }}
                  />
                </div>
              )}

              {/* Ícono de búsqueda mobile */}
              <MdOutlineSearch
                className="cursor-pointer position-absolute"
                style={{
                  right: "25%",
                  top: "50%",
                  transform: "translateY(-50%)",
                }}
                onClick={() => setShow((prev) => !prev)}
                size={30}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="d-flex flex-row align-items-center">
        <NavDropdown
          title={
            <div className="d-flex align-items-center">
              <img
                src={profile}
                alt="Profile"
                className="rounded-circle me-2"
                style={{ width: "48px", height: "48px" }}
              />
              <IoIosArrowDown />
            </div>
          }
          align="end"
          menuVariant="dark"
          className="custom-dropdown"
        >
          <NavDropdown.Item href="/Config">
            <div className="d-flex flex-row align-items-center gap-3">
              <img
                src={profile}
                alt="Profile"
                className="rounded-circle me-2"
                style={{ width: "68px", height: "68px" }}
              />
              <div className="d-flex flex-column">
                <span>Personal</span>
                <span>{user?.username}</span>
                <span>{user?.email}</span>
              </div>
              <div>
                <IoMdCheckmarkCircle size={20} color="#9fef00" />
              </div>
            </div>
            <hr />
          </NavDropdown.Item>
          <NavDropdown.Item href="/config">Configuración</NavDropdown.Item>
          <NavDropdown.Item   onClick={toggleDarkMode} className="d-flex flex-row align-items-center justify-content-between">
            Cambiar tema{" "}
            <div style={{ width: "30px", height: "30px" }}>
              <Button
                variant={darkMode ? "dark" : "ligth"}
                size="sm"
                data-tooltip-id="change-theme"
                data-tooltip-content="Cambiar tema"
              >
                {darkMode ? "🌙" : "☀️"}
              </Button>
            </div>
          </NavDropdown.Item>
          <hr className="ms-3 me-3" />
          <NavDropdown.Item onClick={handleLogout}>
            Cerrar sesión
          </NavDropdown.Item>
        </NavDropdown>
      </div>
    </HeaderContainer>
  );
}

const HeaderContainer = styled.header`
  background: ${(props) => props.theme.bg};
  color: ${(props) => props.theme.text};
  padding: 1rem;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  z-index: 100;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  margin-left: 80px;
  border-radius: 5px;

  @media (max-width: 768px) {
    margin-left: 0px;
  }
`;

const ThemeFormControl = styled(Form.Control)`
  background-color: ${({ theme }) => theme.inputBg || theme.bg} !important;
  color: ${({ theme }) => theme.inputText || theme.text} !important;
  border-color: ${({ theme }) => theme.inputBorder || theme.border} !important;

  &:focus {
    background-color: ${({ theme }) => theme.inputBg || theme.bg} !important;
    color: ${({ theme }) => theme.inputText || theme.text} !important;
    border-color: ${({ theme }) => theme.primary} !important;
    box-shadow: 0 0 0 0.2rem
      ${({ theme }) => theme.focusShadow || "rgba(0,123,255,.25)"} !important;
  }

  /* Placeholder adaptativo */
  &::placeholder {
    color: #6c757d !important; /* Default light mode */
    opacity: 1;
  }

  .dark-mode &::placeholder {
    color: #fff !important; /* Dark mode */
  }

  .light-mode &::placeholder {
    color: #6c757d !important; /* Light mode */
  }
`;
