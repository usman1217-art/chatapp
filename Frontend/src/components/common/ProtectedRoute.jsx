import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function ProtectedRoute({ children }) {

    const {
        user,
        loading,
    } = useAuth();

    if(loading){

        return (
            <div className="w-full relative z-10">
                <div className="h-screen flex items-center justify-center bg-transparent">
                    <div className="flex flex-col items-center gap-5">
                        <img src="/image.png" alt="Loading..." className="w-24 h-32 object-cover rounded-xl animate-[pulse_1.5s_ease-in-out_infinite] drop-shadow-[0_0_20px_rgba(255,255,255,0.2)] dark:drop-shadow-[0_0_20px_rgba(220,38,38,0.5)]" />
                        <p className="text-slate-900 dark:text-slate-400 font-bold tracking-widest text-xs uppercase animate-pulse">Loading secure session...</p>
                    </div>
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
