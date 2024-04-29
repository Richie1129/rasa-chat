import axios from 'axios';

// 儲存歷史訊息的全局變量
let historyMessages = [];

export const fetch5W1H = async (inputMessage) => {
  const url = "http://ml.hsueh.tw:1288/query/";

  const data = {
    question: inputMessage
  };

  const headers = {
    'accept': 'application/json',
    'Content-Type': 'application/json'
  };

  try {
    const response = await axios.post(url, data, { headers });
    if (response.status === 200) {
      const content = response.data.response;
      console.log(content);
      console.log(inputMessage);

      const url_similarity = "http://ml.hsueh.tw:1290/similarity/";
      const data_similarity = {
        "message": inputMessage,
        "response": content
      };

      const response_similarity = await axios.post(url_similarity, data_similarity, { headers });
      if (response_similarity.status === 200) {
        const similarity = response_similarity.data['是否相似'];
        console.log(similarity);

        if (similarity === "是") {
          // 檢查歷史訊息是否已包含這個問題的回答
          const lastResponse = historyMessages.slice(-1)[0];
          console.log(historyMessages);
          console.log(lastResponse);
          if (lastResponse && lastResponse.inputMessage === inputMessage) {
            // 再次執行相關API
            const furtherResponse = await axios.post(url, lastResponse.data, { headers });
            console.log(furtherResponse.data);
            if (furtherResponse.status === 200) {
              return furtherResponse.data;
            }
          } else {
            // 如果不是重複問題，就執行第二個API
            const url2 = "http://ml.hsueh.tw/callapi/";
            const data2 = {
              engine: "gpt-35-turbo",
              temperature: 0.7,
              max_tokens: 500,
              top_p: 0.95,
              top_k: 5,
              roles: [
                { role: "system", content: content },
                { role: "user", content: "你必須使用5W1H框架的問句，只要給我一個問題即可，不要包含任何答案。回答中不要提供任何答案。"}
              ],
              frequency_penalty: 0,
              repetition_penalty: 1.03,
              presence_penalty: 0,
              stop: "",
              past_messages: 10,
              purpose: "dev"
            };

            const response2 = await axios.post(url2, data2, { headers });
            console.log(response2.data);
            if (response2.status === 200) {
              // 儲存這次的輸入和回應到歷史訊息中
              historyMessages.push({ inputMessage, data: response2.data });
              console.log(historyMessages)
              return response2.data;
            }
          }
        } else {
          return null;
        }
      } else {
        console.error('相似度API請求失敗，狀態碼：', response_similarity.status);
        return { error: '相似度API請求失敗' };
      }
    } else {
      console.error('第一個API請求失敗，狀態碼：', response.status);
      return { error: '第一個API請求失敗' };
    }
  } catch (error) {
    console.error('API請求錯誤', error);
    return { error: 'API請求過程中發生錯誤' };
  }
};
