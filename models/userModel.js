/* eslint-disable func-names */
const mongoose = require('mongoose');
const validator = require('validator');
/* const bcrypt = require('bcryptjs');
const crypto = require('crypto'); */

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true
    },
    phoneNumber: {
      required: [true, 'Yser must have a phone number'],
      type: String,
      unique: true,
      validate: [validator.isMobilePhone, 'Please enter your phone number']
    },
    email: {
      type: String
    },
    location: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point']
      },
      coordinates: [Number],
      address: String
    },
    achievements: {
      type: Array
    },
    role: {
      type: String,
      enum: ['user', 'organization'],
      default: 'user'
    },
    photo: {
      type: String
    },
    interests: {
      type: [String]
    }, 
    budget: {
      type: String,
      trim: true
    },
    active: {
      type: Boolean,
      default: true,
      select: false
    },
    activated: {
      type: Boolean,
      default: false
    },
    CreatedAt: {
      type: Date,
      default: Date.now()
    }
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

userSchema.index({ location: '2dsphere' }, { user: 1, pet: 1 }, { unique: true });

userSchema.virtual('posts', {
  ref: 'Pet',
  foreignField: 'user',
  localField: '_id'
});

userSchema.pre(/^find/, function(next) {
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.isPhoneNumberChanged = function(jwtiat) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);

    return changedTimestamp > jwtiat;
  }
  return false;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
