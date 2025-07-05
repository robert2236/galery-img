import React from 'react';
import styled from 'styled-components';
import { Form } from "react-bootstrap";
import { IoIosArrowDown } from "react-icons/io";
import profile from '../images/bird_cockatiel.jpg'

export function Header() {
  return (
    <HeaderContainer className='d-flex justify-content-between align-items-center ps-4 pe-4'>
      <div style={{width: "90%"}}>
      <ThemeFormControl 
        type="text"
        placeholder="Search..."
      />
      </div>
      <div className='d-flex flex-row align-items-center'>
      <div className='profile-icon'>
        <img src={profile} alt="Profile" className='img-profile' />
      </div>
      <IoIosArrowDown className='ms-2' size="20"/>
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
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  margin-left: 80px;
  border-radius: 5px;
`;

const ThemeFormControl = styled(Form.Control)`
  background-color: ${({ theme }) => theme.inputBg || theme.bg} !important;
  color: ${({ theme }) => theme.inputText || theme.text} !important;
  border-color: ${({ theme }) => theme.inputBorder || theme.border} !important;

  &:focus {
    background-color: ${({ theme }) => theme.inputBg || theme.bg} !important;
    color: ${({ theme }) => theme.inputText || theme.text} !important;
    border-color: ${({ theme }) => theme.primary} !important;
    box-shadow: 0 0 0 0.2rem ${({ theme }) => theme.focusShadow || 'rgba(0,123,255,.25)'} !important;
  }

  &::placeholder {
    color: ${({ theme }) => theme.inputPlaceholder || theme.textSecondary} !important;
    opacity: 1;
  }
`;