const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const nodemailer = require("nodemailer");

async function login(req, res) {
  try {
    const { email, password } = req.body;

    // Find the user by username
    const user = await User.findOne({ email });

    // Check if the user exists and verify the password
    if (user && (await bcrypt.compare(password, user.password))) {
      const token = jwt.sign(
        { userId: user.id, email, role: user.role },
        process.env.SECRET_KEY,
        {
          expiresIn: "1d",
        }
      );

      res.status(200).json({ message: "Login successful", token, user });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function updateUser(req, res) {
  try {
    const { id, name, email, mobile_no, country, company_name } = req.body;

    const existingUser = await User.findById(id);
    if (!existingUser) {
      return res.status(404).json({ error: "User not found" });
    }

    if (name) {
      existingUser.name = name;
    }

    if (email) {
      existingUser.email = email;
    }

    if (mobile_no) {
      existingUser.mobile_no = mobile_no;
    }

    if (country) {
      existingUser.country = country;
    }

    if (company_name) {
      existingUser.company_name = company_name;
    }

    const updatedUser = await existingUser.save();

    res.status(200).json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function userDetails(req, res) {
  try {
    const { id } = req.query;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const UserDetails = {
      name: user.name,
      email: user.email,
      mobile_no: user.mobile_no,
      country: user.country,
      role: user.role,
      company_name: user.company_name,
    };

    res.json(UserDetails);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

const sendOTPByEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;
    console.table([email, otp]);
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid email" });
    }

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: "no.reply.centpays@gmail.com",
        pass: "hkbm gogq vyni fzfy",
      },
    });

    const mailOptions = {
      from: "no.reply.centpays@gmail.com",
      to: email,
      subject: "Your OTP for Email Verification",
      text:`DBody - 

      Hello,
      
      Your one-time passcode (OTP) from Centpays is:  ${otp}.
      
      Please either Copy and Paste or enter the code manually when prompted. The code was requested and will be valid for 10 minutes.`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
    return res
      .status(200)
      .json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to send OTP email" });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, newpassword, confirmpassword } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid email" });
    }

    if (newpassword !== confirmpassword) {
      return res
        .status(400)
        .json({ success: false, message: "Passwords do not match" });
    }

    const hashedPassword = await bcrypt.hash(newpassword, 10);

    user.password = hashedPassword;
    await user.save();

    return res
      .status(200)
      .json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.error("Error updating password:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

module.exports = {
  login,
  updateUser,
  userDetails,
  sendOTPByEmail,
  resetPassword,
};
