import User from "../models/user.model.js";
import notification from "../models/notification.model.js";
import bcrypt from "bcryptjs";
import cloudinary from "cloudinary";

export const getProfile = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ error: "USER not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.log(`Error in get user profile ${error}`);
    res.status(500).json({ error: "Internal server ERROR" });
  }
};

export const followUnfollow = async (req, res) => {
  try {
    const { id } = req.params;
    const userToModify = await User.findById({ _id: id });
    const currentUser = await User.findById({ _id: req.user._id });

    if (id === req.user._id) {
      res.status(400).json({ error: "You cant follow/unfollow yourself" });
    }

    if (!userToModify || !currentUser) {
      res.status(400).json({ error: "User not found" });
    }

    const isFollowing = currentUser.following.includes(id);

    if (isFollowing) {
      await User.findByIdAndUpdate(
        { _id: id },
        { $pull: { followers: req.user.id } }
      );
      await User.findByIdAndUpdate(
        { _id: req.user._id },
        { $pull: { following: id } }
      );
      res.status(200).json({ message: "Unfollowed sucessfully" });
    } else {
      await User.findByIdAndUpdate(
        { _id: id },
        { $push: { followers: req.user._id } }
      );
      await User.findByIdAndUpdate(
        { _id: req.user.id },
        { $push: { following: id } }
      );
      const newNotification = new notification({
        type: "follow",
        from: req.user._id,
        to: userToModify._id,
      });
      await newNotification.save();
      res.status(200).json({ message: "Following sucessfully" });
    }
  } catch (error) {
    console.log(`Error in FollowUnfollow ${error}`);
    res.status(500).json({ error: "Internal server ERROR" });
  }
};

export const getSuggestedUser = async (req, res) => {
  try {
    const userId = req.user._id;
    const userFollowedByMe = await User.findById({ _id: userId }).select(
      "-password"
    );
    const users = await User.aggregate([
      {
        $match: {
          _id: { $ne: userId },
        },
      },
      {
        $sample: { size: 10 },
      },
    ]);
    const fillteredUsers = users.filter(
      (user) => !userFollowedByMe.following.includes(user._id)
    );
    const suggestedUser = fillteredUsers.slice(0, 4);
    suggestedUser.forEach((user) => (user.password = null));
    res.status(200).json(suggestedUser);
  } catch (error) {
    console.log(`Error in Getsuggesteduser ${error}`);
    res.status(500).json({ error: "Internal server ERROR" });
  }
};

export const updateUser = async (req, res) => {
    const { fullName, email, username, currentPassword, newPassword, bio, link } = req.body;
    let { profileImg, coverImg } = req.body;
  
const userId = req.user._id;




  try {
    let user = await User.findById({ _id: userId });
    if (!user) {
      return res.status(400).json({ message: `User not found` });
    }
    if (
      (!newPassword && currentPassword) ||
      (!currentPassword && newPassword)
    ) {
      return res
        .status(400)
        .json({ error: "New password and Current password needed" });
    }
    if (currentPassword && newPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ error: "Current password is Incorrect" });
      }
      if (currentPassword < 6) {
        return res.status(400).json({ error: "Password must have 6 char" });
      }
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(currentPassword, salt);
    }

    if(profileImg){
        if(user.profileImg){
            await cloudinary.uploader.destroy(user.profileImg.split("/").pop().split(".")[0])
        }
        const uploadedResponse=await cloudinary.uploader.upload(profileImg)
        profileImg=uploadedResponse.secure_url
    }
    if(coverImg){
        if(user.coverImg){
            await cloudinary.uploader.destroy(user.coverImg.split("/").pop().split(".")[0])
        }
        const uploadedResponse=await cloudinary.uploader.upload(coverImg)
        coverImg=uploadedResponse.secure_url
    }

    
		user.fullName = fullName || user.fullName;
		user.email = email || user.email;
		user.username = username || user.username;
		user.bio = bio || user.bio;
		user.link = link || user.link;
		user.profileImg = profileImg || user.profileImg;
		user.coverImg = coverImg || user.coverImg;

    user = await user.save();
    user.password = null;
    return res.status(200).json(user);

  } catch (error) {
    console.log(`Error in updateuser ${error}`);
    res.status(500).json({ error: "Internal server ERROR" });
  }
};
