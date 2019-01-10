const express = require('express');
const router = express.Router();

// Item Model
const Data = require('../../models/RainData');

// @route   GET api/RainData
// @desc    get all RainData
// @access  Public
router.get('/RainData', (req, res) => {
    Data.find()
        //.sort({ RainData: { date: -1 } })
        .then(data => res.json(data));
});

// @route   POST api/items
// @desc    Create an item
// @access  Public
// Rest of your variables you are pulling in will need to go here under req.body.name
router.delete('/RainData:_id', (req, res) => {
    Data.findById(req.params.id)
        .then(data => data.remove().then(() => res.json({success: true})))
        .catch(err => res.status(404).json({success: false}));
})

// @route   DELETE api/items
// @desc    Delete an item
// @access  Public
// Rest of your variables you are pulling in will need to go here under req.body.name
router.post('/RainData', (req, res) => {
    const newData = new Data({
        station: req.body.station,
        data: req.body.data
    });

    newData.save().then(data => res.json(data));
});

module.exports = router;