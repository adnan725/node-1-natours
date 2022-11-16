const express = require('express');
const app = express();

const fs = require('fs');

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);

// 'get' is a http method which specifies something to happen against a certain ULR

app.get('/api/v1/tours', (req, res) => {
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours,
    },
  });
});

const port = 3000;

// Listen to the server
app.listen(port, () => {
  console.log(`Running on the port ${port}`);
});
