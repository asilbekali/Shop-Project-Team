const userValidator = require("../validators/user.validator");
const { totp } = require("otplib");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const User = require("../models/users");
const jwt = require("jsonwebtoken");
const logger = require("../logger");

const router = require("express").Router();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "mrasad.apex@gmail.com",
    pass: "dkxj sako ezqy xczj",
  },
});

async function sendEmail(email, otp) {
  await transporter.sendMail({
    to: email,
    subject: "verify auth",
    from: "mrasad.apex@gmail.com",
    text: `your one time password is ${otp}`,
  });
  console.log("sended to email");
}

totp.options = {
  digits: 5,
  step: 60,
};

function genToken(user) {
  const token = jwt.sign({ id: user.id }, "apex1", { expiresIn: "15m" });
  return token;
}

function genRefreshToken(user) {
  const token = jwt.sign({ id: user.id }, "apex2", { expiresIn: "7d" });
  return token;
}

router.post("/register", async (req, res) => {
  try {
    const { error } = userValidator.validate(req.body);
    if (error)
      return res.status(400).send({ message: error.details[0].message });

    const { email, password, ...rest } = req.body;
    const otp = totp.generate(email + "apex");
    const hash = bcrypt.hashSync(password, 10);
    const newUser = await User.create({
      email,
      password: hash,
      status: "pending",
      ...rest,
    });
    console.log(otp);
    sendEmail(email, otp);
    logger.log("info", `New user registered - ${newUser}`);
    res.send({ message: "Otp sended to your email" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Something went wrong" });
  }
});

router.post("/verify", async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }
    const match = totp.verify({ token: otp, secret: email + "apex" });
    if (!match) {
      return res.status(400).send({ message: "Code is not valid or expired" });
    }
    await user.update({
      status: "active",
    });
    logger.log("info", `User verified - ${user}`);
    res.send({ message: "Verified" });
  } catch (error) {
    console.log(error);
  }
});

router.post("/send-otp", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }
    if (user.status == "active") {
      return res
        .status(200)
        .send({ message: "Your account is already verified" });
    }
    const token = totp.generate(email + "apex");
    sendEmail(email, token);
    logger.log("info", `User requested for new otp - ${user.email}`);
    res.send({ message: "Verification code sended to email" });
  } catch (error) {
    console.log(error);
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).send({ message: "User not found" });
    }
    const match = bcrypt.compareSync(password, user.password);
    if (!match) {
      return res.status(401).send({ message: "Password is incorrect" });
    }
    if (user.status == "pending") {
      return res.send({
        message: "Your account is not verified please verify",
      });
    }
    const access_token = genToken(user);
    const refresh_token = genRefreshToken(user.email);
    logger.log("info", `User logged in - ${user}`);
    res.send({ refresh_token, access_token });
  } catch (error) {
    console.log(error);
  }
});

router.post("/access-token", async (req, res) => {
  try {
    const { refresh_token } = req.body;
    const user = jwt.verify(refresh_token, "apex2");

    if (!user)
      return res.status(401).send({ message: "Invalid refresh token" });

    logger.log("info", `User got new access_token - ${user.email}`);
    const access_token = genToken(user);
    res.send({ access_token });
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
