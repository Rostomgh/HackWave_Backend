const LinkModel = require("../Models/LinkModel");

const submitForm = async (req, res) => {
  const { Url, email } = req.body;

  try {
    const newLink = new LinkModel({
      Url,
      from: {
        email,
      },
    });

    await newLink.save();

    res
      .status(201)
      .json({ message: "Form submitted successfully", link: newLink });
  } catch (error) {
    res.status(500).json({ message: "Error submitting form", error });
  }
};

const getForm = async (req, res) => {
  try {
    const links = await LinkModel.find();
    console.log(links);
    res.json(links);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
};
module.exports = {
  submitForm,
  getForm,
};
