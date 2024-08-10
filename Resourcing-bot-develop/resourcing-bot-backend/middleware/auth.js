


import jwt from "jsonwebtoken";
import { User } from "../models/mongoschema.js";


export const isAuthenticated = async (req, res, next) => {
  try {
      // Get the JWT token from the request cookies
      const {token} = req.cookies;
      if(!token)
      // If token is not present, return an error response
      return res.status(400).json({success:false,message: "Please login first to continue"});
      // Verify the JWT token using the JWT_SECRET from environment variables
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // Find the user based on the decoded user ID
      req.user = await User.findById(decoded._id);
      // Call the next middleware or route handler
      next();
  } catch (error) {
      // If an error occurs during authentication, return an error response
      res.status(500).json({success:false,message: error.message});

  }
}















