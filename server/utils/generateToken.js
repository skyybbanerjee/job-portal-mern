import jwt from "jsonwebtoken";

function generateToken(id) {
  const token = jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
  return token;
}

export default generateToken;
