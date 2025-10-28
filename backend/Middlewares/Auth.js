const jwt = require('jsonwebtoken');
const ensureAuthenticated = (req, res, next) => {
    const auth = req.headers['authorization'];
    if (!auth) {
        return res.status(403).json({ message: "Unauthorized, JWT token wrong or expired" });
    }
    try {
        let token = auth;
        if (typeof auth === 'string' && auth.toLowerCase().startsWith('bearer ')) {
            token = auth.slice(7).trim();
        }
        const decoded = jwt.verify(auth, process.env.JWT_SECRET);
        req.user = decoded;

        req.authToken = token;       // (tuỳ chọn) lưu lại token nếu cần dùng tiếp
        return next();
    } catch (err) {
        return res.status(403).json({ message: "Unauthorized, JWT token wrong or expired" });
    }


}
module.exports = {
    ensureAuthenticated
};

