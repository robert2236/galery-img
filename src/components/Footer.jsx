// components/MobileFooter.js
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';


// Iconos (asegúrate de tener react-icons instalado)
import { FaHome, FaHeart, FaUser, FaPlus} from 'react-icons/fa';

const MobileFooterContainer = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: ${({ theme }) => theme.bg};
  border-top: 1px solid ${({ theme }) => theme.border};
  padding: 0.5rem;
  display: none;
  justify-content: space-around;
  align-items: center;
  z-index: 1000;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    display: flex;
  }
`;

const FooterButton = styled(Link)`
  background: none;
  border: none;
  color: ${({ theme, $isActive }) => $isActive ? theme.primary : theme.text};
  padding: 0.5rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  text-decoration: none;
  min-width: 60px;

  &:hover {
    background-color: ${({ theme }) => theme.bgHover};
    color: ${({ theme }) => theme.primary};
  }

  svg {
    font-size: 1.2rem;
  }

  span {
    font-size: 0.7rem;
    font-weight: ${({ $isActive }) => $isActive ? 'bold' : 'normal'};
  }
`;



const MobileFooter = () => {
  const location = useLocation();
  const navigate = useNavigate();


  const authButtons = [
    { 
      icon: <FaHome />, 
      label: 'Inicio', 
      to: '/home', 
      active: location.pathname === '/home' 
    },
    { 
      icon: <FaPlus />, 
      label: 'Subir', 
      to: '/upload', 
      active: location.pathname === '/upload' 
    },
    { 
      icon: <FaHeart />, 
      label: 'Favoritos', 
      to: '/favorites', 
      active: location.pathname === '/favorites' 
    },
    { 
      icon: <FaUser />, 
      label: 'Perfil', 
      to: '/Config', 
      active: location.pathname === '/Config' 
    },
  ];



  return (
    <MobileFooterContainer>
      {authButtons.map((button, index) => (
        <FooterButton
          key={index}
          to={button.to}
          $isActive={button.active}
          onClick={(e) => {
            if (button.to === location.pathname) {
              e.preventDefault(); // Evita recargar si ya está en la misma ruta
            }
          }}
        >
          {button.icon}
          <span>{button.label}</span>
        </FooterButton>
      ))}
      
    </MobileFooterContainer>
  );
};

export default MobileFooter;