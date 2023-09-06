const express = require('express');
const Favorite = require('../models/favorite')
const { verifyUser, verifyAdmin } = require('../authenticate');
const cors = require('./cors');
const Campsite = require('../models/campsite');

const favoriteRouter = express.Router();

const validIdFormat = id => id.length === 24;

// '/:campsiteId'
// put
// delete

favoriteRouter.route('/')
    .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
    .get(cors.cors, verifyUser, (req, res, next) => {
        console.log(req.user);
        Favorite.find({ user: req.user._id })
            .populate('user')
            .populate('campsites')
            .then(favorites => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorites);
            })
            .catch(err => next(err));
    })
    .post(cors.corsWithOptions, verifyUser, async (req, res, next) => {
        const getNewFavoriteIds = arr => arr.map(i => i._id);

        if (!Array.isArray(req.body)) return next(new Error(`Incorrect format, POST body must be an array`));

        if (req.body)
            try {
                let campsiteIdList = [];
                const userFavorites = await Favorite.findOne({ user: req.user._id });
                const campsites = await Campsite.find()
                campsites.forEach(campsite => campsiteIdList.push(campsite._id))
                let favoriteAddList = getNewFavoriteIds(req.body).filter(favorite => {
                    if (!validIdFormat(favorite)) return false;
                    if (userFavorites && userFavorites.campsites.includes(favorite)) return false;
                    if (campsiteIdList.includes(favorite)) return false;
                    return true;
                })
                if (userFavorites && userFavorites.campsites) {
                    favoriteAddList.forEach(favorite => {
                        userFavorites.campsites.push(favorite);
                    })
                    const reply = await userFavorites.save()
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(reply);
                } else {
                    let newFavoritesDoc = { user: req.user._id, campsites: favoriteAddList }
                    const reply = await Favorite.create(newFavoritesDoc);
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(reply);
                }
            } catch (err) { return next(err); }
    })
    .put(cors.corsWithOptions, verifyUser, verifyAdmin, (req, res) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /favorites');
    })
    .delete(cors.corsWithOptions, verifyUser, async (req, res) => {
        try {
            let deleted = await Favorite.findOneAndDelete({ user: req.user._id });
            console.log(deleted);
            res.statusCode = 200;
            if (deleted) {
                res.setHeader('Content-Type', 'application/json');
                res.json(deleted);
            } else {
                res.setHeader('Content-Type', 'text/html');
                res.end('You do not have any favorites to delete.');
            }
        } catch (err) { return next(err); }

    })



favoriteRouter.route('/:campsiteId')
    .get(cors.cors, verifyUser, (req, res) => {
        res.statusCode = 403;
        res.end('GET operation not supported on /favorites/' + req.params.campsiteId);

    })
    .post(cors.corsWithOptions, verifyUser, async (req, res, next) => {
        try {
            const userFavorites = await Favorite.findOne({ user: req.user._id });
            const campsites = await Campsite.find();
            let campsiteIdList = [];
            campsites.forEach(campsite => campsiteIdList.push(String(campsite._id)))
            console.log(req.params.campsiteId);
            console.log(campsiteIdList);
            console.log(campsiteIdList.includes(req.params.campsiteId));
            if (!validIdFormat(req.params.campsiteId) || !campsiteIdList.includes(req.params.campsiteId)) {
                res.statusCode = 404;
                res.header('Content-Type', 'text/html');
                return res.end('Campsite not found');
            };
            if (userFavorites && userFavorites.campsites.includes(req.params.campsiteId)) {
                res.statusCode = 409;
                res.header('Content-Type', 'text/html');
                return res.end('That campsite is already in the list of favorites!');
            }
            if (userFavorites && userFavorites.campsites) {
                userFavorites.campsites.push(req.params.campsiteId);
                const reply = await userFavorites.save()
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                return res.json(reply);
            }
            let newFavoritesDoc = { user: req.user._id, campsites: [req.params.campsiteId] }
            const reply = await Favorite.create(newFavoritesDoc);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            return res.json(reply);
        } catch (err) { return next(err); }
    })
    .put(cors.corsWithOptions, verifyUser, (req, res) => {
        res.statusCode = 403;
        res.end(req.method + ' operation not supported on /favorites/' + req.params.campsiteId);

    })
    .delete(cors.corsWithOptions, verifyUser, async (req, res, next) => {
        try {
            const userFavorites = await Favorite.findOne({ user: req.user._id });
            if (!userFavorites) {
                res.statusCode = 404;
                res.header('Content-Type', 'text/plain');
                return res.end('No favorites to delete');
            }
            // no reason to test for if the campsiteId isn't in the array, but I could.
            let newFavorites = userFavorites.campsites.filter(fave => String(fave) !== req.params.campsiteId)
            userFavorites.campsites = newFavorites;
            console.log(userFavorites.campsites);
            res.statusCode = 200;
            res.header('Content-Type', 'application/json');
            res.json(await userFavorites.save())


        } catch (err) { return next(err); }
    })


module.exports = favoriteRouter;