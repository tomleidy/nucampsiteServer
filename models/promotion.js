const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const promotionSchema = new Schema(
    {
        name: { type: String, required: true, unique: true },
        image: { type: String, required: true },
        description: { type: String, required: true },
        cost: { type: Number, required: true },
        featured: { type: Boolean }
    },
    { timestamps: true }
)

const Promotion = mongoose.model('Promotion', promotionSchema);
module.exports = Promotion;