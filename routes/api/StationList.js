const express = require('express');
const router = express.Router();


// Station Model
const StationList = require('../../models/StationList');

// @route   GET api/StationList
// @desc    get all projects
// @access  Public
router.get('/', (req, res) => {
    //console.log(req.params)
    StationList.find(req.params)
        //.sort({ RainData: { date: -1 } })
        .then(data => res.json(data));
});

// @route   GET api/StationList
// @desc    get all WV projects
// @access  Public
router.get('/WV', (req, res) => {
    console.log("router triggered", req)
    StationList.find({'stateName': 'West Virginia'})
        //.sort({ RainData: { date: -1 } })
        .then(data => res.json(data));
});

// @route   GET api/StationList
// @desc    get all NC projects
// @access  Public
router.get('/NC', (req, res) => {
    //console.log(req)
    StationList.find({'stateName': 'North Carolina'})
        //.sort({ RainData: { date: -1 } })
        .then(data => res.json(data));
});

// @route   GET api/StationList
// @desc    get all MVP projects
// @access  Public
router.get('/MVP', (req, res) => {
    //console.log(req)
    StationList.find({'stateName': 'MVP'})
        //.sort({ RainData: { date: -1 } })
        .then(data => res.json(data));
});

// @route   DELETE api/StationList
// @desc    Delete a station
// @access  Public
// Rest of your variables you are pulling in will need to go here under req.body.name
router.delete('/:_id', (req, res) => {
    StationList.findById(req.params.id)
        .then(data => data.remove().then(() => res.json({success: true})))
        .catch(err => res.status(404).json({success: false}));
})

// @route   POST api/StationList
// @desc    Create an item
// @access  Public
// Rest of your variables you are pulling in will need to go here under req.body.name
router.post('/', (req, res) => {
    const newData = new StationList({
        jobName: req.body.jobName,
        primary: req.body.primary,
        secondary: req.body.secondary,
        tertiary: req.body.tertiary,
        trigger: req.body.trigger,
        stateName: req.body.stateName
    });
    newData.save().then(data => res.json(data));
});  //add error handling here? https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs/mongoose#Using_models

// @route   PUT api/StationList
// @desc    Create an item
// @access  Public
// Rest of your variables you are pulling in will need to go here under req.body.name
router.put('/:_id', (req, res, next) => {
    // const newData = new StationList({
    //     job: {
    //         name: req.body.job.name,
    //         primary: req.body.job.primary,
    //         secondary: req.body.job.secondary,
    //         tertiary: req.body.job.tertiary
    //     },
    //     name: req.body.name
    // });
    console.log(req.params._id);

    StationList.findByIdAndUpdate(req.params._id, req.body, (err, post) => {
        if (err) return next(err);
        res.json(req.body);
    });
    //newData.save().then(data => res.json(data));
});
module.exports = router;