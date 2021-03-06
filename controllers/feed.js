const fs = require('fs')
const path = require('path')
const {
    validationResult
} = require('express-validator/check')

const Post = require('../model/post')

const io = require('../socket')

exports.getPosts = (req, res, next) => {
    const currentPage = req.query.page || 1
    const perPage = 2
    let totalItems
    Post.find()
        .countDocuments()
        .then(count => {
            console.log(count)
            totalItems = count
            return Post.find().sort('-_id').populate('creator').skip((currentPage - 1) * perPage).limit(perPage)
        })
        .then(posts => {
            // if (!posts) {
            //   const error = new Error('Could not find Post')
            //   error.statusCode = 404
            //   throw error
            // }

            res
                .status(200)
                .json({
                    message: 'Fetched posts successfully.',
                    posts: posts,
                    totalItems: totalItems
                })
        })
        .catch(err => {
                console.log(err)
                if (!err.statusCode) {
                    err.statusCode = 500
                }
                next(err)
            }

        )
}

exports.postPost = (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed, entered data is incorrect.')
        error.statusCode = 422
        throw error
    }
    if (!req.file) {
        const error = new Error('No Image Provided')
        error.statusCode = 422
        throw error
    }

    const imageUrl = req.file.path
    const title = req.body.title
    const content = req.body.content
    const post = new Post({
        title: title,
        content: content,
        imageUrl: imageUrl,
        creator: {
            name: 'OWAD'
        }
    })
    post
        .save()
    io.getIo().emit('posts', {
            action: 'create',
            post: post
        })
        .then(result => {
            res.status(201).json({
                message: 'Post created successfully!',
                post: result
            })
        })
        .catch(err => {
            console.log(err)
        })
}

exports.getPost = (req, res, next) => {
    const postId = req.params.postId
    Post.findById(postId)
        .then(post => {
            if (!post) {
                const error = new Error('Could not find post.')
                error.statusCode = 404
                throw error
            }
            res.status(200).json({
                message: 'Post fetched.',
                post: post
            })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500
            }
            next(err)
        })
}

exports.updatePost = (req, res, next) => {
    const postId = req.params.postId
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed, entered data is incorrect.')
        error.statusCode = 422
        throw error
    }
    const title = req.body.title
    const content = req.body.content
    let imageUrl = req.body.image
    if (req.file) {
        imageUrl = req.file.path
    }
    if (!imageUrl) {
        const error = new Error('No file picked')
        error.statusCode = 422
        throw error
    }
    Post.findById(postId)
        .then(post => {
            if (!post) {
                const error = new Error('Could not find Post')
                error.statusCode = 404
                throw error
            }
            if (imageUrl !== post.imageUrl) {
                clearImage(post.imageUrl)
            }
            post.title = title
            post.imageUrl = imageUrl
            post.content = content
            return post.save()
        })
        .then(result => {
            res.status(200).json({
                message: 'POST UPDATED',
                post: result
            })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500
            }
            next(err)
        })
}

exports.deletePost = (req, res, next) => {
    const postId = req.params.postId
    Post.findById(postId)
        .then(post => {
            console.log('got here')
            if (!post) {
                const error = new Error('Could not find Post')
                error.statusCode = 404
                throw error
            }
            // check logged in user
            clearImage(post.imageUrl)
            return Post.findByIdAndRemove(postId)
        })
        .then(result => {
            console.log(result)
            res.status(200).json({
                message: 'Post Deleted'
            })
        })
        .catch(err => {
            console.log(err)
            if (!err.statusCode) {
                err.statusCode = 500
            }
            next(err)
        })
}

const clearImage = filePath => {
    filePath = path.join(__dirname, '..', filePath)
    fs.unlink(filePath, err => console.log(err))
}