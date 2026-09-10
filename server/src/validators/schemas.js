import Joi from 'joi';

/**
 * Joi Schema for updating candidate's own display name
 */
export const updateNameSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required().messages({
    'string.base': 'Name must be a string.',
    'string.empty': 'Name cannot be empty.',
    'string.min': 'Name must be at least 2 characters long.',
    'string.max': 'Name cannot exceed 100 characters.',
    'any.required': 'Name is required.',
  }),
});

/**
 * Joi Schema for updating team name
 */
export const updateTeamNameSchema = Joi.object({
  teamName: Joi.string().trim().min(2).max(60).required().messages({
    'string.base': 'Team name must be a string.',
    'string.empty': 'Team name cannot be empty.',
    'string.min': 'Team name must be at least 2 characters long.',
    'string.max': 'Team name cannot exceed 60 characters.',
    'any.required': 'Team name is required.',
  }),
});

/**
 * Joi Schema for Admin team override (team name and domain)
 */
export const adminTeamOverrideSchema = Joi.object({
  teamName: Joi.string().trim().min(2).max(60).optional(),
  domain: Joi.string().trim().max(100).allow('').optional(),
}).min(1);

/**
 * Joi Schema for Admin Lead Reassignment
 */
export const reassignLeadSchema = Joi.object({
  newLeadId: Joi.string().hex().length(24).required().messages({
    'string.hex': 'newLeadId must be a valid 24-character hexadecimal ObjectId.',
    'string.length': 'newLeadId must be exactly 24 characters long.',
    'any.required': 'newLeadId is required.',
  }),
});

/**
 * Joi Schema for creating a Wildcard Team
 */
const memberSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  email: Joi.string().trim().email({ tlds: { allow: false } }).required().messages({
    'string.email': 'Member email must be a valid email address.',
  }),
  mobile: Joi.string().trim().allow('').max(20).optional(),
  organisation: Joi.string().trim().allow('').max(200).optional(),
});

export const wildcardTeamSchema = Joi.object({
  teamName: Joi.string().trim().min(2).max(60).required(),
  regnId: Joi.string().trim().max(50).allow('').optional(),
  domain: Joi.string().trim().max(100).allow('').optional(),
  lead: memberSchema.required(),
  members: Joi.array().items(memberSchema).max(4).default([]).messages({
    'array.max': 'A team can have at most 4 additional members (max 5 members total including the lead).',
  }),
});

/**
 * Joi Schema for live Event Info configuration
 */
const timelineItemSchema = Joi.object({
  time: Joi.string().trim().required(),
  activity: Joi.string().trim().required(),
});

export const eventInfoSchema = Joi.object({
  timeline: Joi.array().items(timelineItemSchema).optional(),
  prizePool: Joi.string().trim().allow('').max(1000).optional(),
  location: Joi.string().trim().allow('').max(500).optional(),
  venue: Joi.string().trim().allow('').max(500).optional(),
  eventDates: Joi.string().trim().allow('').max(200).optional(),
  eventFormat: Joi.string().trim().allow('').max(200).optional(),
});

/**
 * Middleware factory to validate request body against a Joi schema
 * @param {Joi.ObjectSchema} schema
 */
export const validateBody = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const details = error.details.map((d) => ({
        field: d.path.join('.'),
        message: d.message.replace(/['"]/g, ''),
      }));

      return res.status(400).json({
        error: 'Validation failed',
        details,
      });
    }

    req.body = value;
    next();
  };
};
