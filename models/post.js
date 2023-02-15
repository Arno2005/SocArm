const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    media_data : {
        type: Buffer,
    },
    media_type : {
        type: String,
    },
    description : {
        type: String,
        required: [true, "The Descripton Field Cannot Be Empty"]
    },
    likes: {
        type: Number,
        default: 0,
    },
    user_id: {
        type: String,
        required: true,
    }
},
{
    timestamps: true
}
);

module.exports = mongoose.model('post', postSchema);