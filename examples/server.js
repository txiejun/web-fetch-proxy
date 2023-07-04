/**
 * The web server used for local testing.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

// deal with static files
const onStatics = (req, res)=>{
  const filePath = path.join(process.cwd(), req.url);
  console.log("filePath:", filePath)
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('404 Not Found');
    } else {
      res.writeHead(200);
      res.end(data);
    }
  });
}

// deal with api
const onApi = (req, res)=>{
  res.setHeader('Content-Type', 'application/json');
  let data = {
    code: 0,
    message: ''
  }
  if(req.url === '/api/a'){
    data = {
      code: 0,
      message: 'Hello, A!'
    }
  }
  else if(req.url === '/api/b'){
    data = {
      code: 0,
      message: 'Hello, B!'
    }
  }
  else if(req.url === '/api/c'){
    data = {
      code: 0,
      message: 'Hello, C!'
    }
  }
  else if(req.url === '/api/d'){
    data = {
      code: 0,
      message: 'Hello, D!'
    }
  }

  res.end(JSON.stringify(data));
}

const server = http.createServer((req, res) => {
  console.log("req.url:", req.url)
  if (req.url.startsWith('/api')) {
    onApi(req, res)
  } else if (req.url.startsWith('/examples') || req.url.startsWith('/dist')) {
    onStatics(req, res)
  } else {
    res.setHeader('Content-Type', 'text/plain');
    res.end('Hello, World!');
  }
});

const port = 3000;
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});