const express = require("express");
const mongoose = require("mongoose");
const MongoStore = require("connect-mongo");
const cors = require("cors");
const helmet = require("helmet");
const energy= require("./router/energy");

require('dotenv').config();

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());


mongoose.connect("mongodb+srv://shahid:dihahs169@energydb.cobbd.mongodb.net/?retryWrites=true&w=majority&appName=EnergyDB")
  .then(() => console.log("Db connect aiducha daa Bunda"))
  .catch((err) => console.error("Failed to connect to MongoDB:", err.message));

app.use(energy);

app.listen(3000, () => {
  console.log("Dei punda port on 3000");
});
