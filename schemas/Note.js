var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var NoteSchema = new Schema({
    content: {
        type: String,
        trim: true,
        default: ''
    }
});

NoteSchema.statics.fromId = function(id, callback) {
    Note.findOne({ _id: id })
        .exec(function(err, note) {
            if (err) return callback(err);
            if (!note) {
                var err = new Error('Note not found.')
                err.status = 401;
                return callback(err);
            }
            return callback(null, note);
        });
}

var Note = mongoose.model('Note', NoteSchema);
module.exports = Note;
