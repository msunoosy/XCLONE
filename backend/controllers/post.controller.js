import Post from "../models/post.model.js"
import { v2 as cloudinary } from "cloudinary";
import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";




export const createPost=async(req,res)=>{
    try {
        const {text}=req.body;
        let {img}=req.body;
        const userId=req.user._id.toString()
            

        const user=await User.findOne({_id:userId})
        if(!user){
            return res.status(400).json({error:"No user found"})
        }

        if(!text&&!img){
            return res.status(400).json({error:"Image or Text should be available in post"})
        }
         
        if(img){
            const uploadedResponse=await cloudinary.uploader.upload(img)
            img=uploadedResponse.secure_url;
        }

        const newPost=new Post({
            user:userId,
            img,
            text
           
        })

        await newPost.save()
        res.status(201).json(newPost)

    } catch (error) {
        console.log(`Error in  create Post Controller: ${error}`)
        res.status(500).json({error:"Internal Server error"})
       
    }
}

export const deletePost=async(req,res)=>{
    try {
        const {id}=req.params
        const post=await Post.findOne({_id:id})
        if(!post){
            return res.status(404).json({error:'post not found'})
        }
        if(post.user.toString() !==req.user._id.toString()){
           return res.status(401).json({error:'you are not authorized to delete this post'})
        }
        if(post.img){
            const imgId=post.img.split('/').pop().split(".")[0];
            await cloudinary.destroy(imgId);
        }
        await Post.findByIdAndDelete({_id:id})
        res.status(200).json({message:"Post delete successfully"})
    } catch (error) {
        console.log(`Error in delete Controller ${error}`)
        res.status(400).json({error:'Internal server error'})
    }
}
export const createComment=async(req,res)=>{
    try {
        const {text}= req.body;
        const userId=  req.user._id
        const postId=req.params.id;

        if(!text){
          return  res.send(400).json({error:'comment text is required'})
        }
        const post =await Post.findOne({_id:postId})
        if(!post){
            return res.send(400).json({error:"No post available"})
        }
        const comment={
            user:userId,
            text
        }

        post.comment.push(comment)
        await post.save()
        res.status(200).json(post)

    } catch (error) {
        console.log(`Error in createcomment controller ${error}`)
        res.status(400).json({error:'Internal server error'})
    }
}

export const likeUnlike=async (req,res)=>{
    try {
        const {id:postId}=req.params
        const userId=req.user._id;
        const post=await Post.findOne({_id:postId})
        if(!post){
          return res.status(404).json({error:"No post found"})
        }
         const userLikedPost=post.likes.includes(userId)
         if(userLikedPost){
            await Post.updateOne({_id:postId},{$pull:{likes:userId}});
            await User.updateOne({_id:userId},{$pull:{likedPosts:postId}})
            const updatedLikes=post.likes.filter((id)=>id.toString() !==userId.toString())
            res.status(200).json(updatedLikes)
         }else{
            post.likes.push(userId)
            await User.updateOne({_id:userId},{$push:{likedPosts:postId}})
            await post.save()
            const notification= new Notification({
                from:userId,
                to:post.user,
                type:'like'
            })
            await notification.save()
            const updatedLikes=post.likes;
            res.status(200).json(updatedLikes)
         }
        
    } catch (error) {
        console.log(`error in likeunlike controller ${error}`)
        res.status(400).json({error:"internal error"})
    }
}

export const getAllPosts=async (req,res)=>{
    try {
        const posts=await Post.find().sort({createdAt:-1}).populate({
           path: "user",
           select: "-password"
        }).populate({
            path: "comment.user",
            select: "-password"
         })
        if(posts.length===0){
            res.status(200).json([])
        }else{
            res.status(200).json(posts)
        }
        
    } catch (error) {
        console.log(`error in getAllposts controller ${error}`)
        res.status(400).json({error:"internal error"})
    }
}

export const getLikedPosts= async(req,res)=>{
    try {
        const userId=req.user._id;
        const user=await User.findById({_id:userId})
        if(!user){
            res.status(404).json({error:'user not found'});
        }
        
        const likedPosts= await Post.find({_id:{$in:user.likedPosts}}).populate({
            path:'user',
            select:'-password'
        }).populate({
            path:'comment.user',
            select:'-password'
        })
        res.status(200).json(likedPosts)

    } catch (error) {
        console.log(`Error in getliked controller ${error}`)
        res.status(400).json({error:"internal error in getliked"})
    }
}

export const getFollowingPosts=async(req,res)=>{
    try {
        const userId=req.user._id;
        const user=await User.findById({_id:userId})
        if(!user){
            return res.status(404).json({error:"No userfound"})
        }
          const following=user.following
          const feedoposts= await Post.find({user:{$in:following}}).sort({createdAt:-1}).populate({
            path:'user',
            select: '-password'
          }).populate({
            path:'comment.user',
            select:'-password'
          })
        res.status(200).json(feedoposts)
    } catch (error) {
        console.log(`Error in getfollowing ${Error}`)
        res.status(500).json({error:"Internal error in getfollowing post"})
    }
}

export const getUserPosts=async(req,res)=>{
    try {
        const {username}=req.params;
        const user=await User.findOne({username})
        if(!user){
            return res.status(404).json({error:"User not found"})
        }
        const posts=await Post.find({user:user._id}).sort({createdAt:-1}).populate({
            path:"user",
            select:'-password'
        }).populate({
            path:'comment.user',
            select:'-password'

        })
        res.status(200).json(posts)
        
    } catch (error) {
        console.log(`Error in getuserpostController ${error}`);
        res.status(400).json({error:"Internal error in getuserPosts"})
    }
}