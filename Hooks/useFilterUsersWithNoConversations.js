function useFilterUsersWithNoConversations({userConversations, users, user}) {
  const singleChatUsersIds = userConversations.reduce((prev, curr) => {
    if (curr.isGroup) return [...prev];
    const isUserAConversation = curr.members.find(
      member => member !== user._id,
    );
    //console.log(isUserAConversation);

    if (isUserAConversation) return [...prev, isUserAConversation];
    else return [...prev];
  }, []);

  const usersWithNoConversations = users.reduce((prev, curr) => {
    const isUsrFound = singleChatUsersIds.find(usrId => usrId === curr._id);

    if (isUsrFound || curr._id === user._id) return [...prev];
    else
      return [
        ...prev,
        {...curr, convName: curr.username, isAConversation: false},
      ];
  }, []);
  return usersWithNoConversations;
}

export default useFilterUsersWithNoConversations;
