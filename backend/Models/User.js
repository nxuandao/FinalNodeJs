const mongoose = require('mongoose');

// const addressSchema = new mongoose.Schema({
//   street: { type: String, required: false },
//   city: { type: String, required: false },
//   houseNumber: { type: String, required: false },
//   ward: { type: String, required: false }
// }, { _id: false }); 
const addressSchema = new mongoose.Schema({
  label: { type: String, default: "" },
  line: { type: String, default: "" },         
  city: { type: String, default: "" },
  district: { type: String, default: "" },
  ward: { type: String, default: "" },
  phone: { type: String, default: "" },
  isDefault: { type: Boolean, default: false }
});


const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  avatar: {
  type: String,
  default: ""
},
  addresses: {
    type: [addressSchema],
    default: []
  },
  loyaltyPoints: { type: Number, default: 0 },

  role: {  
    type: String,
    enum: ["user", "admin", "manager"], 
    default: "user"
  },
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active"
  },
  isVerified: {                
    type: Boolean,
    default: false
  },
  verificationToken: {         
    type: String
  },
  verificationTokenExpiry: {
    type: Date
  },
  resetToken: { type: String },
  resetTokenExpiry: { type: Date },
  activity_log: {
    type: [
      {
        action: { type: String },
        ip: { type: String },
        userAgent: { type: String },
        time: { type: Date, default: Date.now }
      }
    ],
    default: []
  }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema, 'user');
