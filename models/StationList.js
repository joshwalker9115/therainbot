const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// const oldStationListSchema = new Schema(
//     {
//         name: {
//             type: String,
//             required: true
//         },
//         job: {
//             name: {
//                 type: String,
//                 required: true
//             },
//             primary: {
//                 type: String,
//                 required: true   
//             },
//             secondary: {
//                 type: String
//             },
//             tertiary:{
//                 type: String
//             }
//         }
//     }
// );

const StationListSchema = new Schema(
    {
        stateName: {
            type: String,
            required: true
        },
        jobName: {
            type: String,
            required: true
        },
        primary: {
            type: String,
            required: true   
        },
        secondary: {
            type: String
        },
        tertiary:{
            type: String
        },
        trigger: {
            type: Schema.Types.Mixed,
            required: true
        }
    }
);

module.exports = StationList = mongoose.model('StationList', StationListSchema);