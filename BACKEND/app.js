//a basic node express application

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require('cors');
const port = 5000;

const HttpError = require("./models/http-error");

const placesRoutes = require("./routes/places-routes"); // importing a file in express
const usersRoutes = require("./routes/users-routes");

const app = express();

app.use(bodyParser.json());
app.use(cors());

app.use("/api/places", placesRoutes); //if the path starts with /api/places
app.use("/api/users", usersRoutes);

app.use((req, res, next) => {
  throw new HttpError("Could not find this route.", 404);
});

app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || "An unknown error occurred!" });
}); //this is a special middle ware which will execute if any middle ware in front of it yields an error.

mongoose.connect('mongodb+srv://visited-places-app:Qpzopeg5zuVC3A7W@cluster0.asyms.mongodb.net/mern?retryWrites=true&w=majority&appName=Cluster0')
.then(() => {
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  } );
})
.catch((err) => {
  console.log(err);
});
