"use strict";
const mongoose = require("mongoose");

const entrySchema = new mongoose.Schema({
    title: { type: String, required: true },
    artist: { type: String, required: true },
    link: { type: String, required: true },
    category: { type: String, required: true },
    reflection: { type: String, required: true },
    savedAt: { type: String, default: () => new Date().toString() }
});

const Entry = mongoose.model("Entry", entrySchema);

module.exports = Entry;
