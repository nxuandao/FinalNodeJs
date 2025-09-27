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

const signupValidation = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(30).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().pattern(new RegExp('^[0-9]{10}$')).required(),
    password: Joi.string().min(6).required(),
    address: Joi.object({
      street: Joi.string().optional(),
      city: Joi.string().optional(),
      houseNumber: Joi.string().optional(),
      ward: Joi.string().optional()
    }).optional(),   
    activity_log: Joi.array().items(
      Joi.object({
        action: Joi.string(),
        ip: Joi.string(),
        userAgent: Joi.string(),
        time: Joi.date()
      })
    ).optional(),
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
    signupValidation
    , loginValidation
}
