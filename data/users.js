import bcryptjs from 'bcryptjs';

const users = [
  {
    name: 'Admin',
    email: 'admin@example.com',
    password: bcryptjs.hashSync('123456', 10),
    isAdmin: true,
  },
  {
    name: 'John Doe',
    email: 'John@example.com',
    password: bcryptjs.hashSync('123456', 10),
  },
  {
    name: 'AR',
    email: 'AR@example.com',
    password: bcryptjs.hashSync('123456', 10),
  },
];
export default users;
