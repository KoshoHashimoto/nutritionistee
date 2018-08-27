const LINE_CHANNEL_ACCESS_TOKEN = 'U0l6MKguAZVZIzfdkPHkdiPnp/kUoNzCNMp228I9CB4u3UZN8e55SjtasTJr1w0KuVlgMkuEwj1vfPavFop9aGcAgdntr7jh0hx9o9X+lxgzR+aI1RUTvUYjgpWZGnewCWWeVZ9EPUCNavdHKp2srQdB04t89/1O/w1cDnyilFU='; 

var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var app = express();

app.use(bodyParser.json());


var port = (process.env.PORT || 3000);
var server = app.listen(port, function() {
    console.log('Node is running on port ' + port);
});


app.post('/webhook', function(req, res, next){
    res.status(200).end();
    for (var event of req.body.events){
        if (event.type == 'message' && event.message.text == 'ÉnÉçÅ['){
            var headers = {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + LINE_CHANNEL_ACCESS_TOKEN
            }
            var body = {
                replyToken: event.replyToken,
                messages: [{
                    type: 'text',
                    text: 'Ç±ÇÒÇ…ÇøÇÕÅ['
                }]
            }
            var url = 'https://api.line.me/v2/bot/message/reply';
            request({
                url: url,
                method: 'POST',
                headers: headers,
                body: body,
                json: true
            });
        }
    }
});