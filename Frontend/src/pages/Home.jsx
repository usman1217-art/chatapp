import ChatSidebar from "../components/chat/ChatSidebar";
import ChatWindow from "../components/chat/ChatWindow";

function Home(){

return(

<div
className="h-screen flex bg-[#0a192f] overflow-hidden"
>

<ChatSidebar/>

<ChatWindow/>

</div>

);

}

export default Home;
