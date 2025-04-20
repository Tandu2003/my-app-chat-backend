const User = require("../models/User");

const getAllUsers = async () => {
  return await User.find();
};

const getUserById = async (id) => {
  return await User.findById(id);
};

const createUser = async (userData) => {
  const user = new User(userData);
  return await user.save();
};

const updateUser = async (id, updateData) => {
  return await User.findByIdAndUpdate(id, updateData, { new: true });
};

const deleteUser = async (id) => {
  return await User.findByIdAndDelete(id);
};

const findUserByEmail = async (email) => {
  return await User.findOne({ email }).select("-password");
};

const findFriendsByName = async (userId, name) => {
  const user = await User.findById(userId).populate({
    path: "friends",
    match: { fullName: { $regex: name, $options: "i" } },
    select: "-password",
  });
  return user && user.friends ? user.friends : [];
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  findUserByEmail,
  findFriendsByName,
};
