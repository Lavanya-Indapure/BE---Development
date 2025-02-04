import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../model/user.model.js";
import { uploadFiles } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();
        user.refreshToken = refreshToken;

        const response = await user.save({ validateBeforeSave: false });
        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access token!!");
    }
}
const registerUser = asyncHandler(async (req, res) => {
    console.log("<-- START RESISTER API CALL -->");

    const { fullname, username, email, password, coverImage, avatar } = req.body;
    if (
        [fullname, username, email, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, `All feilds are required!!`);
    }

    const existingUser = await User.findOne({
        $or: [{ username }, { email }],
    });

    // console.log("existingUser --> ",existingUser)
    if (existingUser) {
        throw new ApiError(409, `User with username or email already exists!!`);
    }

    // console.log('Files - avatar: ',req.files?.avatar)
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    // console.log("avatarLocalPath -> ",avatarLocalPath);

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is requied!!");
    }

    const uploadedAvatar = await uploadFiles(avatarLocalPath);
    const uploadedCoverImage = await uploadFiles(coverImageLocalPath);

    // console.log("uploadedAvatar-->",uploadedAvatar?.url)
    if (!uploadedAvatar) {
        throw new ApiError(400, "Avatar file is requied!!");
    }
    const user = await User.create({
        fullname,
        avatar: uploadedAvatar.url,
        coverImage: uploadedCoverImage?.url || "",
        email,
        password,
        username: username.toLowerCase(),
    });

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering user!!");
    }

    return res
        .status(201)
        .json(new ApiResponse(200, createdUser, "User registered successfully!!"));
});

const loginUser = asyncHandler(async (req, res) => {
    const { username, password, email } = req.body;

    if (!(username || email)) {
        throw new ApiError(400, "username or email is required");
    }

    const user = await User.findOne({
        $or: [{ email }, { username }]
    })

    if (!user) {
        throw new ApiError(404, "User does not exist!");
    }

    const isPasswordCorrect = await user.isPasswordCorrect(password);

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Incorrect password!");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const options = {
        httpOnly: true, //*
        secure: true, //* cookies become modifiable only from server and cannot be modified from FE by using 'httpOnly:true' and 'secure:true'.
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(200, {
                user: loggedInUser,
                refreshToken,
                accessToken
            },
                "User logged in successfully!!"
            )
        )
})

const logoutUser = asyncHandler(async (req, res) => {
    User.findByIdAndUpdate(req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        })

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .clearCookie("refreshToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out!!"))
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request!!");
    }
    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
        const user = await User.findById(decodedToken?._id)
        if (!user) {
            throw new ApiError(401, "Invalid Refresh Token!!");
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used!!");
        }

        const options = {
            httpOnly: true,
            secure: true
        }
        const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(200, { accessToken, refreshToken }, "Access token refreshed!!")
            )
    }
    catch (error) {
        throw new ApiError(400, error?.message || "Invalid refresh token!!");
    }
})
export { registerUser, loginUser, logoutUser, refreshAccessToken };
