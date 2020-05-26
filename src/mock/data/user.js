import Mock from 'mockjs';
const LoginUsers = [
  {
    id: 1,
    username: 'admin',
    password: '123456',
    avatar: 'https://github.com/qtppy/frontend_qtppy/blob/master/src/assets/user.png',
    name: '天枢'
  }
];

const Users = [];

for (let i = 0; i < 86; i++) {
  Users.push(Mock.mock({
    id: Mock.Random.guid(),
    name: Mock.Random.cname(),
    desc: Mock.mock('@county(true)'),
    'creator|18-60': 1,
    create_time: Mock.Random.date(),
    status: Mock.Random.integer(0, 1)
  }));
}

export { LoginUsers, Users };
