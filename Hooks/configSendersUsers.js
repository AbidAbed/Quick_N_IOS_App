function configSendersUsers(users) {
  return users.reduce((prev, curr) => {
    return {...prev, [curr._id]: {...curr}};
  }, {});
}
export default configSendersUsers;
