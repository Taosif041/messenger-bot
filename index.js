const express = require('express');
const app = express();

const VERIFY_TOKEN = 'mytoken123';

app.get('/webhook', (req, res) => {
  if (req.query['hub.verify_token'] === VERIFY_TOKEN) {
    res.send(req.query['hub.challenge']);
  } else {
    res.sendStatus(403);
  }
});

app.use(express.json());
app.post('/webhook', (req, res) => {
  console.log(JSON.stringify(req.body));
  res.sendStatus(200);
});

app.listen(3000);
