import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
const auth = (req, res, next) => {
  //NOTE: this is the authentication middleware which will check
  //whether the token is valid or not and then if valid will attach to the req.user = decoded

  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "Access Denied!" });
  }
  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access Denied!" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: err.message });
  }
};

export default auth;
