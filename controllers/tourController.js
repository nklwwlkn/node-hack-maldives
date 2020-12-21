const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');
// eslint-disable-next-line no-unused-vars
const AppError = require('../utils/appError');
// eslint-disable-next-line no-unused-vars
const authController = require('./authController');
const factory = require('./handlerFactory');


/* exports.topTours = (req, res, next) => {
  req.query.limit = 5;
  req.query.sort = 'price, -ratingsAverage';
  req.query.fields = 'name,price, ratingsAverage, duration';
  next();
};
 */


/* exports.resizePetPhoto = catchAsync(async (req, res, next) => {
  if (!req.file || !req.files) return next();

  req.files = await sharp(req.files)
    .resize({ width: 100 })
    .toFormat('jpeg')
    .jpeg({ quality: 90 });

  next();
}); */

exports.getAllTours = factory.getAll(Tour);
exports.getTour = factory.getOne(Tour, { path: 'tours' });
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);

exports.createTour = catchAsync(async (req, res) => {
  const doc = await Tour.insertMany(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      data: doc
    }
  });
});

exports.setUsersToursId = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user;
  next();
};

/* 
exports.getTourStats = catchAsync(async (req, res, next) => { 
/*  Aggregtionpipeline: */

/* const stats = await Tour.aggregate([
    { $match: { ratingsAverage: { $gte: 3 } } },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice:  $ax: '$price' }
      }
    },
    {
      $sort: { avgPrice: 1 }
    }
  ]);

  res.status(201).json({
    status: 'success',
    data: {
      stats
    }
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1; // 2021
  const stats = await Tour.aggregate([
    {
      $unwind: '$startDates'
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`)
        }
      }
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTours: { $sum: 1 },
        tours: { $push: '$name' }
    }
  {
      $addFields: {
        month: '$_id'
      }
    },
    {
      $project: {
        _id: 0
      }
    },
    {
      $sort: {
        numTours: -1
      }
    }
  ]);

  res.status(201).json({
    status: 'sucess',
    data: {
      stats
    }
  });
}); */

/* /tours-within/:distance/center/48.662294, 44.440576/unit/:unit */

/* exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  console.log(latlng);
  const [lat, lng] = latlng.split(',');

  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng) {
    next(new AppError('Please provide correct lat and lng'), 401);
  }

  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
  });

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      data: tours
    }
  });
});
 */
/* 

exports.getToursDistance = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

  if (!lat || !lng) {
    next(new AppError('Please provide correct lat and lng'), 401);
  }

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: { type: 'Point', coordinates: [lng * 1, lat * 1] },
        distanceField: 'distance',
        distanceMultiplier: multiplier
      }
    },
    {
      $project: {
        distance: 1,
        name: 1
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    results: distances.length,
    data: {
      data: distances
    }
  });
});
 */
