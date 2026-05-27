import React, { useEffect } from "react";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import "./loading.css";

const Loading = () => {
    useEffect(() => {
        NProgress.start();
        return () => NProgress.done();
    }, []);

    return (
        <div className="loading-container">
            <div className="loading-spinner"></div>
            <h2 className="loading-text">Preparing your experience...</h2>
        </div>
    );
};

export default Loading;
