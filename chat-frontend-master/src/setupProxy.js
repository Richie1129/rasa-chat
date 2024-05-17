const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // 代理到 Express 服務器
  app.use(
    '/api/express',
    createProxyMiddleware({
      target: 'http://140.115.126.232:5001',
      changeOrigin: true,
      pathRewrite: {
        '^/api/express': '', // 把 /api/express 前綴移除
      },
    })
  );

  // 代理到 Rasa 服務器
  app.use(
    '/api/rasa',
    createProxyMiddleware({
      target: 'http://localhost:5005', // 假設 Rasa 服務器運行在 5005 端口
      changeOrigin: true,
      pathRewrite: 
        {'^/api/rasa': '/'}, // 移除 /api/rasa 前綴
        logLevel: 'debug'
    }));
};
