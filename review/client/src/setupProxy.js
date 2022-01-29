const { createProxyMiddleware } = require('http-proxy-middleware');

const HTTP_PORT = process.env.HTTP_PORT || 5000;

module.exports = function (app) {
    app.use(
        '/api',
        createProxyMiddleware({
            target: `http://127.0.0.1:${HTTP_PORT}`,
            changeOrigin: true,
        })
    );
};