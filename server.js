const express = require('express')
const bodyParser = require('body-parser')
const app = express()
app.use(bodyParser.json());

app.get('/', function(req, res){
	res.json({recommend: "More https://www.softwaredaily.com"})
})

const port = process.env.PORT || 5000
app.listen(port)

console.log('server started ' + port)
