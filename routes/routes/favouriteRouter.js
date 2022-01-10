const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');
const cors = require('./cors');
const Favourites = require('../models/favourite');
const Dishes = require('../models/dishes');

const favouriteRouter = express.Router();

favouriteRouter.use(bodyParser.json());

favouriteRouter.route('/')
.options(cors.corsWithOptions,(req,res) =>{
    res.sendStatus(200);
})

.get(cors.cors, authenticate.verifyUser, (req,res,next) =>{
    Favourites.findOne({ user: req.user._id}, (err,favorite)=>{
        if(err){ return next(err);}
        if(!favorite){
            res.statusCode = 403;
            res.end("No favorites found!!");
        }
    })
    .populate('user')
    .populate('dishes')
    .then((favorites) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorites);
    }, (err)=>next(err));
})

.post(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) =>{
          Favourites.findOne({user: req.user._id}, (err, favorite) =>{
            if(err){ return next(err); }
            if(!favorite){
                Favorites.create({ user: req.user._id})
                .then((favorite) => {
                    for(var dish = 0; dish< req.body.dishes.length; dish++)
                    {
                        favorite.dishes.push(req.body.dishes[dish]);
                    }
                    favorite.save()
                    .then((favorite) =>{
                        console.log('favorite Created ', favorite);
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favorite);
                    });
            }, (err) => next(err))
            .catch((err) => next(err));
            }else{
                for(var dish = 0; dish< req.body.dishes.length; dish++)
                {
                    if(favorite.dishes.indexOf(req.body.dishes[dish])< 0){
                        favorite.dishes.push(req.body.dishes[dish]);
                    }
                }   
                favorite.save()
                .then((favorite) =>{
                    console.log('favorite added ', favorite);
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                });
            }
        });
})


.put(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) =>{
    res.statusCode = 403;
    res.end(`PUT operation not supported on /favorites`);
})

.delete(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) =>{
    Favourites.remove({user: req.user._id})
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
})


favouriteRouter.route('/:dishId')
.options(cors.corsWithOptions, (req,res) =>{
    res.sendStatus(200);
})

.get(cors.cors, authenticate.verifyUser, (req,res,next) =>{
    Favourites.findById(req.params.dishId)
    .populate('user')
    .populate('dish')
    .then((Favorites) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(Favorites);
    }, (err) => next(err))
    .catch((err) => next(err));
})

.post(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) =>{
        Favourites.findOne({user: req.user._id}, (err, favorite) =>{
            if(err){ return next(err); }
            if(!favourite){
                Favourites.create({ user: req.user._id})
                .then((favorite) => {
                    favourite.dishes.push(req.params.dishId);
                    favourite.save()
                    .then((favorite) =>{
                        console.log('favorite Created ', favorite);
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favorite);
                    });
            }, (err) => next(err))
            .catch((err) => next(err));
            }else{
                if(favourite.dishes.indexOf(req.params.dishId)< 0){
                    favourite.dishes.push(req.params.dishId);
                    favourite.save()
                    .then((favourite) =>{
                        console.log('favourite added ', favourite);
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favorite);
                    });
                }else{
                    res.statusCode = 200;
                    res.end("Favorite already added!!");
                }
            }
        });
})

.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) =>{
    res.statusCode = 403;
    res.end(`PUT operation not supported on /favourites`);
})

.delete(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) =>{
    
    Favourites.findOne({user: req.user._id}, (err,favorite) =>{
        if(err){
            return next(err);
        }
        if(!favourite){
            res.statusCode = 200;
            res.end("No favorite to delete");
        }
        var index = favourite.dishes.indexOf(req.params.dishId);
        if(index>-1)
        {
            favourite.dishes.splice(index,1);
            favourite.save()
            .then((resp) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(resp);
            }, (err) => next(err))
            .catch((err) => next(err));
        }
    });
});

module.exports = favouriteRouter;