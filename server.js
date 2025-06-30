const express = require('express');

require('dotenv').config();

const app = express();

const port = 3000 || process.env.PORT;

app.listen(port,()=>{console.log(`serer is running on http://localhost:${port}`)})