const { v7: uuidv7 } = require("uuid"); //unique user Identification version four this version also have time stamp in it.
const { validationResult } = require("express-validator");
const mongoose = require('mongoose');

const HttpError = require("../models/http-error");
const getCordsForAddress = require("../util/location");
const Place = require("../models/place");
const User = require("../models/user");
/*
let DUMMY_PLACES = [
  {
    id: "p1",
    title: "Empire State Building",
    description: "One of the most famous sky scrapers in the world",
    location: {
      lat: 40.7484474,
      lng: -73.9871516,
    },
    address: "20 W 34th st, New York, NY 10001",
    creator: "u1",
  },
];
*/
const getPlaceById = async (req, res, next) => {
  // async is not required for DUMMY_PLACES
  const placeId = req.params.pid; // { pid: 'p1' }

  let place;
  try {
    place = await Place.findById(placeId); // do not return a promise, so no need for .exce()
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not find a place.",
      500
    );
    return next(error);
  }

  if (!place) {
    return next ( new HttpError(
      "Could not find a place for the provided place Id",
      404
    ));
  }

  res.json({ place: place.toObject({ getters: true }) }); // => {place} => {place: place}
};

const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid;
  
  let userWithPlaces;
  try {
    userWithPlaces = await User.findById(userId).populate('places'); 
  } catch (err) {
    const error = new HttpError(
      "Fetching places failed, please try again later.",
      500
    );
    return next(error);
  }

  // if (!places || places.length === 0)
  if (!userWithPlaces || userWithPlaces.places.length === 0) {
    return next(
      new HttpError("Could not find a place for the provided user Id", 404)
    );
  }

  res.json({
    places: userWithPlaces.places.map((place) => place.toObject({ getters: true })),
  });
};

const createPlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return next(
      new HttpError("Invalid inputs passed, please check you data", 422)
    );
  }

  const { title, description, address, creator } = req.body;

  let coordinates;
  try {
    coordinates = await getCordsForAddress(address);
  } catch (error) {
    return next(error);
  }
  // const title = req.body.title (what we did is a shortcut for this);
  // const createdPlace = Place({
  const createdPlace = new Place({
    title, // title: title
    description,
    address,
    location: coordinates,
    image:
      "https://img.freepik.com/free-photo/swimming-pool_74190-2104.jpg?t=st=1728574674~exp=1728578274~hmac=903c8d085ab11281f2118b9657e2f930545b13fdce8899f0cd9bfb57934ea1b6&w=1060",
    creator,
  }); //these properties should be the same in quantity and arrangement with the schema properties.

  let user;
  try {
    user = await User.findById(creator);
  } catch (err) {
    const error = new HttpError("Creating place failed, please try again", 500);
    return next (error);
  }

  if (!user) {
    const error = new HttpError('Could not find user for the provided Id', 404);
    return next (error);
  } // this code isn't necessary anymore.

  console.log(user);

  try {
    // await createdPlace.save(); //b4 mergin places with users
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdPlace.save({ session: sess });
    user.places.push(createdPlace); //not the conventional push it will automatically add the created place to the user.
    await user.save({ session: sess });
    await sess.commitTransaction();
    // Note: this doesn't automatically create collection on mongodb database. you have to create your collection manually.
  } catch (err) {
    const error = new HttpError(
      "Creating place failed, please try again.",
      500
    );
    return next(error);
  }

  // DUMMY_PLACES.push(createdPlace); //unshift(createdPlace) (to be added as the first element)

  res.status(201).json({ place: createdPlace }); //status code 201 for a new creation
};

const updatePlace = async (req, res, next) => {
  const errors = validationResult(req);
  /*
    if (!errors.isEmpty()) {
      console.log(errors);
      throw new HttpError("Invalid inputs passed, please check you data", 422);
    }

    const { title, description } = req.body;
    const placeId = req.params.pid;

    const updatedPlace = { ...DUMMY_PLACES.find((p) => p.id === placeId) }; //spread operator returning all the previous value of the DUMMY_PLACES
    const placeIndex = DUMMY_PLACES.findIndex((p) => p.id === placeId); //Note: find should not be used in the place of findIndex

    updatedPlace.title = title;
    updatedPlace.description = description;

    DUMMY_PLACES[placeIndex] = updatedPlace;

    res.status(200).json({ place: updatedPlace }); //status code 200 for updating a created place 
  */

  if (!errors.isEmpty()) {
    console.log(errors);
    return next(
      new HttpError("Invalid inputs passed, please check you data", 422)
    );
  }

  const { title, description } = req.body;
  const placeId = req.params.pid;

  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not update place.",
      500
    );
  }

  place.title = title;
  place.description = description;

  try {
    await place.save();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not update place.",
      500
    );
    return next(error);
  }

  res.status(200).json({ place: place.toObject({ getters: true }) });
};

const deletePlace = async (req, res, next) => {
  const placeId = req.params.pid;
  /*
    if (!DUMMY_PLACES.find((p) => p.id === placeId)) {
      throw new HttpError("Could not find a place for that Id.", 404);
    }
    DUMMY_PLACES = DUMMY_PLACES.filter((p) => p.id !== placeId);
  */

  let place;
  try {
    place = await Place.findById(placeId).populate('creator') // populate allows us to refer to a document stored in a collection and to work with the data in that existing document. this makes use of 'ref:' that must have been established in both connection.;
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not find place to delete.",
      500
    );
    return next(error);
  }

  if (!place) {
    const error = new HttpError('Could not find place for this id.', 404);
    return next (error);
  }

  try {
    // await place.deleteOne();
    const sess = await mongoose.startSession();
    sess.startTransaction();
    place.remove({session: sess});
    place.creator.places.pull(place); //pull will automatically remove the ID.
    await place.creator.save({session: sess});
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not delete place.",
      500
    );
    return next(error);
  }
  /////////////////
  res.status(200).json({ message: "Deleted place." });
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
