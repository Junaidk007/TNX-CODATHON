import express from 'express';
import { requireAuth } from '../middlewares/auth.js';
import { User } from '../models/User.js';
import { validateBody, updateNameSchema } from '../validators/schemas.js';

const router = express.Router();

router.use(requireAuth);

/**
 * GET /api/users/me
 * Resolve current logged in user and populated team information
 */
router.get('/me', async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'teamId',
      populate: [
        { path: 'leadId', select: 'name email mobile role' },
        { path: 'memberIds', select: 'name email mobile organisation course yearOfGraduation role isActivated' },
      ],
    });

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/users/me
 * Edit own profile name with Joi validation (email and role are immutable)
 */
router.patch('/me', validateBody(updateNameSchema), async (req, res, next) => {
  try {
    const { name } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { name } },
      { new: true }
    );

    res.status(200).json(updatedUser);
  } catch (error) {
    next(error);
  }
});

export default router;
