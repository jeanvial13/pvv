const bcrypt = require('bcryptjs');

const password = 'admin123';
const hash = '$2a$10$LKQy.zK5aJ4wZ4zA03DQU.8P0fWJ46YfYkZNPyh0ITRXE4y3wQDXy';

bcrypt.compare(password, hash).then((res) => {
    console.log(`Password matches: ${res}`);
});
