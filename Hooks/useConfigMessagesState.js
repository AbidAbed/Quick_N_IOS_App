function useConfigMessagesState() {
  return {
    isEndReached: false,
    isTopReached: false,
    isNoEnd: false,
    isNoTop: false,
    topMessageId: null,
    bottomMessageId: null,
    currentYPosition: 0,
    messages: [],
    contentHeight: 0,
    flatListHeight: 0,
    isInitialFetch: false,
    messageText: '',
    isNewMessage: false,
    isUserScrolling: true,
    hiddenFromUsers: [],
    isHiddenMode: false,
    isSwiping: false,
    isHideFromMembersPopupOpen: false,
    chatMembers: [],
    isRecording: false,
    isDoneFetching: false,
    isMessageInputFocused: false,
  };
}
export default useConfigMessagesState;
