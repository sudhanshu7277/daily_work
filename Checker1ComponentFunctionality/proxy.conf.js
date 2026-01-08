const HttpsProxyAgent = require('https-proxy-agent');

// Local development proxy configuration
// Proxies /api/hardcap/* to the SIT API and adds IBM headers
// Proxies /shared-services/api/payment/* to the SIT API and adds IBM headers

var proxyConfig = [
  {
    context: ['/api/hardcap'],
    target: 'https://sit.tts.icgservices.citigroup.net',
    secure: false,
    changeOrigin: true,
    pathRewrite: {
      "/api/hardcap": "/tts/internal/shared-services/api/payment"
    }
  },
  {
    context: ['/shared-services/api/payment'],
    target: 'https://sit.tts.icgservices.citigroup.net',
    secure: false,
    changeOrigin: true,
    pathRewrite: {
      "/shared-services/api/payment": "/tts/internal/shared-services/api/payment"
    },
    onProxyReq: function(proxyReq, req, res) {
      // Add IBM headers for authentication
      // For local dev, set these environment variables or replace with actual values
      var clientId = process.env.HARDCAP_CLIENT_ID || '5994a09b-cbb8-4751-a9ec-2761de0bcd05';
      var clientSecret = process.env.HARDCAP_CLIENT_SECRET || 'X5Wu61N8gQ4aC3aCQ6nF0s65F6Kf6eVcY7eV0iN2015mwaJF7lE1';
      proxyReq.setHeader('X-IBM-Client-Id', clientId);
      proxyReq.setHeader('X-IBM-Client-Secret', clientSecret);
    }
  }
];

module.exports = proxyConfig;