const LINE_CHANNEL_ACCESS_TOKEN = 'h6q3KVIwGb8XULyKnh/MoRedLHZvuQkmUZMI1k0FshhriZLMLhjZM1OQAuj4ZZ81uVlgMkuEwj1vfPavFop9aGcAgdntr7jh0hx9o9X+lxjBFuIlom7d5JKlXHOnJ/3AG69goXt87/wxrhN1VkmmKgdB04t89/1O/w1cDnyilFU=';

var request = require('request');

module.exports = class dietitian {
    static replyTotalCalorie(replyToken, foodList){
        var totalCalorie = 0;
        for (var food of foodList){
            totalCalorie += food.calorie;
        }

        var headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + LINE_CHANNEL_ACCESS_TOKEN
        }
        var body = {
            replyToken: replyToken,
            messages: [{
                type: 'text',
                text: 'カロリーは合計' + totalCalorie + 'kcalです！'
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

    static askWhichFood(replyToken, foodList){
        var headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + LINE_CHANNEL_ACCESS_TOKEN
        }
        var body = {
            replyToken: replyToken,
            messages: [{
                type: 'template',
                altText: 'どの食品が最も近いですか？',
                template: {
                    type: 'buttons',
                    text: 'どの食品が最も近いですか？',
                    actions: []
                }
            }]
        }
        for (var food of foodList){
            body.messages[0].template.actions.push({
                type: 'postback',
                label: food.food_name,
                data: JSON.stringify(food)
            });

            if (body.messages[0].template.actions.length == 4){
                break;
            }
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
