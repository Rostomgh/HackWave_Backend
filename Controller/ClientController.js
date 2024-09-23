const LinkModel = require("../Models/LinkModel");
<<<<<<< HEAD

const submitForm = async (req, res) => {
  const { Url,from ,disable} = req.body;
  const {email}=from
=======
const UserModel = require("../Models/User");
const submitForm = async (req, res) => {
  const {
    Url,
    from: { email },
    disable,
  } = req.body;
>>>>>>> 64eb25a23d93b923c418ba00ea6f384a056f420d

  try {
    const newLink = new LinkModel({
      Url,
      from: {
        email,
      },
<<<<<<< HEAD
      disable
=======
      disable,
>>>>>>> 64eb25a23d93b923c418ba00ea6f384a056f420d
    });

    await newLink.save();

    res
      .status(201)
      .json({ message: "Form submitted successfully", link: newLink });
  } catch (error) {
    res.status(500).json({ message: "Error submitting form", error });
  }
};

<<<<<<< HEAD
const getForm = async (req, res) => {
  try {
    const links = await LinkModel.find();
=======
const getSubmissions = async (req, res) => {
  try {
    const submissions = await LinkModel.find({});
    res.json(submissions);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
};

const getForm = async (req, res) => {
  const { id } = req.params;
  try {
    const links = await LinkModel.find({ _id: id });
>>>>>>> 64eb25a23d93b923c418ba00ea6f384a056f420d
    console.log(links);
    res.json(links);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
};
<<<<<<< HEAD
module.exports = {
  submitForm,
  getForm,
=======

const getUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await UserModel.findOne({ _id: id });
    res.json(user);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
};
const getStats = async (req, res) => {
  try {
    const currentDate = new Date();
    const firstDayOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );
    const lastMonthStart = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - 1,
      1
    );

    const totalClients = await UserModel.countDocuments();
    const clientsAcceptes = await LinkModel.countDocuments({
      disable: "active",
    });
    const clientsRejetes = await LinkModel.countDocuments({
      disable: "inactive",
    });

    const totalMoisDernier = await UserModel.countDocuments({
      createdAt: { $gte: lastMonthStart, $lt: firstDayOfMonth },
    });
    const acceptesMoisDernier = await LinkModel.countDocuments({
      disable: "active",
      createdAt: { $gte: lastMonthStart, $lt: firstDayOfMonth },
    });
    const rejetesMoisDernier = await LinkModel.countDocuments({
      disable: "inactive",
      createdAt: { $gte: lastMonthStart, $lt: firstDayOfMonth },
    });

    const calculerCroissance = (actuel, dernier) => {
      if (dernier === 0) return actuel > 0 ? 100 : 0;
      return ((actuel - dernier) / dernier) * 100;
    };

    const croissanceTotale = calculerCroissance(totalClients, totalMoisDernier);
    const croissanceAcceptes = calculerCroissance(
      clientsAcceptes,
      acceptesMoisDernier
    );
    const croissanceRejetes = calculerCroissance(
      clientsRejetes,
      rejetesMoisDernier
    );

    const formaterCroissance = (croissance) => {
      const symbole = croissance >= 0 ? "↑" : "↓";
      return `${symbole} ${Math.abs(croissance).toFixed(1)}% ce mois-ci`;
    };

    const statistiques = {
      totalClients: {
        nombre: totalClients,
        croissance: formaterCroissance(croissanceTotale),
      },
      clientsAcceptes: {
        nombre: clientsAcceptes,
        croissance: formaterCroissance(croissanceAcceptes),
      },
      clientsRejetes: {
        nombre: clientsRejetes,
        croissance: formaterCroissance(croissanceRejetes),
      },
    };

    res.json(statistiques);
  } catch (err) {
    console.error("Erreur dans getStats:", err);
    res.status(500).json({
      message: "Erreur lors de la récupération des statistiques",
      erreur: err.message,
    });
  }
};

const getUserLinksController = async (req, res) => {
  try {
    const users = await UserModel.find({});
    const links = await LinkModel.find({});
    const userLinks = await Promise.all(
      users.map(async (user) => {
        const userLink = links.find((link) => link?.senderId == user?._id);
        console.log(userLink);
        return {
          name: user.name,
          phoneNumber: "N/A",
          email: user.email,
          website: userLink?.website ? userLink.website : "N/A",
          id: user._id,
        };
      })
    );

    res.status(200).json(userLinks);
  } catch (error) {
    console.error("Error in getUserLinksController:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const sendSubmission = async (req, res) => {
  const { senderId, ...submission } = req.body;
  try {
    const newSubmission = new LinkModel({ ...submission, senderId });
    await newSubmission.save();
    res.status(201).json({
      message: "Submission sent successfully",
      submission: newSubmission,
    });
  } catch (error) {
    console.error("Error in sendSubmission:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getMySubmissions = async (req, res) => {
  const { userId } = req.params;
  try {
    const submissions = await LinkModel.find({ senderId: userId });
    res.json(submissions);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
};

module.exports = {
  submitForm,
  getSubmissions,
  getForm,
  getStats,
  getUser,
  getUserLinksController,
  sendSubmission,
  getMySubmissions,
>>>>>>> 64eb25a23d93b923c418ba00ea6f384a056f420d
};
