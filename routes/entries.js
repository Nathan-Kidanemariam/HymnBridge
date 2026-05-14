"use strict";
const exp = require("express");
const entries_router = exp.Router();
const Entry = require("../models/Entry");

entries_router.get("/", async (request, response) => {
    try {
        const dateObj = new Date().toString();
        const all_entries = await Entry.find({}).sort({ _id: -1 });

        let entriesContent = "";

        if (all_entries.length === 0) {
            entriesContent = `
                <div class="box">
                    <p>No entries saved yet.
                    <a href="/search">Search for music</a> or
                    <a href="/entries/new">add one manually</a>.</p>
                </div>
            `;
        } else {
            all_entries.forEach((entry) => {
                entriesContent += `
                    <div class="card">
                        <div class="card-top">
                            <h3><a href="${entry.link}" target="_blank">${entry.title}</a></h3>
                            <span class="category">${entry.category}</span>
                        </div>

                        <p class="artist">&#127911; ${entry.artist}</p>
                        <p class="reflection">"${entry.reflection}"</p>
                        <p class="date">Saved: ${entry.savedAt}</p>

                        <form action="/entries/${entry._id}/delete" method="post" class="delete-form">
                            <input type="submit" value="Remove" class="delete">
                        </form>
                    </div>
                `;
            });
        }

        response.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Saved Entries - HymnBridge</title>
                <link rel="stylesheet" href="/styles/style.css">
            </head>

            <body>
                <div class="container">
                    <header class="header">
                        <h1>&#9836; HymnBridge</h1>
                        <p class="text">Your saved collection</p>
                    </header>

                    <nav class="links">
                        <a href="/">Home</a>
                        <a href="/search">Search Music</a>
                        <a href="/entries">Saved Entries</a>
                        <a href="/entries/new">Add Entry</a>
                    </nav>

                    <main>
                        <div class="top">
                            <h2>Saved Entries</h2>
                            <p class="time">Retrieved at: ${dateObj}</p>
                        </div>

                        <div class="cards">
                            ${entriesContent}
                        </div>
                    </main>

                    <footer class="footer">
                        <div class="bottom">
                            <a href="/">&copy; HymnBridge &mdash; Preserving Songs Across Cultures</a>
                        </div>
                    </footer>
                </div>
            </body>
            </html>
        `);
    } catch (err) {
        response.send(`<h1>Error retrieving entries</h1><p>${err.message}</p><a href="/">HOME</a>`);
    }
});

entries_router.get("/new", (request, response) => {
     let title = request.query.title;
     let artist = request.query.artist;
     let link = request.query.link;
     if (title === undefined) {
        title = "";
     }
     if (artist === undefined) {
        artist = "";
     }
     if (link === undefined) {
        link = "";
     }
     const prefill = {
        title: title,
        artist: artist,
        link: link
     };
    response.render("newEntry", { prefill });
});

entries_router.post("/", async (request, response) => {
    try {
        const dateObj = new Date().toString();
        const new_entry = new Entry({
            title: request.body.title,
            artist: request.body.artist,
            link: request.body.link,
            category: request.body.category,
            reflection: request.body.reflection,
            savedAt: dateObj
        });

        await new_entry.save();
        response.send(`
            <h1 style="font-family: serif; color: #6b1d1d;">Entry Saved!</h1>
            <p><strong>Title:</strong> ${new_entry.title}</p>
            <p><strong>Artist / Channel:</strong> ${new_entry.artist}</p>
            <p><strong>Category:</strong> ${new_entry.category}</p>
            <p><strong>Reflection:</strong> ${new_entry.reflection}</p>
            <hr>
            <p><strong>Saved at ${dateObj}</strong></p>
            <hr>
            <a href="/entries">View All Entries</a> &nbsp;|&nbsp; <a href="/">HOME</a>
        `);
    } catch (err) {
        response.send(`<h1>Error saving entry</h1><p>${err.message}</p><a href="/entries/new">Go Back</a>`);
    }
});

entries_router.post("/:id/delete", async (request, response) => {
    try {
        await Entry.findByIdAndDelete(request.params.id);
        response.redirect("/entries");
    } catch (err) {
        response.send(`<h1>Error deleting entry</h1><p>${err.message}</p><a href="/entries">Go Back</a>`);
    }
});

module.exports = entries_router;
