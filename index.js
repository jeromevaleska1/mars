const express = require('express')
const app = express()
const port = process.env.PORT || 3000
const Routing = require('./services/routing');
new Routing(app)
app.listen(port, () => console.log(`listening on ${port}`))

