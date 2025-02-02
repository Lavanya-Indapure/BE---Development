import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../model/user.model.js";
import { uploadFiles } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";

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

export { registerUser };
