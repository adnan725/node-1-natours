const express = require('express');
const app = express();

const fs = require('fs');
const morgan = require('morgan');

app.use(express.json());

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);

const users = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/users.json`)
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

// Third party middleware
app.use(morgan('dev')); // it will give us inofrmation regarding request, status code etc

///////////////////////////////////////////////////////////////////
// Routes implimentation for 'TOURS' routes
///////////////////////////////////////////////////////////////////

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

///////////////////////////////////////////////////////////////////
// Routes implimentation for 'USERS' routes
///////////////////////////////////////////////////////////////////

// GET: this function is used in setting route below
const getAllUsers = (req, res) => {
  users
    ? res.status(200).json({
        status: 'Success',
        results: users.length,
        requestedAt: req.requestTime,
        data: {
          users,
        },
      })
    : res.status(404).send('No users found');
};

//POST: this function will be used in 'post' method for adding something to our users data

/////////////////////////////////////// GET all users //////////////////////////////////

const newAllUsers = (req, res) => {
  const updateUsers = users.map((user) => {
    return Object.assign(user, req.body);
  });

  fs.writeFile(
    `${__dirname}/dev-data/data/users.json`,
    JSON.stringify(updateUsers),
    (err) => {
      err
        ? res.status(40).json({
            status: 'Invalid',
            data: {
              message: 'Invalid Users',
            },
          })
        : res.status(200).json({
            status: 'success',
            data: {
              users: updateUsers,
            },
          });
    }
  );
};

/////////////////////////////////////// get a user //////////////////////////////////
const getUser = (req, res) => {
  const id = req.params.id * 1;
  const user = users[id];

  id < users.length
    ? res.status(200).json({
        status: 'success',
        data: {
          user,
        },
      })
    : res.status(404).json({
        status: 'Invalid',
        data: {
          message: 'Invalid user',
        },
      });
};

/////////////////////////////////////// update user //////////////////////////////////

const updateUser = (req, res) => {
  const id = req.params.id * 1;

  if (id < users.length - 1) {
    const user = users[id];
    const updatedUser = Object.assign(user, (user.email = req.body));

    res.status(200).json({
      status: 'success',
      data: {
        updatedUser,
      },
    });
  } else {
    res.status(404).json({
      status: 'Invalid',
      data: {
        message: 'Invalid Id',
      },
    });
  }
};

/////////////////////////////////////// delete a user //////////////////////////////////

const deleteUser = (req, res) => {
  const id = req.params.id * 1;

  if (id < users.length - 1) {
    const userAfterDeleting = users.filter((user) => user !== users[id]);

    res.status(200).json({
      status: 'success',
      data: {
        userAfterDeleting,
      },
    });
  } else {
    res.status(404).json({
      status: 'Invalid',
      data: {
        message: 'Invalid Id',
      },
    });
  }
};

// here 'route' takes the URL where a request is to be sent, and 'get' responds to the request with responce
app.route('/api/v1/users').get(getAllUsers).post(newAllUsers); // multiple requests at same URL
app
  .route('/api/v1/users/:id')
  .get(getUser)
  .patch(updateUser)
  .delete(deleteUser); // with :id params

const port = 3000;

// Listen to the server
app.listen(port, () => {
  console.log(`Running on the port ${port}`);
});
