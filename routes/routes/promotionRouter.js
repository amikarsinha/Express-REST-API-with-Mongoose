const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');
const cors = require('./cors');


const Promotions = require('../models/leaders');

const promotionRouter = express.Router();

promotionRouter.use(bodyParser.json());

promotionRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
   Promotions.find({})
    .then((promotions) => {
       res.statusCode = 200;
       res.setHeader('Content-Type', 'application/json');
       res.json(promotions);
   }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyAdmin, (req, res, next) => {
     res.statusCode = 403;
    res.end('POST operation not supported on /promotions');
})
.put(cors.corsWithOptions, authenticate.verifyAdmin, (req, res, next) => {
    Promotions.create(req.body)
   .then((promotion) => {
      console.log('Promotion Created', promotion);
         res.statusCode = 200;
       res.setHeader('Content-Type', 'application/json');
       res.json(promotion);
   },  (err) => next(err))
   .catch((err) => next(err));
})
.delete(cors.corsWithOptions, authenticate.verifyAdmin, (req, res, next) => {
   Promotions.remove({})
    .then((resp) => {
        res.statusCode = 200;
       res.setHeader('Content-Type', 'application/json');
       res.json(resp);
       
   },  (err) => next(err))
     .catch((err) => next(err));
});


promotionRouter.route('/:promotionId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
   Promotions.findById(req.params.leaderId)
      .then((promotion) => {
       res.statusCode = 200;
       res.setHeader('Content-Type', 'application/json');
       res.json(promotion);
   }, (err) => next(err))
    .catch((err) => next(err));
})

.post(cors.corsWithOptions, authenticate.verifyAdmin, (req, res, next) => {
     Promotions.findByIdAndUpdate(req.params.promotionId, {
     $set: req.body
 }, { new: true })
       .then((promotion) => {
       res.statusCode = 200;
       res.setHeader('Content-Type', 'application/json');
       res.json(promotion);
   }, (err) => next(err))
    .catch((err) => next(err));
})

.put(cors.corsWithOptions, authenticate.verifyAdmin, (req, res, next) => {
res.statusCode = 403;
 res.end('PUT operation not supported on /promotions/' + req.params.promotionId);
    
})
 
.delete(cors.corsWithOptions, authenticate.verifyAdmin, (req, res, next) => {
   Promotions.findByIdAndRemove(req.params.promotionId)
     .then((resp) => {
        res.statusCode = 200;
       res.setHeader('Content-Type', 'application/json');
       res.json(resp);
       
   },  (err) => next(err))
     .catch((err) => next(err));
});

promotionRouter.route('/:promotionId/comments')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
   Promotions.findById(req.params.leaderId)
    .then((promotion) => {
       if(promotion != null){
       res.statusCode = 200;
       res.setHeader('Content-Type', 'application/json');
       res.json(promotion.comments);
    }
    else{
        err = new Error('Promotion' + req.params.promotionId + 'not found');
        err.status = 404;
        return next(err);
       
     }
   }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
     res.statusCode = 403;
    res.end('POST operation not supported on /promotions' +  req.params.promotionId + '/comments' );
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Promotions.findById(req.params.promotionId)
     .then((promotion) => {
     if(promotion != null){
  
         promotion.comments.push(req.body);
         promotion.save()
         .then((promotion) => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
              res.json(promotion);
         },  (err) => next(err));
      
    }
    else{
        err = new Error('Promotion' + req.params.promotionId + 'not found');
        err.status = 404;
        return next(err);
       
     }
   },  (err) => next(err))
   .catch((err) => next(err));
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Promotions.findById(req.params.promotionId)
    .then((promotion) => {
       if(promotion != null){
           for(var i = (promotion.comments.length-1); i>=0; i--) {
              promotion.comments.id(promotion.comments[i]._id).remove();
           }
             promotion.save()
         .then((promotion) => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
              res.json(promotion);
         },  (err) => next(err));
           
    }
    else{
        err = new Error('Promotion' + req.params.promotionId + 'not found');
        err.status = 404;
        return next(err);
       
     }
   },  (err) => next(err))
     .catch((err) => next(err));
});


promotionRouter.route('/:promotionId/comments/:commentId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
   Promotions.findById(req.params.promotionId)
      .then((promotion) => {
         if(promotion != null && promotion.comments.id(req.params.commentId) != null){
       res.statusCode = 200;
       res.setHeader('Content-Type', 'application/json');
       res.json(promotion.comments.id(req.params.commentId));
    }
    else if(promotion == null){
        err = new Error('Promotion' + req.params.promotionId + 'not found');
        err.status = 404;
         return next(err);
       
     }
       else {
             err = new Error('Comment' + req.params.commentId + 'not found');
        err.status = 404;
        return next(err);
       }
     
   }, (err) => next(err))
    .catch((err) => next(err));
})

.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
   Promotions.findById(req.params.promotionId)
      .then((promotion) => {
         if(promotion != null && promotion.comments.id(req.params.commentId) != null){
             if(req.body.rating) {
                 promotion.comments.id(req.params.commentId).rating = req.body.rating;
             }
             if(req.body.comment) {
                promotion.comments.id(req.params.commentId).comment =  req.body.comment; 
             }
             
       promotion.save()
         .then((promotion) => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
              res.json(promotion);
         },  (err) => next(err));
    }
    else if(promotion == null){
        err = new Error('Leader' + req.params.promotionId + 'not found');
        err.status = 404;
         return next(err);
       
     }
       else {
             err = new Error('Comment' + req.params.commentId + 'not found');
        err.status = 404;
        return next(err);
       }
     
   }, (err) => next(err))
    .catch((err) => next(err));
})

.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
 
    res.statusCode = 403;
 res.end('PUT operation not supported on /promotions/' + req.params.promotionId + '/comments/' + req.params.commentId); 
})
 
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
  Promotions.findById(req.params.promotionId)
    .then((promotion) => {
       if(promotion != null && promotion.comments.id(req.params.commentId) != null){
         promotion.comments.id(req.params.commentId).remove();
           
        promotion.save()
         .then((promotion) => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
              res.json(promotion);
         },  (err) => next(err));
           
    }
     else if(promotion == null){
        err = new Error('Promotion' + req.params.promotionId + 'not found');
        err.status = 404;
         return next(err);
       
     }
       else {
             err = new Error('Comment' + req.params.commentId + 'not found');
        err.status = 404;
        return next(err);
       }
   },  (err) => next(err))
     .catch((err) => next(err));
});

module.exports = promotionRouter;