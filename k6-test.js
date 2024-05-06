import http from 'k6/http';
import { sleep, check } from 'k6';

export let options = {
    stages: [
        { duration: '1m', target: 20 },  // 模擬在1分鐘內逐漸增加到20個虛擬用戶
        { duration: '3m', target: 50 },  // 進一步增加到50個虛擬用戶，持續3分鐘
        { duration: '1m', target: 0 },   // 最後1分鐘內虛擬用戶數減少到0
    ]
};

export default function () {
    let res = http.post('http://localhost:5005/webhooks/rest/webhook', JSON.stringify({
        sender: `user_${__VU}`,
        message: '你好'
    }), {
        headers: { 'Content-Type': 'application/json' },
    });

    check(res, {
        'is status 200': (r) => r.status === 200,
        'is reply correct': (r) => JSON.parse(r.body)[0].text === '你好嗎？',
    });

    sleep(1);
}
