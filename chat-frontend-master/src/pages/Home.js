import React from "react";
import Lottie from 'lottie-react';
import { Row, Col, Button } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import { TypeAnimation } from 'react-type-animation';
import "./Home.css";
import chattingAnimation from '../assets/chatting.json';

function Home() {
    return (
        <Row className="home__bg">
            <Col md={6} className="d-flex flex-column align-items-center justify-content-center">
                <div className="text-center home__content">
                    <TypeAnimation
                        sequence={[
                            "自主科學探究與實作平台",
                            3000,
                            "Science Inquiry and Implementation",
                            3000,
                        ]}
                        speed={50}
                        wrapper="h1"
                        cursor={true}
                        repeat={Infinity}
                        className="home__title"
                    />
                    <p className="home__description">這裡聚焦於幫助高中生在科學探究學習。</p>
                    <p className="home__description">特別關注「科學探究能力」和「自我導向學習傾向」。</p>
                    <LinkContainer to="/chat">
                        <Button variant="success" className="home__chat-button">
                            開始聊天吧 <i className="fas fa-comments home-message-icon"></i>
                        </Button>
                    </LinkContainer>
                </div>
            </Col>
            <Col md={6} className="d-flex align-items-center justify-content-center">
                <div className="embed-responsive embed-responsive-16by9 lottie-container">
                    <Lottie animationData={chattingAnimation} />
                </div>
            </Col>
        </Row>
    );
}

export default Home;
