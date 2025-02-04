import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/apiError.js";
import jwt from "jsonwebtoken";
import {User} from "../model/user.model.js"

export const verifyJWT  = asyncHandler(async (req,res,next)=>{
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","");
        if(!token){
            throw new ApiError(401,"Unauthorized request!!");
        }
        // console.log("Token --> ",token,process.env.ACCESS_TOKEN_SECRET)
        const decodedToken = await jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
        // console.log("decodedToken --> ",decodedToken)
    
        const user = await User.findById(decodedToken._id).select("-password -refreshToken");
        // console.log("user --> ",user)
    
        if(!user){
            throw new ApiError(401,"Invalid access token!!");
        }
    
        req.user = user;
        next();
    } catch (error) {
        console.log("error --> ",error?.message)
        throw new ApiError(401,error?.message || "Invalid Access Token!!");
    }
})