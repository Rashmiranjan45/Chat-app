import { Schema, model } from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      select: true,
    },
    bio:{
      type:String,
      required:true
    },
    avatar: {
      // Cloudinary
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
    refreshToken: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);




userSchema.pre("save",async function(next){
  if (!this.isModified("password")) return next()
  this.password = await bcrypt.hash(this.password,10)
  next()
})

userSchema.methods.isPasswordCorrect = async function(password) {
  return await bcrypt.compare(password,this.password)
}

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      name: this.name,
      username: this.username,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};


const User = model("User", userSchema);


export default User
