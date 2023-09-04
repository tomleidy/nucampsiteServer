const express = require('express');
const Partner = require('../models/partner')
const { verifyUser, verifyAdmin } = require('../authenticate')
const cors = require('./cors');

const partnerRouter = express.Router();

// This is definitely cleaner to look at.

partnerRouter.route('/')
    .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
    .get(cors.cors, async (req, res, next) => {

        try {
            const partners = await Partner.find()
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(partners);
        }
        catch (err) {
            next(err);
        }
    })
    .post(cors.corsWithOptions, verifyUser, verifyAdmin, async (req, res, next) => {
        try {
            const partner = await Partner.create(req.body)
            console.log('Partner Created ', partner);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(partner);
        }
        catch (err) { next(err); }
    })
    .put(cors.corsWithOptions, verifyUser, verifyAdmin, (req, res) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /partners');
    })
    .delete(cors.corsWithOptions, verifyUser, verifyAdmin, async (req, res, next) => {
        try {
            const response = await Partner.deleteMany()
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(response);
        }
        catch (err) { next(err); }
    })

partnerRouter.route('/:partnerId')
    .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
    .get(cors.cors, async (req, res, next) => {

        try {
            const partner = await Partner.findById(req.params.partnerId)
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(partner);
        }
        catch (err) { next(err); }
    })
    .post(cors.corsWithOptions, verifyUser, verifyAdmin, (req, res) => {
        res.statusCode = 403;
        res.end(`POST operation not supported on /partners/${req.params.partnerId}`);
    })
    .put(cors.corsWithOptions, verifyUser, verifyAdmin, async (req, res, next) => {
        try {
            const partner = await Partner.findByIdAndUpdate(req.params.partnerId, { $set: req.body }, { new: true })
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(partner);
        }
        catch (err) { next(err); }
    })
    .delete(cors.corsWithOptions, verifyUser, verifyAdmin, async (req, res, next) => {
        try {
            const response = await Partner.findByIdAndDelete(req.params.partnerId)
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(response);
        }
        catch (err) {
            next(err);
        }
    })


module.exports = partnerRouter;