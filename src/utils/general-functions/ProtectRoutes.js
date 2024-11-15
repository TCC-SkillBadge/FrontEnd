import React from "react";
import { Navigate } from "react-router-dom";

export const protectRoute = (Component) => {
    const ProtectedRoute = (props) => {
        const token = sessionStorage.getItem("token");
        if(token){
            return <Component {...props} />;
        }
        else{
            return <Navigate to="/" />;
        }
    };
    return ProtectedRoute;
};