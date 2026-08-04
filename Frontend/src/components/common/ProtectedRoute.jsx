import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function ProtectedRoute({ children }) {

    const {
        user,
        loading,
    } = useAuth();

    if(loading){

        return (
            <div className="h-screen flex items-center justify-center bg-[#0a192f]">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-slate-400 text-sm">Loading your chats...</p>
                </div>
            </div>
        );

    }

    if(!user){

        return <Navigate to="/login"  replace/>

    }

    return children;

}

export default ProtectedRoute;
