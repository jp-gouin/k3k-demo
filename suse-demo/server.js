const express = require('express');
const app = express();

app.get('/env', (req, res) => {
  res.json({
    nodeName: process.env.NODE_NAME,
    podName: process.env.POD_NAME
  });
});

app.use(express.static('./dist'));

const port = 8080;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});