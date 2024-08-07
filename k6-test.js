import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

export let errorRate = new Rate('errors');

export let options = {
  stages: [
    { duration: '1m', target: 10 },  // 在1分鐘內增加到10個使用者
    { duration: '3m', target: 10 },  // 保持10個使用者3分鐘
    { duration: '1m', target: 0 },   // 在1分鐘內減少到0個使用者
  ]
};

const API_URL = 'http://140.115.126.232:7878/generate-Research_Question/';

const textInput = "我想了解生物多樣性生物多樣性是指一個生態系統中不同物種的多樣性程度，包括物種的數量、多樣性和分佈。你是否曾思考過為什麼生物多樣性對我們的生活如此重要呢？因為生物多樣性才會生態平衡嗎是的，生物多樣性對於維持生態平衡非常重要。想想看，如果某個生態系統中某種物種數量過多或過少，會對其他物種造成影響，可能導致食物鏈失衡或生態環境變差。你能舉出一些生物多樣性對生態平衡的影響嗎？消化有害物質：許多生物種類能夠分解有害物質，例如細菌可以分解有毒化學物質，有助於保持生態系統的健康。非常好的例子！細菌和其他生物的分解能力確實對生態系統的健康至關重要，因為它們有助於消化有害物質，避免了這些物質對其他生物產生負面影響，有助於維持生態平衡。你能夠舉出其他生物多樣性對生態平衡的影響嗎？為了維持穩固的生態鏈嗎對的！生物多樣性也有助於維持穩固的生態鏈。不同物種之間存在著相互依存和相互作用的關係，比如食物鏈中的各個環節都依賴於其他生物的存在。如果某個物種數量驟減或消失，就可能打破整個生態鏈，影響到其他物種的存活和生活方式。你能舉出一些其他對維持穩固生態鏈有影響的生物多樣性方面嗎？例如保護棲息地，因為保護生物的棲息地是維持生態鏈與生物多樣性的重要因素。非常好的觀點！保護生物的棲息地確實是維持生態鏈和生物多樣性的重要因素之一。生物依賴於特定的棲息地來生存和繁衍，如果棲息地受到破壞或減少，就會對相應的生物種群造成影響，間接地影響整個生態鏈的穩固性。你對保護棲息地有其他想法或看法嗎？我認為要維持生物多樣性，首當其衝的就是要保護棲息地，如果缺乏棲息地就會導致生物多樣性會逐漸被破壞非常正確！保護棲息地是維持生物多樣性的關鍵措施之一。生物多樣性的破壞往往與棲息地的破壞直接相關，因為生物需要適合的環境才能生存和繁衍。如果棲息地受到破壞或過度開發，生物就會失去生存的空間和資源，進而影響生態系統的穩定性和生物多樣性。你對如何更好地保護棲息地有什麼建議或想法嗎？我覺得應該要減少人類對物種的棲息地的破壞你的想法非常明智！減少人類對物種棲息地的破壞是保護生物多樣性的重要一環。這可以通過各種方式來實現，比如合理規劃城市建設，保護自然生態系統，倡導可持續的土地利用方式，以及推動環境教育和意識提升等措施。你對如何進一步減少人類對棲息地的破壞有什麼具體想法或建議嗎？我認為政府應該要規劃如何保護自然生態系統，讓企業開採生物棲息地的標準要大幅提高難度你提出的建議非常有價值！政府在保護自然生態系統方面扮演著至關重要的角色，通過制定更嚴格的法規和標準，可以有效地限制企業對生物棲息地的開採和破壞行為，從而保護生物多樣性和生態系統的完整性。此外，政府還可以推動相關的教育和宣傳活動，提高公眾對生態保護的重視程度，促進社會各界的共同參與和努力。你對政府在保護自然生態系統方面有其他的想法或期望嗎？希望可以建立良好的政策，不要為了自己的私利而犧牲動植物的權利這是一個非常重要的觀點！建立良好的政策是保護生物多樣性和生態系統的關鍵之一。這些政策應該著眼於整體生態環境的保護，不應為了一時的私利而犧牲動植物的權利和生存空間。這需要政府、企業和公民社會的共同努力，通過合作、宣傳、監督等方式來確保政策的有效實施和執行。";

export default function () {
  let query = { prompt: textInput };
  let headers = { 'Content-Type': 'application/json' };

  // Post request
  let postResponse = http.post(API_URL, JSON.stringify(query), { headers: headers });
  let postCheck = check(postResponse, { 
    'status was 200': (r) => r.status === 200,
    'response format was correct': (r) => {
      try {
        let jsonResponse = JSON.parse(r.body);
        return jsonResponse.hasOwnProperty('response');
      } catch (e) {
        return false;
      }
    },
  });
  errorRate.add(postResponse.status !== 200);
  
  // 計算時間
  let postDuration = postResponse.timings.duration;

  // 等待回應
  if (postCheck) {
    console.log(`POST request duration: ${postDuration} ms`);
  } else {
    console.log('POST request failed or response format was incorrect');
  }
  sleep(1);
}
