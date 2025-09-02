import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Form } from "react-bootstrap";
import { IoIosArrowDown, IoMdCheckmarkCircle } from "react-icons/io";
import profile from "../images/bird_cockatiel.jpg";
import NavDropdown from "react-bootstrap/NavDropdown";
import api from "../Auth/Api";
import { toast } from "react-toastify";
import { useAuth } from '../Auth/Auth';

export function Header() {
  const [show, setShow] = useState(false);
  const [user, setUsers] = useState("");
  const { close } = useAuth();

    const handleLogout = () => {
    close();
    // Aquí puedes agregar más lógica después del logout si es necesario
  };

  const getUsers = async () => {
    try {
      const response = await api.get("/api/users");
      setUsers(response.data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.detail || "Error al obtener usuarios");
      throw err;
    } finally {
    }
  };

  useEffect(() => {
    getUsers();
  }, []);

  return (
    <HeaderContainer className="d-flex justify-content-between align-items-center gap-3">
         <div className="row align-items-center w-100">
    {/* Búsqueda ocupa 9 columnas (75%) en mobile, auto en desktop */}
    <div className="col-sm-9">
      <div className="d-flex align-items-center">
        <div className="d-sm-none me-2">Logo</div>
        <ThemeFormControl 
          type="text" 
          placeholder="Search..." 
          className="w-100"
        />
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
          <NavDropdown.Item href="#action/3.1">
            <div className="d-flex flex-row align-items-center gap-3">
              <img
                src={profile}
                alt="Profile"
                className="rounded-circle me-2"
                style={{ width: "68px", height: "68px"}}
              />
              <div className="d-flex flex-column">
                <span>Personal</span>
                <span>{user?.username}</span>
                <span>{user?.email}</span>
              </div>
              <div><IoMdCheckmarkCircle size={20} color="#9fef00"  /></div>
            </div>
            <hr />
          </NavDropdown.Item>
          <NavDropdown.Item href="/config">Configuración</NavDropdown.Item>
          <NavDropdown.Item href="#action/3.3">Mis tableros</NavDropdown.Item>
         <hr className="ms-3 me-3"/>
          <NavDropdown.Item onClick={handleLogout}>Cerrar sesión</NavDropdown.Item>
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

  &::placeholder {
    color: ${({ theme }) =>
      theme.inputPlaceholder || theme.textSecondary} !important;
    opacity: 1;
  }
`;
