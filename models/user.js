const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  userId: { type: String, unique: true, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  phone: { type: String },
});

// Export model
const user = mongoose.model("User", UserSchema);
module.exports = user;
