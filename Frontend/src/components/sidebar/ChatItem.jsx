import { useChat } from "../../context/ChatContext";
import { useAuth } from "../../context/AuthContext";

function ChatItem({ chat }) {

  const { user } = useAuth();

  const { selectedChat, setSelectedChat } = useChat();

  const otherUser = chat.participants.find(
    p => p._id !== user._id
  );

  const isSelected =
    selectedChat?._id === chat._id;

  return (

    <div
      onClick={() => setSelectedChat(chat)}
      className={`flex gap-3 p-4 cursor-pointer border-b hover:bg-gray-100 ${
        isSelected ? "bg-gray-100" : ""
      }`}
    >

      <img
        src={
          otherUser.avatar ||
          `https://ui-avatars.com/api/?name=${otherUser.name}`
        }
        className="w-12 h-12 rounded-full"
      />

      <div className="flex-1">

        <div className="flex justify-between">

          <h2 className="font-semibold">

            {otherUser.name}

          </h2>

          <span className="text-xs text-gray-500">

            {
              chat.lastMessage?.createdAt &&
              new Date(
                chat.lastMessage.createdAt
              ).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            }

          </span>

        </div>

        <p className="text-gray-500 truncate">

          {chat.lastMessage?.deletedForEveryone
            ? "Message deleted"
            : chat.lastMessage?.text ||
              "No messages"}

        </p>

      </div>

    </div>

  );

}

export default ChatItem;