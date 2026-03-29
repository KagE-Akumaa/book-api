const requireRole = (role) => (req, res, next) => {
  const { user_role } = req.user;

  if (!user_role) {
    return res.status(403).json({ error: "User Role not defined!" });
  }
  if (user_role === role) {
    next();
  } else {
    return res.status(403).json({ error: "User Role not defined!" });
  }
};

export default requireRole;
