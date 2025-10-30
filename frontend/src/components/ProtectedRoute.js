import {Navigate} from 'react-router-dom';

//chặn người dùng không phải admin vào trang home
function ProtectedRoute({children, role}) {
    const userRole = localStorage.getItem('loggedInUserRole');
    if (!userRole) {
        return <Navigate to="/login" replace />;
    }

    if (role && userRole !== role) {
        return <Navigate to="/home" />;
    }
    return children;
}

export default ProtectedRoute;