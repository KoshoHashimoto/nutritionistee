const LINE_CHANNEL_ACCESS_TOKEN = 'h6q3KVIwGb8XULyKnh/MoRedLHZvuQkmUZMI1k0FshhriZLMLhjZM1OQAuj4ZZ81uVlgMkuEwj1vfPavFop9aGcAgdntr7jh0hx9o9X+lxjBFuIlom7d5JKlXHOnJ/3AG69goXt87/wxrhN1VkmmKgdB04t89/1O/w1cDnyilFU='; 

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
        if (event.type == 'message' && event.message.text == 'ハロー'){
            var headers = {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + LINE_CHANNEL_ACCESS_TOKEN
            }
            var body = {
                replyToken: event.replyToken,
                messages: [{
                    type: 'text',
                    text: 'こんにちはー'
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
