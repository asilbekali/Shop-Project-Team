const userValidator = require("../validators/user.validator");
const { totp } = require("otplib");
const bcrypt = require("bcrypt");
const User = require("../models/users");
const jwt = require("jsonwebtoken");
const logger = require("../logger");
const { sendEmail } = require("../config/sendEmail");
const { sendSMS } = require("../config/eskiz");

const router = require("express").Router();

function genToken(user) {
  const token = jwt.sign(
    { id: user.id, role: user.role, status: user.status },
    "apex1",
    { expiresIn: "15m" }
  );
  return token;
}

function genRefreshToken(user) {
  const token = jwt.sign({ id: user.id }, "apex2", { expiresIn: "7d" });
  return token;
}

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Foydalanuvchini ro‘yxatdan o‘tkazish
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Otp emailga yuborildi
 *       400:
 *         description: Xatolik bor
 */
router.post("/register", async (req, res) => {
  try {
    const { error } = userValidator.validate(req.body);
    if (error)
      return res.status(400).send({ message: error.details[0].message });

    const { email, password, phone, ...rest } = req.body;
    const otp = totp.generate(email + "apex");
    const hash = bcrypt.hashSync(password, 10);
    const newUser = await User.create({
      email,
      password: hash,
      status: "pending",
      phone: phone,
      ...rest,
    });
    console.log(otp);
    sendEmail(email, otp);
    // sendSMS(phone, otp)  /// sendSMS funksiyasini yoqib qo‘yish kerak

    logger.log("info", `New user registered - ${newUser}`);
    res.send({ message: "Otp sended to your email" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Something went wrong" });
  }
});

/**
 * @swagger
 * /auth/verify:
 *   post:
 *     summary: OTP kod bilan foydalanuvchini tasdiqlash
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: Foydalanuvchi tasdiqlandi
 *       400:
 *         description: Noto‘g‘ri yoki eskirgan kod
 */
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

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Foydalanuvchini tizimga kirishi
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Kirish muvaffaqiyatli amalga oshirildi
 *       400:
 *         description: Foydalanuvchi topilmadi
 *       401:
 *         description: Parol noto‘g‘ri
 */
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

/**
 * @swagger
 * /auth/access-token:
 *   post:
 *     summary: Yangi access token olish (refresh token orqali)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refresh_token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Yangi access token qaytarildi
 *       401:
 *         description: Noto‘g‘ri refresh token
 */
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
