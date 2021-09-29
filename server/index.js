import express from "express";
import db from "./db.js";
import Post from "./models/post.js";
import route from './routes/index.js'
const port = 3000;
const app = express();

route(app)

app.listen(port, () => {
  console.log("Listen port " + port);
});
