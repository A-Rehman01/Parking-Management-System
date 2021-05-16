import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Agenda } from 'agenda';

dotenv.config();

const customerSchema = mongoose.Schema(
  {
    customerID: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    parkingID: {
      type: String,
      required: true,
    },
    parkingname: {
      type: String,
      required: true,
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
    // customers: [customerSchema],
    customers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

customerSchema.methods.changeIsExpiredStatus = async function (parkingID) {
  const agenda = new Agenda({ db: { address: process.env.MONGO_URI } });

  agenda.define('Expired Status', async (job) => {
    const { _id, slots } = job.attrs.data;
    // console.log({ slots });
    await Customer.findByIdAndUpdate(
      _id,
      { isExpired: true },
      async function (err, docs) {
        if (err) {
          console.log(err);
          // res.status(400);
          // throw new Error('Not Update');
          return false;
        } else {
          const parking = await Parking.findById(parkingID);
          parking.occupied = parking.occupied - slots;
          await parking.save();
        }
      }
    );
  });

  await agenda.start();
  await agenda.schedule(new Date(this.enddate), 'Expired Status', {
    _id: this._id,
    slots: this.slots,
  });
};

parkingSchema.virtual('availability').get(function () {
  return this.capacity - this.occupied;
});

const Customer = mongoose.model('Customer', customerSchema);
export { Customer };

const Parking = mongoose.model('Parking', parkingSchema);

export default Parking;
