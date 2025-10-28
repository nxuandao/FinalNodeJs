// src/utils/auth.js
const API_BASE =
    process.env.REACT_APP_API_BASE ??
    process.env.API_BASE ?? // phòng khi bạn tự define
    "http://localhost:8080";

export async function getAuthStatus() {
    const token = localStorage.getItem("token");
    try {
        const res = await fetch(`${API_BASE}/auth/status`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        return await res.json();
    } catch {
        return { authenticated: false };
    }
}
