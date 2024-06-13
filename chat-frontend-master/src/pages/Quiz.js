import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Quiz.css'; 
import { CSSTransition } from 'react-transition-group';

const Quiz = ({ onRecommendations, onQuizEnd }) => {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [recommendedTopics, setRecommendedTopics] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate(); // 使用 useNavigate hook

  const questions = [
    "你是否對動物在不同環境中的行為模式感興趣，例如寵物狗的行為和野生狼的行為有何不同？", // 生物 - 生物多樣性
    "當你想到宇宙和天體時，你會感到興奮嗎，例如夜空中的星座和月球的運行？", // 物理 - 宇宙與天體
    "環境保護的議題會讓你想要進一步研究嗎，例如如何減少塑料污染？", // 化學 - 環境汙染與防治
    "你是否喜歡在實驗室中進行化學實驗，觀察化學反應的過程，例如製作自製肥皂？", // 化學 - 科學在生活中的應用
    "電磁現象，如電磁波和磁場，是否讓你感到好奇，例如無線充電是如何工作的？", // 物理 - 電磁現象
    "你是否對研究不同生物物種的多樣性及其生態系統感興趣，例如雨林中的生物多樣性？", // 生物 - 生物多樣性
    "你對於如何預防和應對天然災害有強烈的興趣嗎，例如地震和颱風的預警系統？", // 地科 - 天然災害與防治-地科
    "能量的形式與轉換，特別是在物理學中的應用，是否吸引你，例如太陽能電池如何將光能轉化為電能？", // 物理 - 能量的形式與轉換
    "你是否對地球的內部結構以及它如何影響地表活動感到好奇，例如火山噴發的原因？", // 地科 - 組成地球的物質
    "遺傳學和基因改造技術是否是你感興趣的研究領域，例如基因編輯技術在醫學中的應用？", // 生物 - 基因改造
    "你是否對物理中的力學和運動定律有濃厚的興趣，例如汽車碰撞時的力量分析？", // 物理 - 力與運動
    "氣候變遷及其對地球生態系統的影響，是否引起你的關注，例如全球變暖對海平面上升的影響？", // 地科 - 氣候變遷之影響與調適
    "你是否對酸鹼反應及其在化學中的應用感到興奮，例如檸檬汁和小蘇打混合時的反應？", // 化學 - 酸鹼反應
    "水溶液中的化學變化，如溶解度和反應速率，是否讓你想要深入了解，例如鹽在水中的溶解速度？", // 化學 - 水溶液中的變化
    "生物演化的過程及其證據，是否是你想要探索的主題，例如恐龍如何演化成現代鳥類？", // 生物 - 演化
    "你是否對研究萬有引力和天體運動的規律有興趣，例如衛星如何繞地球運行？", // 物理 - 萬有引力
    "化學中的氧化還原反應及其在工業中的應用，是否讓你感到好奇，例如電池中的化學反應？", // 化學 - 氧化與還原反應
    "光和波動現象，如折射和干涉，是否是你感興趣的研究領域，例如彩虹的形成原理？", // 物理 - 波動、光及聲音
    "晝夜和季節變化的成因及其對地球環境的影響，是否讓你想要了解更多，例如為什麼夏天的白天比冬天長？", // 地科 - 晝夜與季節
    "你是否對科學技術在日常生活中的應用有濃厚的興趣，例如微波爐是如何加熱食物的？", // 物理 - 物理在生活中的應用-科學、技術及社會的互動關係
    "你是否對自然災害的化學預防措施感興趣，例如如何減少火災風險？", // 化學 - 天然災害與防治-化學
    "溫度與熱量的變化是否讓你感到好奇，例如冷卻和加熱的過程？", // 物理 - 溫度與熱量
    "你是否對研究能源的開發與利用感興趣，例如風能和水能的應用？", // 化學 - 能源的開發與利用
    "你是否對天氣與氣候變化的研究有興趣，例如颱風的形成和預測？", // 地科 - 天氣與氣候變化
    "你是否對永續發展與資源利用的議題感興趣，例如可再生能源的利用？", // 地科 - 永續發展與資源的利用
    "你是否對生物的生殖與遺傳過程感興趣，例如基因如何影響生物的性狀？", // 生物 - 生殖與遺傳
    "你是否對量子現象及其應用感興趣，例如量子計算和量子通信？", // 物理 - 量子現象
    "你是否對研究地震的預測和防災措施感興趣，例如地震波的傳播？", // 地科 - 天然災害與防治-地科
    "你是否對地球資源的利用與保護有興趣，例如礦物資源的開採和再生？" // 地科 - 永續發展與資源的利用
  ];

  const topics = {
    '化學': [
      "化學-能量的形式與轉換", "物質的分離與鑑定", "物質的結構與功能",
      "組成地球的物質", "水溶液中的變化", "氧化與還原反應", "酸鹼反應",
      "科學在生活中的應用", "天然災害與防治-化學", "環境汙染與防治",
      "能源的開發與利用"
    ],
    '物理': [
      "物理-能量的形式與轉換", "溫度與熱量", "力與運動", "宇宙與天體",
      "萬有引力", "波動、光及聲音", "電磁現象", "量子現象",
      "物理在生活中的應用-科學、技術及社會的互動關係"
    ],
    '生物': [
      "生殖與遺傳", "演化", "生物多樣性", "基因改造"
    ],
    '地科': [
      "天氣與氣候變化", "晝夜與季節", "天然災害與防治-地科",
      "永續發展與資源的利用", "氣候變遷之影響與調適"
    ]
  };

  const questionTopicMapping = {
    0: ['生物', 2],
    1: ['物理', 3],
    2: ['化學', 9],
    3: ['化學', 7],
    4: ['物理', 6],
    5: ['生物', 2],
    6: ['地科', 2],
    7: ['物理', 0],
    8: ['地科', 1],
    9: ['生物', 3],
    10: ['物理', 2],
    11: ['地科', 4],
    12: ['化學', 6],
    13: ['化學', 4],
    14: ['生物', 1],
    15: ['物理', 3],
    16: ['化學', 5],
    17: ['物理', 5],
    18: ['地科', 1],
    19: ['物理', 8],
    20: ['化學', 8],
    21: ['物理', 1],
    22: ['化學', 10],
    23: ['地科', 0],
    24: ['地科', 3],
    25: ['生物', 0],
    26: ['物理', 7],
    27: ['地科', 2],
    28: ['地科', 2],
    29: ['地科', 3],
  };

  const handleOptionClick = (option) => {
    const updatedOptions = [...selectedOptions];
    updatedOptions[questionIndex] = option;
    setSelectedOptions(updatedOptions);
    if (questionIndex < questions.length - 1) {
      setQuestionIndex(questionIndex + 1);
    }
  };

  const handlePrevClick = () => {
    if (questionIndex > 0) {
      setQuestionIndex(questionIndex - 1);
    }
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const callApi = async (topics) => {
    console.log(`根據以下主題${topics.join(', ')}，給予學生"3個"創新的主題給學生作為靈感發想`);
    
    const response = await fetch('http://ml.hsueh.tw/callapi/', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        engine: 'gpt-35-turbo',
        temperature: 0.7,
        max_tokens: 500,
        top_p: 0.95,
        top_k: 5,
        roles: [
          {
            role: 'user',
            content: `根據以下主題${topics.join(', ')}，給予學生"3個"創新的主題，這"3個"創新的主題要是高中生能力範圍可以達到之研究主題，給學生作為靈感發想，你只需要回覆主題即可，不需要其他文字說明。`,
          },
        ],
        frequency_penalty: 0,
        repetition_penalty: 1.03,
        presence_penalty: 0,
        stop: '',
        past_messages: 10,
        purpose: 'dev',
      }),
    });

    const data = await response.json();
    return data;
  };

  const handleSubmit = async () => {
    const selectedTopics = questions
      .map((question, index) => (selectedOptions[index] === '是' ? questionTopicMapping[index] : null))
      .filter(topic => topic !== null)
      .map(([subject, topicIndex]) => topics[subject][topicIndex]);

    // 呼叫 API 並處理回應
    const apiResponse = await callApi(selectedTopics);
    console.log('API Response:', apiResponse);

    // 將 API 回應顯示給使用者
    const apiTopics = apiResponse.choices[0].message.content.split('\n').filter(line => line);
    setRecommendedTopics(apiTopics);
    setShowRecommendations(true);

    // 將推薦的主題回傳給父組件
    if (onRecommendations) {
      onRecommendations(apiTopics);
    }
  };

  useEffect(() => {
    if (showRecommendations) {
      const results = questions.map((question, index) => ({
        question,
        answer: selectedOptions[index] || '未回答'
      }));

      localStorage.setItem('quizResults', JSON.stringify(results));
    }
  }, [showRecommendations]);

  const handleQuizEnd = () => {
    console.log("Navigating to /chat");
    if (typeof onQuizEnd === 'function') {
      onQuizEnd();
    } else {
      console.error('onQuizEnd is not a function');
    }
    navigate("/chat"); // 使用 navigate 方法
  };

  return (
    <div className="quiz-container">
      {!showRecommendations ? (
        <>
          <CSSTransition
            in={!showRecommendations}
            timeout={500}
            classNames="fade"
            unmountOnExit
          >
            <strong><h3>這組問題將幫助我們了解你/妳對哪個科學領域更感興趣。</h3></strong>
          </CSSTransition>
          <div className="quiz-question-container">
            <button onClick={handlePrevClick} disabled={questionIndex === 0}>&lt;</button>
            <CSSTransition
              in={!showRecommendations}
              timeout={500}
              classNames="slide"
              unmountOnExit
            >
              <div className="quiz-question">
                <p>{questions[questionIndex]}</p>
                <div className="quiz-options">
                  <button
                    className={`option-button ${selectedOptions[questionIndex] === '是' ? 'selected' : ''}`}
                    onClick={() => handleOptionClick('是')}
                  >
                    是
                  </button>
                  <button
                    className={`option-button ${selectedOptions[questionIndex] === '有時候' ? 'selected' : ''}`}
                    onClick={() => handleOptionClick('有時候')}
                  >
                    有時候
                  </button>
                  <button
                    className={`option-button ${selectedOptions[questionIndex] === '否' ? 'selected' : ''}`}
                    onClick={() => handleOptionClick('否')}
                  >
                    否 / 不確定
                  </button>
                </div>
              </div>
            </CSSTransition>
            <button onClick={() => setQuestionIndex(questionIndex + 1)} disabled={questionIndex >= questions.length - 1}>&gt;</button>
          </div>
          <div className="quiz-progress">
            <span>{`Q${questionIndex + 1} of ${questions.length}`}</span>
            <div className="progress-bar">
              <div className="progress" style={{ width: `${(questionIndex + 1) / questions.length * 100}%` }}></div>
            </div>
          </div>
          <button className="submit-button" onClick={handleSubmit} disabled={questionIndex < questions.length - 1}>提交</button>
          <button className="show-selection-button" onClick={handleSubmit}>顯示我的選擇</button>
        </>
      ) : (
        <>
          <CSSTransition
            in={showRecommendations}
            timeout={500}
            classNames="fade"
            unmountOnExit
          >
            <div>
              <h2>看來你對這個主題比較感興趣喔！</h2>
              <ul>
                {recommendedTopics.map((topic, index) => (
                  <li key={index}>{index + 1}. {topic}</li>
                ))}
              </ul>
              <h3>返回聊天室，跟定題小幫手說，你想多了解些什麼吧！</h3>
              <button className="chat-button" onClick={handleQuizEnd}>返回聊天室</button>
              <h2>選擇結果</h2>
              <button className="expand-button" onClick={toggleExpand}>
                {isExpanded ? '摺疊' : '展開問題'}
              </button>
              {isExpanded && (
                <ul>
                  {questions.map((question, index) => (
                    <li key={index}>
                      <p>{question}</p>
                      <p>選擇: {selectedOptions[index]}</p>
                    </li>
                  ))}
                </ul>
              )}
              <button className="back-button" onClick={() => setShowRecommendations(false)}>返回</button>
            </div>
          </CSSTransition>
        </>
      )}
    </div>
  );
};

export default Quiz;

// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import './Quiz.css'; 
// import { CSSTransition } from 'react-transition-group';

// const Quiz = ({ onRecommendations, onQuizEnd }) => {
//   const [questionIndex, setQuestionIndex] = useState(0);
//   const [selectedOptions, setSelectedOptions] = useState([]);
//   const [showRecommendations, setShowRecommendations] = useState(false);
//   const [recommendedTopics, setRecommendedTopics] = useState([]);
//   const [isExpanded, setIsExpanded] = useState(false);
//   const navigate = useNavigate(); // 使用 useNavigate hook


//   const questions = [
//     "你是否對動物在不同環境中的行為模式感興趣，例如寵物狗的行為和野生狼的行為有何不同？", // 生物 - 生物多樣性
//     "當你想到宇宙和天體時，你會感到興奮嗎，例如夜空中的星座和月球的運行？", // 物理 - 宇宙與天體
//     "環境保護的議題會讓你想要進一步研究嗎，例如如何減少塑料污染？", // 化學 - 環境汙染與防治
//     "你是否喜歡在實驗室中進行化學實驗，觀察化學反應的過程，例如製作自製肥皂？", // 化學 - 科學在生活中的應用
//     "電磁現象，如電磁波和磁場，是否讓你感到好奇，例如無線充電是如何工作的？", // 物理 - 電磁現象
//     "你是否對研究不同生物物種的多樣性及其生態系統感興趣，例如雨林中的生物多樣性？", // 生物 - 生物多樣性
//     "你對於如何預防和應對天然災害有強烈的興趣嗎，例如地震和颱風的預警系統？", // 地科 - 天然災害與防治-地科
//     "能量的形式與轉換，特別是在物理學中的應用，是否吸引你，例如太陽能電池如何將光能轉化為電能？", // 物理 - 能量的形式與轉換
//     "你是否對地球的內部結構以及它如何影響地表活動感到好奇，例如火山噴發的原因？", // 地科 - 組成地球的物質
//     "遺傳學和基因改造技術是否是你感興趣的研究領域，例如基因編輯技術在醫學中的應用？", // 生物 - 基因改造
//     "你是否對物理中的力學和運動定律有濃厚的興趣，例如汽車碰撞時的力量分析？", // 物理 - 力與運動
//     "氣候變遷及其對地球生態系統的影響，是否引起你的關注，例如全球變暖對海平面上升的影響？", // 地科 - 氣候變遷之影響與調適
//     "你是否對酸鹼反應及其在化學中的應用感到興奮，例如檸檬汁和小蘇打混合時的反應？", // 化學 - 酸鹼反應
//     "水溶液中的化學變化，如溶解度和反應速率，是否讓你想要深入了解，例如鹽在水中的溶解速度？", // 化學 - 水溶液中的變化
//     "生物演化的過程及其證據，是否是你想要探索的主題，例如恐龍如何演化成現代鳥類？", // 生物 - 演化
//     "你是否對研究萬有引力和天體運動的規律有興趣，例如衛星如何繞地球運行？", // 物理 - 萬有引力
//     "化學中的氧化還原反應及其在工業中的應用，是否讓你感到好奇，例如電池中的化學反應？", // 化學 - 氧化與還原反應
//     "光和波動現象，如折射和干涉，是否是你感興趣的研究領域，例如彩虹的形成原理？", // 物理 - 波動、光及聲音
//     "晝夜和季節變化的成因及其對地球環境的影響，是否讓你想要了解更多，例如為什麼夏天的白天比冬天長？", // 地科 - 晝夜與季節
//     "你是否對科學技術在日常生活中的應用有濃厚的興趣，例如微波爐是如何加熱食物的？", // 物理 - 物理在生活中的應用-科學、技術及社會的互動關係
//     "你是否對自然災害的化學預防措施感興趣，例如如何減少火災風險？", // 化學 - 天然災害與防治-化學
//     "溫度與熱量的變化是否讓你感到好奇，例如冷卻和加熱的過程？", // 物理 - 溫度與熱量
//     "你是否對研究能源的開發與利用感興趣，例如風能和水能的應用？", // 化學 - 能源的開發與利用
//     "你是否對天氣與氣候變化的研究有興趣，例如颱風的形成和預測？", // 地科 - 天氣與氣候變化
//     "你是否對永續發展與資源利用的議題感興趣，例如可再生能源的利用？", // 地科 - 永續發展與資源的利用
//     "你是否對生物的生殖與遺傳過程感興趣，例如基因如何影響生物的性狀？", // 生物 - 生殖與遺傳
//     "你是否對量子現象及其應用感興趣，例如量子計算和量子通信？", // 物理 - 量子現象
//     "你是否對研究地震的預測和防災措施感興趣，例如地震波的傳播？", // 地科 - 天然災害與防治-地科
//     "你是否對地球資源的利用與保護有興趣，例如礦物資源的開採和再生？" // 地科 - 永續發展與資源的利用
//   ];

//   const topics = {
//     '化學': [
//       "化學-能量的形式與轉換", "物質的分離與鑑定", "物質的結構與功能",
//       "組成地球的物質", "水溶液中的變化", "氧化與還原反應", "酸鹼反應",
//       "科學在生活中的應用", "天然災害與防治-化學", "環境汙染與防治",
//       "能源的開發與利用"
//     ],
//     '物理': [
//       "物理-能量的形式與轉換", "溫度與熱量", "力與運動", "宇宙與天體",
//       "萬有引力", "波動、光及聲音", "電磁現象", "量子現象",
//       "物理在生活中的應用-科學、技術及社會的互動關係"
//     ],
//     '生物': [
//       "生殖與遺傳", "演化", "生物多樣性", "基因改造"
//     ],
//     '地科': [
//       "天氣與氣候變化", "晝夜與季節", "天然災害與防治-地科",
//       "永續發展與資源的利用", "氣候變遷之影響與調適"
//     ]
//   };

//   const handleOptionClick = (option) => {
//     const updatedOptions = [...selectedOptions];
//     updatedOptions[questionIndex] = option;
//     setSelectedOptions(updatedOptions);
//     if (questionIndex < questions.length - 1) {
//       setQuestionIndex(questionIndex + 1);
//     }
//   };

//   const handlePrevClick = () => {
//     if (questionIndex > 0) {
//       setQuestionIndex(questionIndex - 1);
//     }
//   };

//   const toggleExpand = () => {
//     setIsExpanded(!isExpanded);
//   };

//   const handleSubmit = () => {
//     const topicCounts = {
//       '化學': { total: 0, topics: Array(10).fill(0) },
//       '物理': { total: 0, topics: Array(9).fill(0) },
//       '生物': { total: 0, topics: Array(4).fill(0) },
//       '地科': { total: 0, topics: Array(5).fill(0) }
//     };

//     const questionTopicMapping = {
//       0: ['生物', 2],
//       1: ['物理', 3],
//       2: ['化學', 9],
//       3: ['化學', 7],
//       4: ['物理', 6],
//       5: ['生物', 2],
//       6: ['地科', 2],
//       7: ['物理', 0],
//       8: ['地科', 1],
//       9: ['生物', 3],
//       10: ['物理', 2],
//       11: ['地科', 4],
//       12: ['化學', 6],
//       13: ['化學', 4],
//       14: ['生物', 1],
//       15: ['物理', 3],
//       16: ['化學', 5],
//       17: ['物理', 5],
//       18: ['地科', 1],
//       19: ['物理', 8],
//       20: ['化學', 8],
//       21: ['物理', 1],
//       22: ['化學', 10],
//       23: ['地科', 0],
//       24: ['地科', 3],
//       25: ['生物', 0],
//       26: ['物理', 7],
//       27: ['地科', 2],
//       28: ['地科', 2],
//       29: ['地科', 3],
//     };
    
//     selectedOptions.forEach((option, index) => {
//       if (option === '是' && questionTopicMapping[index]) {
//         const [subject, topicIndex] = questionTopicMapping[index];
//         topicCounts[subject].total += 1;
//         topicCounts[subject].topics[topicIndex] += 1;
//       }
//     });

//     const sortedTopics = Object.keys(topicCounts).sort((a, b) => topicCounts[b].total - topicCounts[a].total);
//     const recommended = [];
//     sortedTopics.forEach(topic => {
//       const topicData = topicCounts[topic];
//       topicData.topics.forEach((count, index) => {
//         if (count > 0) {
//           recommended.push(topics[topic][index]);
//         }
//       });
//     });

//     const topRecommendations = recommended.slice(0, 1);
//     setRecommendedTopics(topRecommendations);
//     setShowRecommendations(true);

//     // 新增console.log顯示推薦的三個主題
//     console.log('推薦的主題:', recommended.slice(0, 1));

//     // 將推薦的三個主題回傳給父組件
//     if (onRecommendations) {
//       onRecommendations(topRecommendations);
//     }
//   };

//   useEffect(() => {
//     if (showRecommendations) {
//       const results = questions.map((question, index) => ({
//         question,
//         answer: selectedOptions[index] || '未回答'
//       }));

//       localStorage.setItem('quizResults', JSON.stringify(results));
//     }
//   }, [showRecommendations]);

//   const handleQuizEnd = () => {
//     console.log("Navigating to /chat");
//     if (typeof onQuizEnd === 'function') {
//       onQuizEnd();
//     } else {
//       console.error('onQuizEnd is not a function');
//     }
//     navigate("/chat"); // 使用 navigate 方法
//   };


//   return (
//     <div className="quiz-container">
//       {!showRecommendations ? (
//         <>
//           <CSSTransition
//             in={!showRecommendations}
//             timeout={500}
//             classNames="fade"
//             unmountOnExit
//           >
//             <strong><h3>這組問題將幫助我們了解你/妳對哪個科學領域更感興趣。</h3></strong>
//           </CSSTransition>
//           <div className="quiz-question-container">
//             <button onClick={handlePrevClick} disabled={questionIndex === 0}>&lt;</button>
//             <CSSTransition
//               in={!showRecommendations}
//               timeout={500}
//               classNames="slide"
//               unmountOnExit
//             >
//               <div className="quiz-question">
//                 <p>{questions[questionIndex]}</p>
//                 <div className="quiz-options">
//                   <button
//                     className={`option-button ${selectedOptions[questionIndex] === '是' ? 'selected' : ''}`}
//                     onClick={() => handleOptionClick('是')}
//                   >
//                     是
//                   </button>
//                   <button
//                     className={`option-button ${selectedOptions[questionIndex] === '有時候' ? 'selected' : ''}`}
//                     onClick={() => handleOptionClick('有時候')}
//                   >
//                     有時候
//                   </button>
//                   <button
//                     className={`option-button ${selectedOptions[questionIndex] === '否' ? 'selected' : ''}`}
//                     onClick={() => handleOptionClick('否')}
//                   >
//                     否 / 不確定
//                   </button>
//                 </div>
//               </div>
//             </CSSTransition>
//             <button onClick={() => setQuestionIndex(questionIndex + 1)} disabled={questionIndex >= questions.length - 1}>&gt;</button>
//           </div>
//           <div className="quiz-progress">
//             <span>{`Q${questionIndex + 1} of ${questions.length}`}</span>
//             <div className="progress-bar">
//               <div className="progress" style={{ width: `${(questionIndex + 1) / questions.length * 100}%` }}></div>
//             </div>
//           </div>
//           <button className="submit-button" onClick={handleSubmit} disabled={questionIndex < questions.length - 1}>提交</button>
//           <button className="show-selection-button" onClick={handleSubmit}>顯示我的選擇</button>
//         </>
//       ) : (
//         <>
//           <CSSTransition
//             in={showRecommendations}
//             timeout={500}
//             classNames="fade"
//             unmountOnExit
//           >
//             <div>
//               <h2>看來你對這個主題比較感興趣喔！</h2>
//               <ul>
//                 {recommendedTopics.map((topic, index) => (
//                   <li key={index}>{index + 1}. {topic}</li>
//                 ))}
//               </ul>
//               <h3>返回聊天室，跟定題小幫手說，你想多了解些什麼吧！</h3>
//               <button className="chat-button" onClick={handleQuizEnd}>返回聊天室</button>
//               <h2>選擇結果</h2>
//               <button className="expand-button" onClick={toggleExpand}>
//                 {isExpanded ? '摺疊' : '展開問題'}
//               </button>
//               {isExpanded && (
//                 <ul>
//                   {questions.map((question, index) => (
//                     <li key={index}>
//                       <p>{question}</p>
//                       <p>選擇: {selectedOptions[index]}</p>
//                     </li>
//                   ))}
//                 </ul>
//               )}
//               <button className="back-button" onClick={() => setShowRecommendations(false)}>返回</button>
//             </div>
//           </CSSTransition>
//         </>
//       )}
//     </div>
//   );
// };

// export default Quiz;