require('dotenv').config();

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const requireLogin = require('../middleware/requireLogin');
const Post=mongoose.model("Post");

router.get('/allposts',requireLogin,(req,res)=>{
    Post.find()
    .populate("postedBy","_id name")
    .then(posts=>{
        res.send({posts:posts})
    })
    .catch(err=>{
        console.log(err);
    })
})

router.post('/createpost',requireLogin,(req,res)=>{
    const {title,body,pic}=req.body;
    if(!title || !body || !pic){
        return res.status(422).json({error:"please add all fields"});
    }
    req.user.password=undefined;
    const post = new Post({
        title,
        body,
        pic,
        postedBy : req.user
    })
    post.save().then(result=>{
        res.json({post:result});
    })
    .catch(err=>{
        console.log(err);
    })
})

router.get('/mypost',requireLogin,(req,res)=>{
    Post.find({postedBy:req.user._id})
    .populate("postedBy","_id name")
    .then(mypost=>{
        res.json({mypost:mypost});
    })
    .catch(err=>{
        console.log(err);
    })
})

router.put('/like',requireLogin,(req,re)=>{
    Post.findByIdAndUpdate(req.body.postId,{
        $push:{likes:req.user._id}
    },{
        new:true
    }).exec((err,result)=>{
        if(err){
            return res.status(422).json({error:error});
        }
        else{
            res.json(result)
        }
    })
})

router.put('/unlike',requireLogin,(req,re)=>{
    Post.findByIdAndUpdate(req.body.postId,{
        $pull:{likes:req.user._id}
    },{
        new:true
    }).exec((err,result)=>{
        if(err){
            return res.status(422).json({error:error});
        }
        else{
            res.json(result)
        }
    })
})



module.exports = router