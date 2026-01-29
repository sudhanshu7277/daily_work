export const environment = {
  production: false,
  apiUrl: '/shared-services/api/payment',
  authorizeApiUrl: '/shared-services/api/authorize' // New path for POST API
};



var HttpsProxyAgent = require('https-proxy-agent');

// Local development proxy configuration
var proxyConfig = [
  {
    context: ['/shared-services/api/payment'],
    target: 'https://payment-icg-msst-shared-services-179025.apps.namicggtd22d.ecs.dyn.nsroot.net',
    secure: false,
    changeOrigin: true,
    pathRewrite: {
      '^/shared-services/api/payment': '/shared-services/api/payment'
    },
    onProxyReq: function(proxyReq, req, res) {
      addIbmHeaders(proxyReq);
    }
  },
  {
    // New configuration for the POST API
    context: ['/shared-services/api/authorize'], 
    target: 'https://your-new-post-api-target.com', // Update with your actual target
    secure: false,
    changeOrigin: true,
    pathRewrite: {
      '^/shared-services/api/authorize': '/shared-services/api/authorize'
    },
    onProxyReq: function(proxyReq, req, res) {
      addIbmHeaders(proxyReq);
    }
  }
];

// Helper function to avoid code duplication for headers
function addIbmHeaders(proxyReq) {
  var clientId = process.env.HARDCAP_CLIENT_ID || '589e409b-cc8b-4751-a9ec-2761de0bc0d5';
  var clientSecret = process.env.HARDCAP_CLIENT_SECRET || 'X5wU61N8gQ4cA3cQ6nF0sG5fK6eV0vW2bI5wW4jF7iE1';
  proxyReq.setHeader('X-IBM-Client-Id', clientId);
  proxyReq.setHeader('X-IBM-Client-Secret', clientSecret);
  proxyReq.setHeader('x-citiportal-apim-client-id', clientId);
}

function setupForCorporateProxy(proxyConfig) {
  var proxyServer = process.env.http_proxy || process.env.HTTP_PROXY;
  if (proxyServer) {
    var agent = new HttpsProxyAgent(proxyServer);
    console.log('Using corporate proxy server: ' + proxyServer);
    proxyConfig.forEach(function(entry) {
      entry.agent = agent;
    });
  }
  return proxyConfig;
}

module.exports = setupForCorporateProxy(proxyConfig);

