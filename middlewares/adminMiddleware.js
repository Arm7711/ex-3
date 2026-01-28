import HttpErrors from "http-errors";

export default function adminMiddleware(req, res, next) {
  try {
    if (!req.user || req.user.role !== 'admin') {
      throw new HttpErrors(403, 'Access denied. Admin only.');
    }
    next();
  } catch (error) {
    next(error);
  }
}