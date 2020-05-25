const express = require('express')
const router = express.Router()
const feedController = require('../controllers/feed')
const {body} = require('express-validator/check')

// //Get
router.get('/posts', feedController.getPosts)
router.get('/post/:postId', feedController.getPost)

// //Post
router.post('/post', [body('title').trim().isLength({min: 5})], feedController.postPost)

router.put('/post/:postId', [body('title').trim().isLength({ min: 5 })], feedController.updatePost)
router.delete('/post/:postId', feedController.deletePost)

module.exports = router
