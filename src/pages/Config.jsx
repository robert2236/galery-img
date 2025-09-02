import React, { useState, useRef, useEffect } from "react";
import { Row, Col, Form, Button } from "react-bootstrap";
import { FaCog } from "react-icons/fa";
import profile from "../images/bird_cockatiel.jpg";
import styled from "styled-components";
import { useForm } from "react-hook-form";
import api from "../Auth/Api";
import { toast } from "react-toastify";

export const Config = () => {
  const [user, setUsers] = useState("");
  const [loading, setLoading] = useState(false);
  

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
    setValue,
  } = useForm();

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

  useEffect(() => {
    if (user) {
      // Precargar todos los campos del formulario
      setValue("name", user.name || "");
      setValue("surname", user.surname || "");
      setValue("info", user.info || "");
      setValue("username", user.username || "");
      setValue("email", user.email || "");
      setValue("web", user.web || "");
    }
  }, [user, setValue]);

  const configuration = (data) => {
    console.log(data);
    try {
      api.put("/api/profile", data);
      toast.success("¡Configuración actualizada forma exitosa!");
    } catch (error) {
      toast.error("Hubo un error al actualizar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="m-4 m-sm-5">
      <div>
        <div className="d-flex  align-items-center mt-5 mb-2">
          <FaCog size={25} className="me-2" />
          <h3 className="mb-0">Configuración</h3>
        </div>
        <p>
          La información proporcionada en este formulario se mostrará
          públicamente en el perfil del usuario.
        </p>
      </div>
      <hr className="mb-5" />

      <Row>
        <Col
          xs={12}
          lg={7}
          className="p-sm-5 p-4 mb-3 d-flex  justify-content-center
           gap-lg-5"
          style={{ borderRadius: "15px", border: "2px solid #808080" }}
        >
          <form onSubmit={handleSubmit(configuration)}>
            <div className="d-flex flex-column mb-3">
              <span>Foto de perfil</span>
              <img
                src={user?.image}
                alt="Profile"
                className="rounded-circle me-2"
                style={{ width: "68px", height: "68px" }}
              />
            </div>
            <Row>
              <Col xs={12} lg={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nombre</Form.Label>
                  <Form.Control {...register("name",  { required: true, maxLength: 20 })} type="text" />
                </Form.Group>
              </Col>
              <Col xs={12} lg={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Apellido</Form.Label>
                  <Form.Control {...register("surname",  { required: true, maxLength: 20 })}  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col xs={12} lg={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Acerca</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    {...register("info", {maxLength: 200 })}
                    type="text"
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col xs={12} className="mb-3">
                <Form.Label>Nombre de usuario</Form.Label>
                <Form.Control type="text" {...register("username",{ required: true, maxLength: 20 })} />
              </Col>
            </Row>
            <Row>
              <Col xs={12} className="mb-3">
                <Form.Label>Correo</Form.Label>
                <Form.Control type="text" {...register("email", { required: true })} />
              </Col>
            </Row>
            <Row>
              <Col xs={12} className="mb-3">
                <Form.Label>Sitio web</Form.Label>
                <Form.Control type="text" {...register("web")} />
              </Col>
            </Row>
            <Button type="submit" className="w-100 mt-3">
              <b>Guardar cambios</b>
            </Button>
          </form>
        </Col>
        <Col xs={12} lg={5}>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Officiis
          doloribus rem possimus odit. Alias voluptatum consequatur magni enim
          quidem deserunt nostrum dolore repellat est tempore, perspiciatis
          natus, dolorum illum asperiores.
        </Col>
      </Row>
    </Container>
  );
};

const Container = styled.div`
  height: auto;
`;
