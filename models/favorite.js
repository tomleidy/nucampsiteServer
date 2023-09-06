const mongoose = require('mongoose');
const { Schema } = mongoose;

const favoriteSchema = {
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    campsites: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Campsite'
    }]
}

const Favorite = mongoose.model('Favorite', favoriteSchema);

module.exports = Favorite;