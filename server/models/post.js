import mongoose from 'mongoose'

const Schema = mongoose.Schema;
const postSchema = new Schema({
    title: {
        type:String,
        required: true
    },
    url:{
        type:String,
        required: true
    },
    dateNews:{
        type: String,
        // required: true
    },
    
},{ timestamps: true })

const Post = mongoose.model('Post', postSchema) 

export default Post;