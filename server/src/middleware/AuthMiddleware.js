import { verify } from '../auth/TokenService.js';
import UserRepository from '../users/UserRepository.js';

async function protect(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ message: 'Please sign in.' });

    const decoded = verify(token);
    const user = await UserRepository.findById(decoded.id);
    if (!user) return res.status(401).json({ message: 'Please sign in.' });
    if (user.status === 'blocked') return res.status(403).json({ message: 'This account is blocked.' });

    req.user = user;
    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Please sign in.' });
  }
}

export {
  protect
};
