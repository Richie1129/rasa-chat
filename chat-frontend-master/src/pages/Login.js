import React, { useContext, useState } from "react";
import { Col, Container, Form, Row, Button, Spinner } from "react-bootstrap";
import { useLoginUserMutation } from "../services/appApi";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";
import Lottie from 'lottie-react';
import { AppContext } from "../context/appContext";
import loginAnimation from '../assets/login.json';

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const { socket } = useContext(AppContext);
    const [loginUser, { isLoading, error }] = useLoginUserMutation();

    function handleLogin(e) {
        e.preventDefault();
        // login logic
        loginUser({ email, password }).then(({ data }) => {
            if (data) {
                // socket work
                socket.emit("new-user");
                // navigate to the chat
                navigate("/chat");
            }
        });
    }

    return (
        <Container className="login-container">
            <Row className="align-items-center justify-content-center vh-100">
                <Col md={5} className="d-flex align-items-center justify-content-center">
                    <div className="lottie-container">
                        <Lottie animationData={loginAnimation} style={{ width: '120%', height: '120%',top: '20' }}/>
                    </div>
                </Col>
                <Col md={7} className="d-flex align-items-center justify-content-center flex-column">
                    <h1 className="mb-4">登入</h1>
                    <Form style={{ width: "80%", maxWidth: 500 }} onSubmit={handleLogin}>
                        <Form.Group className="mb-3" controlId="formBasicEmail">
                            {error && <p className="alert alert-danger">{error.data}</p>}
                            <Form.Label>電子郵件</Form.Label>
                            <Form.Control type="email" placeholder="請輸入電子郵件" onChange={(e) => setEmail(e.target.value)} value={email} required />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formBasicPassword">
                            <Form.Label>密碼</Form.Label>
                            <Form.Control type="password" placeholder="請輸入密碼" onChange={(e) => setPassword(e.target.value)} value={password} required />
                        </Form.Group>
                        <Button variant="primary" type="submit" className="w-100">
                            {isLoading ? <Spinner animation="grow" /> : "登入"}
                        </Button>
                        <div className="py-4">
                            <p className="text-center">
                                還沒有帳號 ? <Link to="/signup">註冊</Link>
                            </p>
                        </div>
                    </Form>
                </Col>
            </Row>
        </Container>
    );
}

export default Login;
