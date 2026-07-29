import React, { useContext, useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { Form, Button } from "react-bootstrap";
import { IoIosArrowDown, IoMdCheckmarkCircle } from "react-icons/io";
import { FaBell, FaTimes } from "react-icons/fa";
import profile from "../images/bird_cockatiel.jpg";
import NavDropdown from "react-bootstrap/NavDropdown";
import api from "../Auth/Api";
import { toast } from "react-toastify";
import { useAuth } from "../Auth/Auth";
import { useSearch, ThemeContext } from "../App";
import { MdOutlineSearch } from "react-icons/md";

export function Header() {
  const { setTheme, theme } = useContext(ThemeContext);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [user, setUsers] = useState("");
  const { setSearch } = useSearch();
  const [darkMode, setDarkMode] = useState(false);
  const { close } = useAuth();
  const mobileInputRef = useRef(null);

  const handleLogout = () => close();

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    changeTheme();
  };

  const getUsers = async () => {
    const response = await api.get("/api/users");
    setUsers(response.data);
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
    }
  };

  useEffect(() => {
    if (showMobileSearch && mobileInputRef.current) {
      mobileInputRef.current.focus();
    }
  }, [showMobileSearch]);

  const isDark = theme === "dark";
  const headerBg = isDark ? "rgba(15,15,15,0.85)" : "rgba(255,255,255,0.85)";
  const borderColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";

  return (
    <HeaderWrapper
      className="navbar border-bottom fixed-top"
      style={{
        backdropFilter: "blur(10px)",
        zIndex: 100,
        marginLeft: "60px",
        backgroundColor: headerBg,
        borderColor: borderColor,
      }}
    >
      {/* DESKTOP SEARCH BAR */}
      <DesktopRow className="d-none d-md-flex justify-content-between align-items-center w-100 px-3">
          <div className="d-flex align-items-center">
            <img src="/horizontal_logo.png" alt="Logo" style={{ height: '40px', width: 'auto', maxWidth: '260px', objectFit: 'contain' }} />
          </div>

        <div className="d-flex align-items-center flex-grow-1 justify-content-center mx-4" style={{ maxWidth: "500px" }}>
          <div className="position-relative w-100">
            <SearchIcon isDark={isDark}>
              <MdOutlineSearch />
            </SearchIcon>
            <StyledInput
              isDark={isDark}
              type="text"
              placeholder="Buscar..."
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-pill"
              style={{ paddingLeft: "2.5rem", height: "40px" }}
            />
          </div>
        </div>

        <div className="d-flex align-items-center gap-2">
          <IconBtn isDark={isDark}>
            <FaBell style={{ fontSize: "1.2rem", cursor: "pointer" }} />
          </IconBtn>
          <NavDropdown
            title={
              <div className="d-flex align-items-center gap-1">
                <img
                  src={profile}
                  alt="Profile"
                  className="rounded-circle"
                  style={{ width: "34px", height: "34px", objectFit: "cover" }}
                />
                <IconBtn isDark={isDark}>
                  <IoIosArrowDown />
                </IconBtn>
              </div>
            }
            align="end"
            menuVariant={isDark ? "dark" : "light"}
          >
            <NavDropdown.Item href="/Config">
              <div className="d-flex align-items-center gap-3">
                <img
                  src={profile}
                  alt="Profile"
                  className="rounded-circle"
                  style={{ width: "68px", height: "68px", objectFit: "cover" }}
                />
                <div className="d-flex flex-column">
                  <span className="fw-semibold">Personal</span>
                  <span className="text-muted small">{user?.username}</span>
                  <span className="text-muted small">{user?.email}</span>
                </div>
                <IoMdCheckmarkCircle size={20} color="#9fef00" />
              </div>
              <hr />
            </NavDropdown.Item>
            <NavDropdown.Item href="/config">Configuraci&oacute;n</NavDropdown.Item>
            <NavDropdown.Item onClick={toggleDarkMode} className="d-flex align-items-center justify-content-between">
              Cambiar tema
              <Button variant={darkMode ? "dark" : "light"} size="sm">
                {darkMode ? "\u{1F319}" : "\u{2600}\u{FE0F}"}
              </Button>
            </NavDropdown.Item>
            <hr />
            <NavDropdown.Item onClick={handleLogout}>Cerrar sesi&oacute;n</NavDropdown.Item>
          </NavDropdown>
        </div>
      </DesktopRow>

      {/* MOBILE SEARCH BAR */}
      <MobileRow className="d-flex d-md-none justify-content-between align-items-center w-100 px-2">
        {!showMobileSearch ? (
          <>
            <div className="d-flex align-items-center" style={{ minWidth: 0 }}>
              <img src="/horizontal_logo.png" alt="Logo" style={{ width: '100%', height: 'auto', maxWidth: '160px', objectFit: 'contain', flexShrink: 0 }} />
            </div>
            <div className="d-flex align-items-center gap-2">
              <IconBtn isDark={isDark}>
                <MdOutlineSearch
                  style={{ fontSize: "1.4rem", cursor: "pointer" }}
                  onClick={() => setShowMobileSearch(true)}
                />
              </IconBtn>
              <IconBtn isDark={isDark}>
                <FaBell style={{ fontSize: "1.15rem", cursor: "pointer" }} />
              </IconBtn>
              <NavDropdown
                title={
                  <img
                    src={profile}
                    alt="Profile"
                    className="rounded-circle"
                    style={{ width: "30px", height: "30px", objectFit: "cover" }}
                  />
                }
                align="end"
                menuVariant={isDark ? "dark" : "light"}
              >
                <NavDropdown.Item href="/Config">
                  <div className="d-flex align-items-center gap-3">
                    <img
                      src={profile}
                      alt="Profile"
                      className="rounded-circle"
                      style={{ width: "68px", height: "68px", objectFit: "cover" }}
                    />
                    <div className="d-flex flex-column">
                      <span className="fw-semibold">Personal</span>
                      <span className="text-muted small">{user?.username}</span>
                      <span className="text-muted small">{user?.email}</span>
                    </div>
                    <IoMdCheckmarkCircle size={20} color="#9fef00" />
                  </div>
                  <hr />
                </NavDropdown.Item>
                <NavDropdown.Item href="/config">Configuraci&oacute;n</NavDropdown.Item>
                <NavDropdown.Item onClick={toggleDarkMode} className="d-flex align-items-center justify-content-between">
                  Cambiar tema
                  <Button variant={darkMode ? "dark" : "light"} size="sm">
                    {darkMode ? "\u{1F319}" : "\u{2600}\u{FE0F}"}
                  </Button>
                </NavDropdown.Item>
                <hr />
                <NavDropdown.Item onClick={handleLogout}>Cerrar sesi&oacute;n</NavDropdown.Item>
              </NavDropdown>
            </div>
          </>
        ) : (
          <div className="d-flex align-items-center w-100 gap-2">
            <div className="position-relative flex-grow-1">
              <SearchIcon isDark={isDark}>
                <MdOutlineSearch />
              </SearchIcon>
              <StyledInput
                ref={mobileInputRef}
                isDark={isDark}
                type="text"
                placeholder="Buscar..."
                onChange={(e) => setSearch(e.target.value)}
                className="rounded-pill"
                style={{ paddingLeft: "2.3rem", height: "36px", width: "100%" }}
              />
            </div>
            <IconBtn isDark={isDark}>
              <FaTimes
                style={{ fontSize: "1.15rem", cursor: "pointer" }}
                onClick={() => {
                  setShowMobileSearch(false);
                  setSearch("");
                }}
              />
            </IconBtn>
          </div>
        )}
      </MobileRow>
    </HeaderWrapper>
  );
}

const HeaderWrapper = styled.nav`
  backdrop-filter: blur(10px);
  padding-top: 0.5rem !important;
  padding-bottom: 0.5rem !important;
  min-height: 56px;

  @media (max-width: 576px) {
    margin-left: 0 !important;
  }
`;

const DesktopRow = styled.div``;

const MobileRow = styled.div``;

const TitleSpan = styled.span`
  font-weight: bold;
  color: ${({ isDark }) => (isDark ? "#fff" : "#202020")};
`;

const IconBtn = styled.span`
  color: ${({ isDark }) => (isDark ? "#aaa" : "#555")};
  transition: color 0.2s;
  display: inline-flex;
  align-items: center;
  &:hover {
    color: ${({ isDark }) => (isDark ? "#fff" : "#000")};
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 5;
  color: ${({ isDark }) => (isDark ? "#888" : "#777")};
  font-size: 1.1rem;
  pointer-events: none;
`;

const StyledInput = styled(Form.Control)`
  background-color: ${({ isDark }) => (isDark ? "rgb(40,40,40)" : "rgb(245,245,245)")} !important;
  color: ${({ isDark }) => (isDark ? "#e0e0e0" : "#202020")} !important;
  border: 1px solid ${({ isDark }) => (isDark ? "rgb(60,60,60)" : "rgb(220,220,220)")} !important;
  &:focus {
    background-color: ${({ isDark }) => (isDark ? "rgb(40,40,40)" : "#fff")} !important;
    color: ${({ isDark }) => (isDark ? "#e0e0e0" : "#202020")} !important;
    border-color: ${({ isDark }) => (isDark ? "#555" : "#7250FF")} !important;
    box-shadow: 0 0 0 0.2rem ${({ isDark }) => (isDark ? "rgba(255,255,255,.1)" : "rgba(114,80,255,.25)")} !important;
  }
  &::placeholder {
    color: ${({ isDark }) => (isDark ? "#888" : "#999")} !important;
    opacity: 1;
  }
  transition: none;
`;
