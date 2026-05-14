"use strict";

const exp = require("express");
const search_router = exp.Router();

function buildSearchPage(query, resultsHTML, errorHTML, noResultsHTML) {
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Search Music - HymnBridge</title>
            <link rel="stylesheet" href="/styles/style.css">
        </head>

        <body>
            <div class="container">
                <header class="header">
                    <h1>&#9836; HymnBridge</h1>
                    <p class="text">Search for cultural songs and hymns</p>
                </header>

                <nav class="links">
                    <a href="/">Home</a>
                    <a href="/search">Search Music</a>
                    <a href="/entries">Saved Entries</a>
                    <a href="/entries/new">Add Entry</a>
                </nav>

                <main>
                    <div class="search">
                        <h2>Search YouTube for Music</h2>

                        <form action="/search" method="post">
                            <label for="query">
                                <u>Search for a hymn, folk song, or cultural music:</u>
                            </label>

                            <input
                                id="query"
                                name="query"
                                type="text"
                                placeholder="e.g. Ethiopian hymn, Irish folk song, Appalachian music"
                                value="${query}"
                                required
                                autofocus
                            >

                            <input id="searchButton" type="submit" value="Search">
                        </form>
                    </div>

                    ${errorHTML}
                    ${resultsHTML}
                    ${noResultsHTML}
                </main>

                <footer class="footer">
                    <div class="bottom">
                        <a href="/">
                            &copy; HymnBridge &mdash; Preserving Songs Across Cultures
                        </a>
                    </div>
                </footer>
            </div>
        </body>
        </html>
    `;
}

search_router.get("/", (request, response) => {
    response.send(buildSearchPage("", "", "", ""));
});

search_router.post("/", async (request, response) => {
    const query = request.body.query;
    const api_key = process.env.YOUTUBE_API_KEY;

    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=8&q=${encodeURIComponent(query)}&key=${api_key}`;

    try {
        const fetch_module = await import("node-fetch");
        const fetch = fetch_module.default;

        const api_response = await fetch(url);
        const data = await api_response.json();

        if (data.error) {
            const errorHTML = `
                <div class="error-box">
                    <p><strong>Error:</strong> ${data.error.message}</p>
                </div>
            `;

            response.send(buildSearchPage(query, "", errorHTML, ""));
            return;
        }

        let resultsHTML = "";
        let noResultsHTML = "";

        if (data.items && data.items.length > 0) {
            resultsHTML += `
                <div class="results-header">
                    <h3>Results for: "${query}"</h3>
                </div>

                <div class="results">
            `;

            data.items.forEach((item) => {
                let title = item.snippet.title;
                let channel = item.snippet.channelTitle;
                let description = item.snippet.description;
                if (description === undefined) {
                    description = "";
                }
                let shortDescription = description;
                if (description.length > 100) {
                    shortDescription = description.substring(0, 100) + "...";
                }
                
                const videoId = item.id.videoId;
                const thumbnail = item.snippet.thumbnails.medium.url;
                const link = `https://www.youtube.com/watch?v=${videoId}`;

                resultsHTML += `
                    <div class="music">
                        <img src="${thumbnail}" alt="${title}">

                        <div class="info">
                            <h4>${title}</h4>
                            <p class="channel">&#127911; ${channel}</p>
                            <p class="desc">${shortDescription}</p>

                            <div class="actions">
                                <a href="${link}" target="_blank" class="small">
                                    Watch on YouTube
                                </a>

                                <a
                                    href="/entries/new?title=${encodeURIComponent(title)}&artist=${encodeURIComponent(channel)}&link=${encodeURIComponent(link)}"
                                    class="small save"
                                >
                                    Save Entry
                                </a>
                            </div>
                        </div>
                    </div>
                `;
            });

            resultsHTML += `</div>`;
        } else {
            noResultsHTML = `
                <p class="no-results">
                    No results found for "${query}". Try a different search term.
                </p>
            `;
        }

        response.send(buildSearchPage(query, resultsHTML, "", noResultsHTML));
    } catch (err) {
        const errorHTML = `
            <div class="error-box">
                <p><strong>Error:</strong> Failed to fetch results. Check your API key.</p>
            </div>
        `;

        response.send(buildSearchPage(query, "", errorHTML, ""));
    }
});

module.exports = search_router;