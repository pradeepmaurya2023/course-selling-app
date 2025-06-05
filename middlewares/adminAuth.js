const jwt = require("jsonwebtoken");
const JWT_SECRET_ADMIN = process.env.JWT_SECRET_ADMIN;

function adminAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Access Denied : No token Provided",
    });
  }

  const token = authHeader.split(" ")[1];
  console.log(`JWT TOKEN : ${token}`);
  try {
    const decodedToken = jwt.verify(token, JWT_ADMIN_PASSWORD);
    req.id = decodedToken;
    next();
  } catch (err) {
    return res.status(403).json({
      message: "Invalid or Expred Token",
    });
  }
}

module.exports = adminAuth;
