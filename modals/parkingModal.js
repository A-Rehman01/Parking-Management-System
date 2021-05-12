import mongoose from 'mongoose';

const customerSchema = mongoose.Schema(
  {
    customerID: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    name: {
      type: String,
      required: true,
    },
    startdate: {
      type: Date,
      required: true,
    },
    enddate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: ['pending', 'cancel', 'active'],
        message: 'status must be pending,cancel or active',
      },
      default: 'pending',
    },
    carnumber: {
      type: String,
      required: true,
    },
    slots: {
      type: Number,
      required: true,
      min: [1, 'Minimum  1 Slots is Required '],
    },
    isExpired: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  { timestamps: true }
);

const parkingSchema = mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    parkingname: {
      type: String,
      required: true,
    },
    capacity: {
      type: Number,
      required: true,
      min: [1, 'Minimum  1 Capacity is Required to Create Parking Area'],
    },
    occupied: {
      type: Number,
      required: true,
      //   default: function () {
      //     return this.capacity;
      //   },
      default: 0,
    },
    customers: [customerSchema],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

parkingSchema.virtual('availability').get(function () {
  return this.capacity - this.occupied;
});

const Parking = mongoose.model('Parking', parkingSchema);

export default Parking;
