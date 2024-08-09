import DeleteMessageMenuOption from '../Components/MessageMenueOptions/AdminOnly/DeleteMessageMenuOption';
import EditMessageMenuOption from '../Components/MessageMenueOptions/AdminOnly/EditMessageMenuOption';
import HideFromAllMembersMessageMenuOption from '../Components/MessageMenueOptions/AdminOnly/HideFromAllMembersMessageMenuOption';
import HideFromSingleMemberMessageMenuOption from '../Components/MessageMenueOptions/AdminOnly/HideFromSingleMemberMessageMenuOption';
import UnhideMessageMenuOption from '../Components/MessageMenueOptions/AdminOnly/UnhideMessageMenuOption';
import FavoriteMessageMenuOption from '../Components/MessageMenueOptions/AllUsers/FavoriteMessageMenuOption';
import ForwardMessageMenuOption from '../Components/MessageMenueOptions/AllUsers/ForwardMessageMenuOption';

function useConfigMessageMenuOption({
  message,
  setMessages,
  messages,
  onlineUsers,
  hiddenFromUsers,
  user,
  conversation,
  setIsEditingParentState,
  setIsForwardMessageModalOpen,
  setMessageState,
  setIsHiddenFromPopupOpen,
  setHiddenMode,
  setHiddenFromUsers,
}) {
  if (message?.sender === user?._id) {
    if (user?.isAdmin) {
      if (conversation?.isGroup) {
        return [
          <DeleteMessageMenuOption
            message={message}
            key="deleteMsg"
            setMessages={setMessages}
            onlineUsers={onlineUsers}
            hiddenFromUsers={hiddenFromUsers}
            messages={messages}
          />,
          message.file === null && (
            <EditMessageMenuOption
              key="editMsg"
              setIsEditingParentState={setIsEditingParentState}
            />
          ),
          <ForwardMessageMenuOption
            key="forward"
            setIsForwardMessageModalOpen={setIsForwardMessageModalOpen}
          />,
          <FavoriteMessageMenuOption
            key="favourite"
            message={message}
            conversation={conversation}
            setMessageState={setMessageState}
          />,
          conversation?.members.length - message.hiddenFor.length > 1 && (
            <HideFromSingleMemberMessageMenuOption
              key="hide-single"
              setIsHiddenFromPopupOpen={setIsHiddenFromPopupOpen}
            />
          ),
          conversation?.members.length - message.hiddenFor.length > 1 && (
            <HideFromAllMembersMessageMenuOption
              key="hide-all"
              message={message}
              setMessageState={setMessageState}
              setHiddenMode={setHiddenMode}
              setHiddenFromUsers={setHiddenFromUsers}
            />
          ),
          message.hiddenFor.length !== 0 && (
            <UnhideMessageMenuOption
              key="unhide-all"
              message={message}
              setMessageState={setMessageState}
              setHiddenFromUsers={setHiddenFromUsers}
            />
          ),
        ];
      } else {
        return [
          <DeleteMessageMenuOption
            message={message}
            key="delete"
            setMessages={setMessages}
            onlineUsers={onlineUsers}
            hiddenFromUsers={hiddenFromUsers}
            messages={messages}
          />,
          message.file === null && (
            <EditMessageMenuOption
              key="editMsg"
              setIsEditingParentState={setIsEditingParentState}
            />
          ),
          <ForwardMessageMenuOption
            key="forward"
            setIsForwardMessageModalOpen={setIsForwardMessageModalOpen}
          />,
          <FavoriteMessageMenuOption
            key="favourite"
            message={message}
            conversation={conversation}
            setMessageState={setMessageState}
          />,
          conversation?.members.length - message.hiddenFor.length > 1 && (
            <HideFromAllMembersMessageMenuOption
              key="hide-all"
              message={message}
              setMessageState={setMessageState}
              setHiddenMode={setHiddenMode}
              setHiddenFromUsers={setHiddenFromUsers}
            />
          ),
          message.hiddenFor.length !== 0 && (
            <UnhideMessageMenuOption
              key="unhide-all"
              message={message}
              setMessageState={setMessageState}
              setHiddenFromUsers={setHiddenFromUsers}
            />
          ),
        ];
      }
    } else {
      return [
        <ForwardMessageMenuOption
          key="forward"
          setIsForwardMessageModalOpen={setIsForwardMessageModalOpen}
        />,
        <FavoriteMessageMenuOption
          key="favourite"
          message={message}
          conversation={conversation}
          setMessageState={setMessageState}
        />,
      ];
    }
  } else {
    if (user?.isAdmin) {
      if (conversation?.isGroup) {
        return [
          conversation?.members.length - message.hiddenFor.length > 1 && (
            <HideFromSingleMemberMessageMenuOption
              key="hide-single"
              setIsHiddenFromPopupOpen={setIsHiddenFromPopupOpen}
            />
          ),
          conversation?.members.length - message.hiddenFor.length > 1 && (
            <HideFromAllMembersMessageMenuOption
              key="hide-all"
              message={message}
              setMessageState={setMessageState}
              setHiddenMode={setHiddenMode}
              setHiddenFromUsers={setHiddenFromUsers}
            />
          ),
          message.hiddenFor.length !== 0 && (
            <UnhideMessageMenuOption
              key="unhide-all"
              message={message}
              setMessageState={setMessageState}
              setHiddenFromUsers={setHiddenFromUsers}
            />
          ),
        ];
      } else {
        return [
          conversation?.members.length - message.hiddenFor.length > 1 && (
            <HideFromAllMembersMessageMenuOption
              key="hide-all"
              message={message}
              setMessageState={setMessageState}
              setHiddenMode={setHiddenMode}
              setHiddenFromUsers={setHiddenFromUsers}
            />
          ),
          message.hiddenFor.length !== 0 && (
            <UnhideMessageMenuOption
              key="unhide-all"
              message={message}
              setMessageState={setMessageState}
              setHiddenFromUsers={setHiddenFromUsers}
            />
          ),
        ];
      }
    } else {
    }
  }
}
export default useConfigMessageMenuOption;
