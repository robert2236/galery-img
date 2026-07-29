import React from "react";
import styled, { keyframes } from "styled-components";

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${({ $size }) => $size === "sm" ? "20px" : "40px"};
  gap: 12px;
  color: ${({ theme }) => theme.text || "#888"};
  font-size: ${({ $size }) => $size === "sm" ? "0.85rem" : "1rem"};
  min-height: ${({ $inline }) => $inline ? "auto" : "200px"};
`;

const SpinnerCircle = styled.div`
  width: ${({ $size }) => $size === "sm" ? "24px" : $size === "lg" ? "48px" : "36px"};
  height: ${({ $size }) => $size === "sm" ? "24px" : $size === "lg" ? "48px" : "36px"};
  border: ${({ $size }) => $size === "sm" ? "3px" : "4px"} solid ${({ theme }) => theme.bg3 || "#e0e0e0"};
  border-top-color: ${({ theme }) => theme.primary || "#4267B2"};
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
`;

const LoadingSpinner = ({ label, size, inline }) => {
  return (
    <Wrapper $size={size} $inline={inline}>
      <SpinnerCircle $size={size} />
      {label && <span>{label}</span>}
    </Wrapper>
  );
};

export default LoadingSpinner;
