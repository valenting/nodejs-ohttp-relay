const http = require('http');
const https = require('https');

const PORT = 8080; // change this to the port you want to listen on
const GATEWAY_URL = 'https://localhost:4567/gateway'; // change this to the URL you want to forward requests to

// create a server instance
const server = http.createServer((req, res) => {
  // handle only POST requests
  if (req.method === 'POST') {
    let body = '';
    // receive data from the request

    let url = new URL(GATEWAY_URL);
    let options = {
      method: req.method,
      path: url.pathname,
      port: url.port,
      host: url.hostname,
      protocol: "https:",
      headers: req.headers,
      rejectUnauthorized: false, // Accept self signed certificate
    };

    let proxyRes;
    let content = "";
    const proxyReq = https.request(GATEWAY_URL, options, proxyRes1 => {
      proxyRes = proxyRes1;
      console.log(proxyRes.statusCode, proxyRes.statusMessage, proxyRes.headers);
      res.writeHead(proxyRes.statusCode, proxyRes.statusMessage, proxyRes.headers);
      proxyRes.pipe(res);
    });

    req.on('data', chunk => {
      proxyReq.write(chunk);
    });
    req.on('end', () => {
      proxyReq.end();
    });
  } else {
    res.statusCode = 405; // Method not allowed
    res.end();
  }
});

// start the server
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
