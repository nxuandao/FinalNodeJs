const Joi = require('joi');

// const signupValidation = (req, res, next)=>{
//     const schema = Joi.object({
//         name: Joi.string().min(3).max(30).required(),
//         email: Joi.string().email().required(),
//         phone: Joi.string().pattern(new RegExp('^[0-9]{10}$')).required(),
//         password: Joi.string().min(6).required(),
//         address: Joi.object({
//         street: Joi.string().required(),
//         city: Joi.string().required(),
//         houseNumber: Joi.string().required(),
//         ward: Joi.string().required()
//   }).required(),
//   activity_log: Joi.array().items(Joi.date())
//     })
//     const { error } = schema.validate(req.body);
//     if(error){
//         return res.status(400).json({message: "Bad Request", details: error.details});
//     }
//     next();
// }

const jwt = require("jsonwebtoken");

const authenticateJWT = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // "Bearer token"

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // chứa { id, email, role }
    next();
  } catch (err) {
    return res.status(403).json({ message: "Forbidden" });
  }
};


const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden: You don’t have access" });
    }
    next();
  };
};




const signupValidation = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(30).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().pattern(new RegExp('^[0-9]{10}$')).required(),
    password: Joi.string().min(6).required(),
    address: Joi.object({
      street: Joi.string(),
      city: Joi.string(),
      houseNumber: Joi.string(),
      ward: Joi.string()
    }).optional(),
    activity_log: Joi.array().items(
      Joi.object({
        action: Joi.string(),
        ip: Joi.string(),
        userAgent: Joi.string(),
        time: Joi.date()
      })
    ).optional(),
    role: Joi.string().valid("user", "admin", "manager").default("user"),
    status: Joi.string().valid("active", "inactive").default("active"),
    resetToken: Joi.string().optional(),
    resetTokenExpiry: Joi.date().optional()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: "Bad Request", details: error.details });
  }
  next();
};


module.exports = {
    signupValidation
}

const loginValidation = (req, res, next)=>{
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
    })
    const { error } = schema.validate(req.body);
    if(error){
        return res.status(400).json({message: "Bad Request", details: error.details});
    }
    next();
}

module.exports = {
    signupValidation,
    loginValidation,
    authenticateJWT,
    authorizeRoles
}
