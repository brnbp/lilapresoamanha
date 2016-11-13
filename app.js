const bodyParser = require('body-parser')
const request = require('request')
var path = require('path');
const fs = require('fs')
const express = require('express')
const app = express()

app.use(bodyParser.json())
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'jade')
app.use(express.static(path.join(__dirname, 'public')));

const consumerKey = process.env.KEY
const consumerSecret = process.env.SECRET
const bearerToken = process.env.BEARER
const auth = 'Bearer ' + bearerToken

app.get('/', function(req, res){
  fs.readFile('./tweets', 'utf8', function(err, data){
    if (err) throw err;

    const obj = JSON.parse(data.split("\n").join("<hr>"))

    const tweets = obj.filter(item => !item.text.startsWith('https://'))
    //console.log(tweets.map(i => console.log(i.text)))

    res.render('index', {tweets: tweets.reverse()})
    res.end()
  })
  /*getTweetsLila()*/
})

function getTweetsLila(){
  var tweets = [];

  getTweets(null, function (error, response, body){
    if (response.statusCode === 200 && body) {

      const content = Array.from(body)
      content.map(e => tweets.push(e))
      console.log('one done')


      const lastId = content[content.length - 1].id
      //tweets.push(content)

      getTweets(lastId, function (e, r, b) {
        if (r.statusCode === 200 && b) {
          const content = Array.from(b)
          content.map(e => tweets.push(e))
          const lastId = content[content.length - 1].id
          //fs.appendFile('./tweets', ',' + JSON.stringify(b))
          console.log('two done')

          getTweets(lastId, function (e, r, b) {
            if (r.statusCode === 200 && b) {
              const content = Array.from(b)
              content.map(e => tweets.push(e))
              fs.appendFile('./tweets', JSON.stringify(tweets))
              console.log('three done')
            }
          })

        }
      })

    }
  })

}

function getTweets(offset, callback){
  const lilauserId = '759405592029106200'
  var url = 'https://api.twitter.com/1.1/statuses/user_timeline.json?screen_name=lilapresoamanha&include_rts=false&count=200'

  if (offset) {
    url = url + '&max_id=' + offset
  }

  request({
    url: url,
    json: true,
    headers: {
      'Authorization': auth
    }
  }, callback)
}

function getBearerToken() {

  const auth = 'Basic ' + new Buffer(consumerKey + ':' + consumerSecret).toString('base64');

  request.post({
    url: "https://api.twitter.com/oauth2/token",
    json: true,
    body: 'grant_type=client_credentials',
    headers: {
      'Authorization': auth,
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
    }
  }, function (error, response, body){
    if (response.statusCode === 200 && body.token_type === 'bearer') {
      console.log(body.access_token)
    }
  })
}

app.listen(process.env.PORT || 3000)