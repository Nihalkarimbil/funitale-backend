
const joi =require('joi')

const JoiUserSchema = joi.object({
    username: joi.string().required(), 
    password: joi.string().min(4).required(),
    confpassword: joi.string().min(4),
    email: joi.string().email(),
    admin:joi.boolean().optional(),
    blocked:joi.boolean().optional()
})

const JoiProductSchema = joi.object({
    name: joi.string().required(),
    category: joi.string().required(),
  
    new_price: joi.number().required(),
    old_price: joi.number(),
    description: joi.string().required(),
    rating: joi.number().min(0).max(3).default(0), 
    reviews: joi.number().min(0).default(0),
    topTrends: joi.boolean().default(false),
    newCollections: joi.boolean().default(true),
    detailOne: joi.string().required()
  })

module.exports={JoiProductSchema,JoiUserSchema}