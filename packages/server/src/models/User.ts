import mongoose from "mongoose";
import { userSchema } from "./schemas/user";
import bcrypt from "bcrypt";

userSchema.methods.toJSON = function () {
  return {
    id: this._id,
    email: this.email,
    name: this.name,
    username: this.username,
    role: this.role,
    emailVerified: this.emailVerified,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

userSchema.methods.comparePassword = function (candidatePassword : string, callback : Function ) {
  bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
    if (err) {
      return callback(err);
    }
    callback(null, isMatch);
  });
};

module.exports.hashPassword = async (password : string) => {
  const hashedPassword = await new Promise((resolve, reject) => {
    bcrypt.hash(password, 10, function (err, hash) {
      if (err) {
        reject(err);
      } else {
        resolve(hash);
      }
    });
  });

  return hashedPassword;
};

export const User = mongoose.model("User", userSchema);
