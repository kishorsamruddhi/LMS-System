const bcrypt = require("bcrypt");
const User = require("../models/User.model");

const saltRound = 16;
async function changePasswordApi(req, res) {
  try {
    const { password, new_password } = req.body;
    const _id = req.user._id;

    if (!password) {
      throw new Error("Password is required");
    }

    if (password === new_password) {
      throw new Error("Password and new password are same!");
    }

    if (!new_password) {
      throw new Error("Password is required");
    }
    if (!passwordValidator(new_password)) {
      throw new Error(
        `"${new_password}" is not a valid password! Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.`
      );
    }
    const userFromDB = await User.findById(_id, {
      password: 1,
      isEmailVerified: 1,
    }).lean();

    if (!userFromDB) {
      throw new Error("User does not exists with this email!");
    }

    if (!userFromDB.isEmailVerified) {
      throw new Error(
        "User Email is not Verified. Can't perform forgot password actions!"
      );
    }
    const isPasswordValid = await bcrypt.compare(password, userFromDB.password);
    if (!isPasswordValid) {
      throw new Error(
        "Incorrect password. Please check your password and try again."
      );
    }

    const hashedPassword = await bcrypt.hash(new_password, saltRound);

    await User.findByIdAndUpdate(userFromDB._id, {
      $set: { password: hashedPassword },
    });

    return res
      .status(201)
      .json({ error: false, data: "Password updated successfully!" });
  } catch (error) {
    return res.status(500).json({
      data: error?.message || "Failed to update password",
      error: true,
    });
  }
}

function passwordValidator(v) {
  return /^[A-Za-z\d!@#$%^&*()_+-=]{6,}$/.test(v);
}

module.exports = { changePasswordApi };
