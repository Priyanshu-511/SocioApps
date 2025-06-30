const express = require('express');

const router = require('./router/PersonRoutes');

require('dotenv').config();

const app = express();

app.set('view engine', 'ejs');
app.set('views','./views')

app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.use(router);

const port = 3000 || process.env.PORT;

app.listen(port,()=>{console.log(`serer is running on http://localhost:${port}`)})