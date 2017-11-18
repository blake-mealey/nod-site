var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var NoteSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    id: {
        type: Schema.Types.ObjectId,
        unique: true,
        required: true
    },
    modified: {
        type: Date,
        default: Date.now
    }
});

var FolderSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        unique: true,
        required: true
    },
    notes: [NoteSchema]
});

FolderSchema.statics.fromUserId = function(id, callback) {
    Folder.find({ userId: id })
        .exec(function(err, folders) {
            if (err) return callback(err);
            return callback(null, folders);
        });
}

var Folder = mongoose.model('Folder', FolderSchema);
module.exports = Folder;