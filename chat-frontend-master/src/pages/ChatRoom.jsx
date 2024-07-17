// ChatRoom.jsx
import React, { useState, useContext, useEffect } from 'react';
import { useSelector } from "react-redux";
import { FaUser } from 'react-icons/fa';
import { AppContext } from "../context/appContext";
import Swal from 'sweetalert2';
import './ChatRoom.css';
import DialogBox from '../components/DialogBox';
import Lottie from 'react-lottie';
import LoadingAnimation from '../assets/Loading_dot.json';
// import { useNavigate } from 'react-router-dom';

const ChatRoom = () => {
    // const welcomeMessage = "嗨！我是你的科學探究小幫手。我會用適合高中生的語言，保持專業的同時，幫助你探索自然科學的奧秘，讓我們來探索科學的奧妙吧！";
    const welcomeMessage = "";
    const [messages, setMessages] = useState(() => {
        const savedMessages = localStorage.getItem('chatMessages');
        return savedMessages ? JSON.parse(savedMessages) : [{
            text: welcomeMessage,
            type: 'response',
            time: new Date().toLocaleTimeString(),
            date: new Date().toLocaleDateString()
        }];
    });
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { socket } = useContext(AppContext);
    const user = useSelector((state) => state.user);
    const [selectedOption, setSelectedOption] = useState('option1'); // 初始選項為"科學知識解答"
    const [optionMessages, setOptionMessages] = useState({
        option1: [],
        option2: [],
        option3: []
    });
    // const navigate = useNavigate();

    useEffect(() => {
        if (messages.length === 0) {
            setMessages([{
                text: welcomeMessage,
                type: 'response',
                time: new Date().toLocaleTimeString(),
                date: new Date().toLocaleDateString()
            }]);
        }
        localStorage.setItem('chatMessages', JSON.stringify(messages));
    }, [messages]);

    useEffect(() => {
        localStorage.setItem('chatMessages', JSON.stringify(messages));
    }, [messages]);

    useEffect(() => {
        const savedOptionMessages = localStorage.getItem('optionMessages');
        if (savedOptionMessages) {
            setOptionMessages(JSON.parse(savedOptionMessages));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('optionMessages', JSON.stringify(optionMessages));
    }, [optionMessages]);

    const handleSendMessage = async () => {
        console.log("handleSendMessage 被調用");
        console.log("選擇的選項:", selectedOption);
        if (inputMessage.trim() !== '') {
            setIsLoading(true);
    
            const MessageData = {
                role: 'user',
                content: inputMessage,
                time: new Date().toLocaleTimeString(),
                date: new Date().toLocaleDateString(),
                from: user,
                optionText: selectedOption
            };
            socket.emit('chat-message', MessageData);
            const newMessage = { text: inputMessage, type: 'user', time: MessageData.time, date: MessageData.date };
            setMessages(messages => [...messages, newMessage]);
            setOptionMessages(prevState => {
                const updatedState = {
                    ...prevState,
                    [selectedOption]: [...prevState[selectedOption], newMessage]
                };
                console.log(`新增到 ${selectedOption} 的訊息:`, newMessage);
                console.log(`option1 的所有訊息:`, updatedState.option1);
                console.log(`option2 的所有訊息:`, updatedState.option2);
                console.log(`option3 的所有訊息:`, updatedState.option3);
                return updatedState;
            });
            setInputMessage('');
    
            // 檢查是否包含"請給我一個研究問題"
            if (inputMessage.includes('請給我一個研究問題')) {
                const url = "http://ml.hsueh.tw:7878/generate-Research_Question/";
                const unwantedMessages = [
                    "不好意思，我沒有理解你的意思。你能說得更具體一點嗎。",
                    "嗨！我是你的科學探究小幫手，專門幫助高中生解答各種科學名詞和相關概念。我會用簡單易懂的方式解釋複雜的科學知識，幫助你在自然科學的學習中取得進步！",
                    "嗨！我是你的科學探究小幫手，在這裡，我們會通過提出引導性問題來幫助你深入思考。這些問題將引導你探索不同的思維角度，發現問題的核心，並啟發你的創意思維。準備好接受挑戰，讓我們一起通過問題來啟發你的科學探究之旅吧！",
                    "嗨！我是你的科學探究小幫手，如果你有任何科學名詞或概念不清楚，或者對某個現象感到好奇，我都可以幫你解答。同時，我們也會通過引導性問題來幫助你深入思考和探索，讓你更好地理解和應用這些知識。讓我們一起踏上這趟科學探究之旅，發現和解決問題吧！"
                ];
                const filteredMessages = optionMessages[selectedOption].filter(msg => !unwantedMessages.includes(msg.text)).map(msg => msg.text).join(' ');
                console.log(`過濾掉的文字:`, filteredMessages);
    
                const data = {
                    prompt: filteredMessages // 過濾掉不需要的訊息後合併為一個字串
                };
                const headers = { 'accept': 'application/json', 'Content-Type': 'application/json' };
    
                try {
                    const response = await fetch(url, {
                        method: 'POST',
                        headers: headers,
                        body: JSON.stringify(data)
                    });
    
                    const responseData = await response.json();
                    const newResponse = { text: responseData.response, type: 'response' };
                    setMessages(currentMessages => [...currentMessages, newResponse]);
                    console.log(response);
                    console.log(responseData);
                    setOptionMessages(prevState => {
                        const updatedState = {
                            ...prevState,
                            [selectedOption]: [...prevState[selectedOption], newResponse]
                        };
                        console.log(`新增到 ${selectedOption} 的訊息:`, newResponse);
                        console.log(`option1 的所有訊息:`, updatedState.option1);
                        console.log(`option2 的所有訊息:`, updatedState.option2);
                        console.log(`option3 的所有訊息:`, updatedState.option3);
                        return updatedState;
                    });
                } catch (error) {
                    console.error('API 請求失敗', error);
                } finally {
                    setIsLoading(false);
                }
                return; // 結束函數，避免執行其他 API 呼叫
            }
    
            async function fetchElasticSearchResults(keyword) {
                try {
                    const response = await fetch('http://ml.hsueh.tw:7822/search/', {
                        method: 'POST',
                        headers: {
                            'accept': 'application/json',
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ query: keyword })
                    });
    
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
    
                    const data = await response.json();
                    return data;
                } catch (error) {
                    console.error('Error fetching search results:', error);
                    return [];
                }
            }
    
            if (inputMessage.includes('查詢相關作品：')) {
                const keyword = inputMessage.split('查詢相關作品：')[1];
                const searchResults = await fetchElasticSearchResults(keyword);
    
                if (Array.isArray(searchResults)) {
                    searchResults.forEach(result => {
                        const resultText = `
                            <div>
                                <p><strong>科目:</strong> ${result.科目}</p>
                                <p><strong>名稱:</strong> ${result.名稱}</p>
                                <p><strong>關鍵字:</strong> ${result.關鍵字}</p>
                                <p><strong>摘要:</strong> ${result.摘要}</p>
                                <p><strong>連結:</strong> <a href="${result.連結}" target="_blank">${result.連結}</a></p>
                            </div>
                        `;
                        const newResponse = { text: resultText, type: 'response', isHTML: true };
                        setMessages(currentMessages => [...currentMessages, newResponse]);
                        setOptionMessages(prevState => {
                            const updatedState = {
                                ...prevState,
                                [selectedOption]: [...prevState[selectedOption], newResponse]
                            };
                            console.log(`新增到 ${selectedOption} 的訊息:`, newResponse);
                            console.log(`option1 的所有訊息:`, updatedState.option1);
                            console.log(`option2 的所有訊息:`, updatedState.option2);
                            console.log(`option3 的所有訊息:`, updatedState.option3);
                            return updatedState;
                        });
    
                        const resultText_clean = resultText.replace(/<[^>]*>?/gm, '');
                        const responseMessageData = {
                            role: 'assistant',
                            content: resultText_clean,
                            time: new Date().toLocaleTimeString(),
                            date: new Date().toLocaleDateString(),
                            from: user
                        };
                        socket.emit('chat-message', responseMessageData);
                    });
                } else {
                    console.error('返回的數據不是陣列');
                }
                setIsLoading(false);
                return;
            }
    
            async function fetchGenerateAnswer(inputMessage) {
                const url = "http://ml.hsueh.tw:8787/generate-answer/";
                const data = { "query": inputMessage };
                const headers = { 'accept': 'application/json', 'Content-Type': 'application/json' };
    
                try {
                    const response = await fetch(url, {
                        method: 'POST',
                        headers: headers,
                        body: JSON.stringify(data)
                    });
    
                    const responseData = await response.json();
                    return responseData['answer'];
                } catch (error) {
                    console.error('API 請求失敗', error);
                    return null;
                }
            }
    
            async function fetchFollowUp(inputMessage) {
                const url = "http://ml.hsueh.tw:8787/generate-followup/";
                const data = { "query": inputMessage };
                const headers = { 'accept': 'application/json', 'Content-Type': 'application/json' };
    
                try {
                    const response = await fetch(url, {
                        method: 'POST',
                        headers: headers,
                        body: JSON.stringify(data)
                    });
    
                    const responseData = await response.json();
                    return responseData['follow_up'];
                } catch (error) {
                    console.error('API 請求失敗', error);
                    return null;
                }
            }
    
            async function fetchGenerateText(inputMessage) {
                const url = "http://ml.hsueh.tw:8787/generate-text/";
                const data = { "query": inputMessage };
                const headers = { 'accept': 'application/json', 'Content-Type': 'application/json' };
    
                try {
                    const response = await fetch(url, {
                        method: 'POST',
                        headers: headers,
                        body: JSON.stringify(data)
                    });
    
                    const responseData = await response.json();
                    return responseData['response'];
                } catch (error) {
                    console.error('API 請求失敗', error);
                    return null;
                }
            }
            // 科學知識解答
            if (selectedOption === 'option1') {
                const apiResponse = await fetchGenerateAnswer(inputMessage);
                const messageData = {
                    role: 'assistant',
                    content: apiResponse ? apiResponse : '不好意思，我沒有理解你的意思。你能說得更具體一點嗎。',
                    time: new Date().toLocaleTimeString(),
                    date: new Date().toLocaleDateString(),
                    from: user,
                    optionText: selectedOption
                };
    
                const newResponse = { text: messageData.content, type: 'response' };
                setMessages(currentMessages => [...currentMessages, newResponse]);
                setOptionMessages(prevState => {
                    const updatedState = {
                        ...prevState,
                        [selectedOption]: [...prevState[selectedOption], newResponse]
                    };
                    console.log(`新增到 ${selectedOption} 的訊息:`, newResponse);
                    console.log(`option1 的所有訊息:`, updatedState.option1);
                    console.log(`option2 的所有訊息:`, updatedState.option2);
                    console.log(`option3 的所有訊息:`, updatedState.option3);
                    return updatedState;
                });
    
                socket.emit('chat-message', messageData);
            } 
            // 探究主題
            else if (selectedOption === 'option3') {
                const apiResponse = await fetchGenerateText(inputMessage);
                const messageData = {
                    role: 'assistant',
                    content: apiResponse ? apiResponse : '不好意思，我沒有理解你的意思。你能說得更具體一點嗎。',
                    time: new Date().toLocaleTimeString(),
                    date: new Date().toLocaleDateString(),
                    from: user,
                    optionText: selectedOption
                };
                console.log(apiResponse)
                console.log(messageData)
    
                const newResponse = { text: messageData.content, type: 'response' };
                setMessages(currentMessages => [...currentMessages, newResponse]);
                setOptionMessages(prevState => {
                    const updatedState = {
                        ...prevState,
                        [selectedOption]: [...prevState[selectedOption], newResponse]
                    };
                    console.log(`新增到 ${selectedOption} 的訊息:`, newResponse);
                    console.log(`option1 的所有訊息:`, updatedState.option1);
                    console.log(`option2 的所有訊息:`, updatedState.option2);
                    console.log(`option3 的所有訊息:`, updatedState.option3);
                    return updatedState;
                });
    
                socket.emit('chat-message', messageData);
            } 
            // 引導問題
            else if (selectedOption === 'option2') {
                const apiResponse = await fetchFollowUp(inputMessage);
                const messageData = {
                    role: 'assistant',
                    content: apiResponse ? apiResponse : '不好意思，我沒有理解你的意思。你能說得更具體一點嗎。',
                    time: new Date().toLocaleTimeString(),
                    date: new Date().toLocaleDateString(),
                    from: user,
                    optionText: selectedOption
                };
    
                const newResponse = { text: messageData.content, type: 'response' };
                setMessages(currentMessages => [...currentMessages, newResponse]);
                setOptionMessages(prevState => {
                    const updatedState = {
                        ...prevState,
                        [selectedOption]: [...prevState[selectedOption], newResponse]
                    };
                    console.log(`新增到 ${selectedOption} 的訊息:`, newResponse);
                    console.log(`option1 的所有訊息:`, updatedState.option1);
                    console.log(`option2 的所有訊息:`, updatedState.option2);
                    console.log(`option3 的所有訊息:`, updatedState.option3);
                    return updatedState;
                });
    
                socket.emit('chat-message', messageData);
            }
    
            setIsLoading(false);
        }
    };

    const handleInputKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    };

    const handleClearHistory = () => {
        console.log("清除歷史紀錄");
        localStorage.removeItem('chatMessages');
        localStorage.removeItem('optionMessages');
        setMessages([]);
        setOptionMessages({
            option1: [],
            option2: [],
            option3: []
        });
    };

    const loadingOptions = {
        loop: true,
        autoplay: true,
        animationData: LoadingAnimation,
        rendererSettings: {
            preserveAspectRatio: 'none'
        }
    };

    const handleOptionSelect = (option) => {
        console.log("選擇的選項:", option);
        let optionText = "";
        let welcomeMessage = "";
        switch (option) {
            case "option1":
                optionText = "科學知識解答";
                Swal.fire({
                    title: "科學知識解答",
                    text: "你有什麼想了解的科學名詞或概念都可以問我喔！",
                    icon: "info"
                });
                welcomeMessage = "嗨！我是你的科學探究小幫手，專門幫助高中生解答各種科學名詞和相關概念。我會用簡單易懂的方式解釋複雜的科學知識，幫助你在自然科學的學習中取得進步！無論是物理、化學、生物還是地球科學的問題，我都會盡力為你提供詳細且易於理解的解答。隨時提出你的疑問，讓我們一起探索科學的奧秘吧！";
                break;
            case "option2":
                optionText = "引導問題";
                Swal.fire({
                    title: "引導問題",
                    text: "通過引導問題來啟發你的思考",
                    icon: "info"
                });
                welcomeMessage = "嗨！我是你的科學探究小幫手，在這裡，我們會通過提出引導性問題來幫助你深入思考。這些問題將引導你探索不同的思維角度，發現問題的核心，並啟發你的創意思維。準備好接受挑戰，讓我們一起通過問題來啟發你的科學探究之旅吧！無論是探討科學現象還是解決實際問題，這些引導問題將助你一步步走向更深的理解。";
                break;
            case "option3":
                optionText = "探究主題";
                Swal.fire({
                    title: "探究主題",
                    text: "探索科學世界，解答你的疑問！",
                    icon: "info"
                });
                welcomeMessage = "嗨！我是你的科學探究小幫手，如果你有任何科學名詞或概念不清楚，或者對某個現象感到好奇，我都可以幫你解答。同時，我們也會通過引導性問題來幫助你深入思考和探索，讓你更好地理解和應用這些知識。讓我們一起踏上這趟科學探究之旅，發現和解決問題吧！我們將一起探討從日常生活現象到複雜科學理論的各種問題，讓你的學習之路更加有趣且充實。";
                break;
            default:
                optionText = "";
        }
        console.log("設定的選項文字:", optionText);
        setSelectedOption(option);
        setMessages(optionMessages[option]); // 切換到相應選項的對話內容
        if (welcomeMessage) {
            setMessages(currentMessages => [...currentMessages, { text: welcomeMessage, type: 'response', time: new Date().toLocaleTimeString(), date: new Date().toLocaleDateString() }]);
            setOptionMessages(prevState => {
                const updatedState = {
                    ...prevState,
                    [option]: [...prevState[option], { text: welcomeMessage, type: 'response', time: new Date().toLocaleTimeString(), date: new Date().toLocaleDateString() }]
                };
                console.log(`新增到 ${option} 的訊息:`, { text: welcomeMessage, type: 'response', time: new Date().toLocaleTimeString(), date: new Date().toLocaleDateString() });
                console.log(`option1 的所有訊息:`, updatedState.option1);
                console.log(`option2 的所有訊息:`, updatedState.option2);
                console.log(`option3 的所有訊息:`, updatedState.option3);
                return updatedState;
            });
        }
    };

    return (
        <div className="chat-room">
            <div className="left-panel">
                <div className="chatroom-intro">
                    <h1>科學探究與實作學習平台</h1>
                    <h5>按鈕介紹</h5>
                    <p>以下三個按鈕，幫助你在學習過程中獲得不同的支持：</p>
                    <p><strong>1. 科學知識解答：</strong>如果你對某個科學名詞或概念感到困惑，請點擊「科學知識解答」按鈕。我會用簡單易懂的方式幫你解答各種科學問題，幫助你更好地理解相關知識。</p>
                    <p><strong>2. 引導問題：</strong>如果你希望通過思考來探索問題，請點擊「引導問題」按鈕。我們會提出引導性問題，幫助你從不同的角度思考，激發你的創意思維和探究精神。</p>
                    <p><strong>3. 探究主題：</strong>如果你有任何科學名詞或概念不清楚，或者對某個現象感到好奇，請點擊「探究主題」按鈕。我會幫助你解答疑問，並通過引導性問題來啟發你的思考和探索，讓你更好地理解和應用這些知識。讓我們一起踏上這趟科學探究之旅，發現和解決問題吧！</p>
                </div>
                <div>
                    <DialogBox onScaffoldClick={setInputMessage} />
                </div>
            </div>
            <div className="right-panel">
                <div className="messages">
                    {messages.map((message, index) => (
                        <div key={index} className={`message ${message.type === 'user' ? 'user-message' : 'response-message'}`}>
                            {message.type === 'user' && <FaUser className="user-icon" />}
                            <div className="message-content">
                                {message.isHTML ? (
                                    <div dangerouslySetInnerHTML={{ __html: message.text }}></div>
                                ) : message.link ? (
                                    <>
                                        <div>{message.text.split('\n')[0]}</div>
                                        <a href={message.link} target="_blank" rel="noopener noreferrer">{message.link}</a>
                                        <div>{message.text.split('\n').slice(2).join('\n')}</div>
                                    </>
                                ) : (
                                    <div>{message.text}</div>
                                )}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="message response-message loading-container">
                            <Lottie options={loadingOptions} height={30} width={40} />
                        </div>
                    )}
                </div>
                <div className="buttons-container">
                    <button className="option-button" onClick={() => handleOptionSelect("option1")}>科學知識解答</button>
                    <button className="option-button" onClick={() => handleOptionSelect("option2")}>引導問題</button>
                    <button className="option-button" onClick={() => handleOptionSelect("option3")}>探究主題</button>
                </div>
                <div className="message-input">
                    <FaUser className="user-icon" />
                    <input
                        type="text"
                        value={inputMessage}
                        placeholder='請輸入訊息...'
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyDown={handleInputKeyPress}
                    />
                    <button onClick={handleSendMessage}>發送</button>
                    <button onClick={handleClearHistory}>清除歷史紀錄</button>
                </div>
            </div>
        </div>
    );
};

export default ChatRoom;
