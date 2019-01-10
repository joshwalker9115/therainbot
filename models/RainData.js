const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
const RainDataSchema = new Schema(
    {
        station: [{
            number: {
                type: String,
                required: true
            },           
            name: {
                type: String
            },
            data: [{                
                instance: {
                    date: {
                        type: String,
                        required: true
                    },
                    total: {
                        type: Number
                    },
                    values: [{
                        time: {
                            type: String,
                            required: true
                        },
                        hourly: {
                            type: Number
                        },
                        total: {
                            type: Number
                        }
                    }]
                }
            }]
        }]        
    }
);

module.exports = RainData = mongoose.model('RainData', RainDataSchema);