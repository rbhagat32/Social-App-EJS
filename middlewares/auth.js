import jwt from "jsonwebtoken";

export const isLoggedIn = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) return res.redirect("/");

  try {
    const userData = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = userData;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      res.cookie("token", "");
      return res.redirect("/");
    } else {
      console.log(err);
      return res.status(500).send("Authentication error");
    }
  }
};
