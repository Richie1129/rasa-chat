// chatapi.js
import axios from 'axios';

// 在內存中暫存對話歷史的數組
let pastMessages = [{
  role: "system",
  content: "1. 任務描述：你的關鍵任務是利用以下物理主題幫助學生找到感興趣的研究主題。你會通過提問和討論這些主題，引導學生探索並深化他們對物理學的興趣和理解。2. 知識範圍限制：你僅專注於物理學相關的知識。在每次與使用者互動前，你將評估問題是否與物理學相關。對於非物理相關的問題，你將友善地回應「這個問題超出了我的專業範圍，但我們可以討論其他物理相關的主題。」3. 物理學範圍：你的討論和回答將涵蓋以下物理學主題：物理-能量的形式與轉換、溫度與熱量、力與運動、宇宙與天體、萬有引力、波動、光及聲音、電磁現象、量子現象、物理在生活中的應用。4. 互動範例：當使用者提出：「我覺得酸鹼中和很有趣。」因為與「物理」無關，所以回覆：「這個問題超出了我的專業範圍，但我們可以討論物理中的萬有引力如何影響天體運動。你對此感興趣嗎？」回覆不要超過100字"
}];
// 您是專門輔導高中生科學展覽的自然科學導師。任務：1. 主題選擇輔導：- 首先，引導學生從日常生活、研究或課堂內容中找到感興趣的主題。- 如果學生已經有確定想研究的主題以及研究問題，您應該幫助他更深入理解；如果學生都尚未確定研究的主題請您使用5W1H方法逐步幫助學生確定科展主題，首先從「What」開始，然後是「Why」，依此類推，幫助學生明確核心問題。您的角色是以適合高中生的語言，保持專業的同時，引導學生探索自然科學的奧秘。

export const fetchChatResponse = async (inputMessage) => {
  const url = "http://ml.hsueh.tw/callapi/";
  // 添加當前用戶消息到對話歷史
  pastMessages.push({
    role: "user",
    content: inputMessage
  });
  const data = {
    engine: "taide-llama-3",
    temperature: 0.7,
    max_tokens: 300,
    top_p: 0.95,
    top_k: 5,
    roles: pastMessages, // 使用更新後的pastMessages
    frequency_penalty: 0,
    repetition_penalty: 1.03,
    presence_penalty: 0,
    stop: "",
    past_messages: pastMessages.length, // 使用對話歷史的長度作為過去消息數
    purpose: "dev"
  };
  const headers = {
    'accept': 'application/json',
    'Content-Type': 'application/json'
  };

  try {
    const response = await axios.post(url, data, { headers });
    console.log("1",pastMessages)
    if (response.status === 200 && response.data.choices && response.data.choices.length > 0) {
      // 將系統回應添加到對話歷史
      pastMessages.push({
        role: "system",
        content: response.data.choices[0].message.content
      });
      console.log("2",pastMessages)
      return response.data.choices[0].message.content;
    } else {
      console.error('API請求失敗，狀態碼：', response.status);
      return 'API請求失敗';
    }
  } catch (error) {
    console.error('API請求錯誤', error);
    return 'API請求過程中發生錯誤';
  }
};

// 重置對話歷史的函數
export const resetChatHistory = () => {
  pastMessages = [{
    role: "system",
    content: "1. 任務描述：你的關鍵任務是利用以下物理主題幫助學生找到感興趣的研究主題。你會通過提問和討論這些主題，引導學生探索並深化他們對物理學的興趣和理解。2. 知識範圍限制：你僅專注於物理學相關的知識。在每次與使用者互動前，你將評估問題是否與物理學相關。對於非物理相關的問題，你將友善地回應「這個問題超出了我的專業範圍，但我們可以討論其他物理相關的主題。」3. 物理學範圍：你的討論和回答將涵蓋以下物理學主題：物理-能量的形式與轉換、溫度與熱量、力與運動、宇宙與天體、萬有引力、波動、光及聲音、電磁現象、量子現象、物理在生活中的應用。4. 互動範例：當使用者提出：「我覺得酸鹼中和很有趣。」因為與「物理」無關，所以回覆：「這個問題超出了我的專業範圍，但我們可以討論物理中的萬有引力如何影響天體運動。你對此感興趣嗎？」回覆不要超過100字"
}]
}