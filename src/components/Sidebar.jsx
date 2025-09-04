import styled from "styled-components";
import logo from "../assets/react.svg";
import { v } from "../styles/Variables";
import {
  AiOutlineHome,
  AiOutlineApartment,
  AiOutlineSetting,
} from "react-icons/ai";
import { MdOutlineAnalytics, MdLogout } from "react-icons/md";
import { NavLink } from "react-router-dom";
import { useContext, useEffect, useState} from "react";
import { ThemeContext } from "../App";
import { useAuth } from "../Auth/Auth";
import { FaCloudUploadAlt } from "react-icons/fa";
import api from "../Auth/Api";

export function Sidebar() {
  const { setTheme, theme } = useContext(ThemeContext);
  const { close } = useAuth();
  const [user, setUser] = useState(null);
  const CambiarTheme = () => {
    setTheme((theme) => (theme === "light" ? "dark" : "light"));
  };

  const handleLogout = () => {
    close();
  };

  const getUsers = async () => {
    try {
      const response = await api.get("/api/users");
      setUser(response.data); 
    } catch (err) {
      toast.error("Error al cargar los datos del usuario");
      throw err;
    }
  };

  useEffect(() => {
    getUsers();
  }, []);

  useEffect(() => {
    user?.theme ? setTheme("dark") : setTheme("light");
  }, [user]);

  const linksArray = [
    {
      label: "Home",
      icon: <AiOutlineHome />,
      to: "/home",
    },
    {
      label: "Upload",
      icon: <FaCloudUploadAlt />,
      to: "/upload",
    },
    {
      label: "Productos",
      icon: <AiOutlineApartment />,
      to: "/productos",
    },
    {
      label: "Diagramas",
      icon: <MdOutlineAnalytics />,
      to: "/diagramas",
    },
    {
      label: "Perfil",
      icon: <MdOutlineAnalytics />,
      to: "/reportes",
    },
  ];

  const secondarylinksArray = [
    {
      label: "Configuración",
      icon: <AiOutlineSetting />,
      to: "/config",
    },
    {
      label: "Salir",
      icon: <MdLogout />,
      onClick: handleLogout,
    },
  ];

  return (
    <Container className="d-none d-sm-inline" themeUse={theme}>
      <SidebarContent>
        <div className="Logocontent">
          <div className="imgcontent">
            <img src={logo} alt="Logo" />
          </div>
        </div>

        {linksArray.map(({ icon, label, to }) => (
          <div className="LinkContainer Themecontent" key={label}>
            <NavLink
              to={to}
              className={({ isActive }) => `Links${isActive ? ` active` : ``}`}
            >
              <div className="Linkicon" data-tooltip={label}>
                {icon}
              </div>
            </NavLink>
          </div>
        ))}

        <Divider />

        {secondarylinksArray.map(({ icon, label, to, onClick }) => (
          <div className="LinkContainer " key={label}>
            {to ? (
              // Elemento con enlace
              <NavLink
                to={to}
                className={({ isActive }) =>
                  `Links${isActive ? ` active` : ``}`
                }
              >
                <div className="Linkicon" data-tooltip={label}>
                  {icon}
                </div>
              </NavLink>
            ) : (
              // Elemento con onClick (como Salir)
              <div
                className="Links"
                onClick={onClick}
                style={{ cursor: "pointer" }}
              >
                <div className="Linkicon" data-tooltip={label}>
                  {icon}
                </div>
              </div>
            )}
          </div>
        ))}

      </SidebarContent>
    </Container>
  );
}

// Estilos actualizados
const Container = styled.div`
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  z-index: 1000;
`;

const SidebarContent = styled.div`
  color: ${(props) => props.theme.text};
  background: ${(props) => props.theme.bg};
  width: 90px;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 20px;
  overflow-y: auto;

  /* Estilo de scroll personalizado */
  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: ${(props) => props.theme.bg3};
    border-radius: 4px;
  }

  .Logocontent {
    display: flex;
    justify-content: center;
    align-items: center;
    padding-bottom: ${v.lgSpacing};
    width: 100%;

    .imgcontent {
      display: flex;
      justify-content: center;
      width: 100%;

      img {
        width: 40px;
        height: 40px;
        cursor: pointer;
      }
    }
  }

  .LinkContainer {
    margin: 8px 0;
    width: 100%;

    &:hover {
      background: ${(props) => props.theme.bg3};
    }

    .Links {
      display: flex;
      justify-content: center;
      align-items: center;
      text-decoration: none;
      color: ${(props) => props.theme.text};
      height: 50px;
      width: 100%;

      .Linkicon {
        position: relative;
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;

        svg {
          font-size: 24px;
        }

        &[data-tooltip] {
          position: relative;

          &:hover::after {
            content: attr(data-tooltip);
            position: absolute;
            left: 100%;
            top: 50%;
            transform: translateY(-50%);
            background: ${(props) => props.theme.bg3};
            color: ${(props) => props.theme.text};
            padding: 6px 12px;
            border-radius: 4px;
            white-space: nowrap;
            z-index: 100;
            margin-left: 10px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
            font-size: 14px;
            animation: fadeIn 0.2s ease-in-out;
          }
        }
      }

      &.active {
        .Linkicon {
          svg {
            color: ${(props) => props.theme.bg4};
          }
        }
      }
    }
  }

  .Themecontent {
    width: 100%;
    display: flex;
    justify-content: center;
    margin-bottom: 20px;

    .Togglecontent {
      position: relative;
      cursor: pointer;

      &[data-tooltip]:hover::after {
        content: attr(data-tooltip);
        position: absolute;
        left: 100%;
        top: 50%;
        transform: translateY(-50%);
        background: ${(props) => props.theme.bg3};
        color: ${(props) => props.theme.text};
        padding: 6px 12px;
        border-radius: 4px;
        white-space: nowrap;
        z-index: 100;
        margin-left: 10px;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
        font-size: 14px;
        animation: fadeIn 0.2s ease-in-out;
      }

      .theme-container {
        .demo {
          .switch {
            position: relative;
            display: inline-block;
            width: 60px;
            height: 34px;

            .theme-swither {
              opacity: 0;
              width: 0;
              height: 0;

              &:checked + .slider:before {
                left: 4px;
                content: "🌑";
                transform: translateX(26px);
              }
            }

            .slider {
              position: absolute;
              cursor: pointer;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: ${({ themeUse }) =>
                themeUse === "light" ? v.lightcheckbox : v.checkbox};
              transition: 0.4s;

              &::before {
                position: absolute;
                content: "☀️";
                height: 0px;
                width: 0px;
                left: -10px;
                top: 16px;
                line-height: 0px;
                transition: 0.4s;
              }

              &.round {
                border-radius: 34px;

                &::before {
                  border-radius: 50%;
                }
              }
            }
          }
        }
      }
    }
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-5px) translateX(0);
    }
    to {
      opacity: 1;
      transform: translateY(-50%) translateX(0);
    }
  }
`;

const Divider = styled.div`
  height: 1px;
  width: 80%;
  background: ${(props) => props.theme.bg3};
  margin: ${v.lgSpacing} 0;
`;
