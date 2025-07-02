const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const connectDb = require('./database/database');
const router = require('./router/PersonRoutes');

require('dotenv').config();

const app = express();

app.set('view engine', 'ejs');
app.set('views', './views');

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

connectDb();

app.use(router);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`server is running on http://localhost:${port}`);
});