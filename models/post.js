const mongoose = require('mongoose');

const fs = require('fs');

const path = require('path');

const postSchema = new mongoose.Schema({
    media_data : {
        type: String,
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


// postSchema.pre('deleteMany', async function(next) {
//     let deletedData =await mongoose.model('post', postSchema).find(this._conditions).lean();
//     deletedData.forEach(el => {
//         fs.unlink(path.resolve('./public/' + el.media_data), (err) => {
//             if(err){
//                 console.log('couldnt delete image from server');
//                 console.log(err);
//             }
//         });    
//     });
    

//     next();
// });

module.exports = mongoose.model('post', postSchema);