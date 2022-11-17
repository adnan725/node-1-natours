const express = require('express');
const app = express();

const fs = require('fs');

app.use(express.json());

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);

/////////////////////////// Middleware //////////////////////////

// middleware has 're1', 'res', and 'next' as an arguments, where 'next' is a function
app.use((req, res, next) => {
  console.log('Hello from the Middleware');
  next(); // if we don't call next(), the next middleware will not be executed
});

// Let's manipulate the middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  req.reuestedBy = 'Adnan Ali';
  next();
});

/////////////////////////////// GET Method //////////////////////////////////

// 'get' is a http method which specifies something to happen against a certain ULR

app.get('/api/v1/tours', (req, res) => {
  res.status(200).json({
    status: 'success',
    results: tours.length,
    requestedAt: req.requestTime, // added this with middleware
    requestedBy: req.reuestedBy, // added this with middleware
    data: {
      tours,
    },
  });
});

////////////////////////////// POST Method ////////////////////////////////////

// 'post' is a http method whihc is used to write something in data in database
app.post('/api/v1/tours', (req, res) => {
  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body);
  tours.push(newTour);

  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      res.status(201).json({
        status: 'success',
        data: {
          tours: newTour,
        },
      });
    }
  );
});

app.get('/api/v1/tours/:tourId', (req, res) => {
  const id = req.params.tourId;
  const singleTour = tours.find((tour) => tour.id === +id); // '+' converts 'id' to a 'number' from 'string'
  singleTour
    ? res.status(200).json({
        status: 'success',
        data: {
          tour: singleTour,
        },
      })
    : res.status(404).json({
        status: 'Invalid',
        message: 'Invalid Id',
      });

  // fs.writeFile(
  //   `${__dirname}/dev-data/data/my-tour.json`,
  //   JSON.stringify(singleTour),
  //   (err) => {
  //     res.send(err);
  //   }
  // );
});

///////////////////////////////// PATCH Method //////////////////////////////////

// PATCH method used to update some part of the object in available backend data

app.patch('/api/v1/tours/:id', (req, res) => {
  const id = req.params.id * 1;

  if (id < tours.length) {
    const findTour = tours.find((tour) => tour.id === id);

    // after finding specific tour, we updated the 'duration' property of the tour
    const updateTour = Object.assign(findTour, (findTour.duration = req.body));

    //Added the updated tour to the list of all tours
    const updatedAllTour = Object.assign(tours, (tours[id] = updateTour));

    res.status(200).json({
      status: 'success',
      data: {
        tour: updatedAllTour,
      },
    });
  }

  res.status(404).json({
    status: 'Invalid',
    data: { message: 'Invalid Id' },
  });
});

/////////////////////////////// DELETE Method ///////////////////////////////

app.delete('/api/v1/tours/:id', (req, res) => {
  const id = req.params.id * 1;

  if (id < tours.length) {
    const toursAfterDeletion = tours.filter((tour) => tour.id !== id);

    res.status(204).json({
      status: 'success',
      data: {
        tours: toursAfterDeletion,
      },
    });
  }

  res.status(404).json({
    status: 'Invalid',
    tours: { message: 'Invalid Id' },
  });
});

const port = 3000;

// Listen to the server
app.listen(port, () => {
  console.log(`Running on the port ${port}`);
});
