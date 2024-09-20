const User = require("../Models/User");
const createToken = require("../Util/tokenCreate");
const validator = require("validator");
const bcrypt = require("bcrypt");

const signup = async (req, res) => {
  const { name, email, password } = req.body;
  console.log(req.body);
  

  try {
    if (!name || !email || !password) {
      throw Error("Please fill the required fields");
    }

    const existe = await User.findOne({ email });

    if (name.length < 6) {
      throw Error("name is too short");
    }

    if (existe) {
      throw Error("There is already user with this email");
    }

    if (!validator.isEmail(email)) {
      throw Error("Enter a valid email");
    }

    if (password.length < 8) {
      throw Error("Your password is to short");
    }

    const regex = /^(?=.*[a-zA-Z])(?=.*[0-9])/;

    if (!regex.test(password)) {
      throw Error("Password should have a numbers and a letters in it");
    }

    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(password, salt);

    const data = await User.create({
      name,
      email,
      password: hashedPassword,
      
      status: "User",
    });

    const token = createToken(data._id);

    res.status(201).json({
      name: data.name,
      email: data.email,

      status: data.status,
      token,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      throw Error("Please fill the required fields");
    }

    const existe = await User.findOne({ email });

    if (!existe) {
      throw Error("There is no account with this email");
    }

    const matched = await bcrypt.compare(password, existe.password);

    if (!matched) {
      throw Error("Incorrect Password");
    }

    const token = createToken(existe._id);

    res.status(200).json({
      name: existe.name,
      email: existe.email,
      status: existe.status,
      token,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { signup, login };
