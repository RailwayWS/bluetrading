import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./login.css";
import bgImage from "../../assets/hero2.webp";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate authentication delay
        setTimeout(() => {
            setIsLoading(false);
            navigate("/admin/dashboard");
        }, 1500);
    };

    return (
        <div
            className="login-container"
            style={{ backgroundImage: `url(${bgImage})` }}
        >
            <div className="login-glass-card">
                {/* Moved inside the glass card and above the form */}
                <div className="login-welcome-content">
                    <h1>Admin Dashboard</h1>
                    <p>Welcome back! Please log in to manage your content.</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="login-input"
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="login-input"
                    />
                    <button
                        type="submit"
                        className="login-button"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <div className="login-loader"></div>
                        ) : (
                            "Login"
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
