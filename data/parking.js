import moment from 'moment';

const parkings = [
  {
    parkingname: 'PlanZParking',
    capacity: 20,
    customers: [
      {
        name: 'Salman',
        startdate: new Date(Date.now()),
        enddate: new Date(Date.now()).setDate(
          new Date(Date.now()).getDate() + 1
        ),
        carnumber: '0000',
        slots: 3,
      },
      //   {
      //     name: 'ALi',
      //     startdate: new Date(),
      //     enddate: new Date.setDate(new Date.getDate() + 1),
      //     carnumber: '1000',
      //     slots: 7,
      //   },
    ],
  },
];

export default parkings;
