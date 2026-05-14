"use strict";
const exp = require("express");
require("dotenv").config();
const app = exp();
const port_num = process.env.PORT || 3000;
const body_parser = require("body-parser");
const mongoose = require("mongoose");
const line_reader = require("readline");

const searchRouter = require("./routes/search");
const entriesRouter = require("./routes/entries");

app.set("view engine", "ejs");
app.set("views", "./views");
app.use(body_parser.urlencoded({ extended: false }));
app.use(exp.static("public"));

const uri = process.env.MONGO_CONNECTION_STRING;

async function DBConnection() {
    await mongoose.connect(uri);
    console.log("Connected to MongoDB");
}

DBConnection().catch(console.error);

app.get("/", (request, response) => {
    response.render("index");
});

app.use("/search", searchRouter);
app.use("/entries", entriesRouter);

app.listen(port_num, () => {
    console.log(`Web server started and running at http://localhost:${port_num}`);
});

const input_output = line_reader.createInterface({
    input: process.stdin,
    output: process.stdout
});

function main_prompt() {
    input_output.question("Type stop to shutdown the server: ", function (user_response) {
        if (user_response === "stop") {
            console.log("Shutting down the server");
            process.exit(0);
        }
        main_prompt();
    });
}

main_prompt();
