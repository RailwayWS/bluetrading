import React, { useEffect } from "react";
import NProgress from "nprogress";
import "nprogress/nprogress.css";

const Loading = () => {
    useEffect(() => {
        NProgress.start(); // Start the progress bar

        return () => {
            NProgress.done(); // Cleanup in case the component unmounts
        };
    }, []);

    return (
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 9999,
            }}
        >
            <h2>Loading content...</h2>
        </div>
    );
};

export default Loading;
