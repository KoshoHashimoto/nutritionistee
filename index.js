const server = require("express")();
const mecab = require('mecabaas-client');
const memory = require('memory-cache');
const dietitian = require('./dietitian');
const line = require("@line/bot-sdk"); 


const line_config = {
    channelAccessToken: process.env.LINE_ACCESS_TOKEN, 
    channelSecret: process.env.LINE_CHANNEL_SECRET 
};


server.listen(process.env.PORT || 3000);

const bot = new line.Client(line_config);

app.post('/webhook', function(req, res, next){
    res.status(200).end();
    for (var event of req.body.events){
        if (event.type == 'message' && event.message.text){
            mecab.parse(event.message.text)
            .then(
                function(response){
                    var foodList = [];
                    for (var elem of response){
                        if (elem.length > 2 && elem[1] == '名詞'){
                            foodList.push(elem);
                        }
                    }
                    var gotAllNutrition = [];
                    if (foodList.length > 0){
                        for (var food of foodList){
                            gotAllNutrition.push(shokuhin.getNutrition(food[0]));
                        }
                        return Promise.all(gotAllNutrition);
                    }
                }
            ).then(
                function(responseList){
                    var botMemory = {
                        confirmedFoodList: [],
                        toConfirmFoodList: [],
                        confirmingFood: null
                    }
                    for (var nutritionList of responseList){
                        if (nutritionList.length == 0){
                            continue;
                        } else if (nutritionList.length == 1){
                            botMemory.confirmedFoodList.push(nutritionList[0]);
                        } else if (nutritionList.length > 1){
                            botMemory.toConfirmFoodList.push(nutritionList);
                        }
                    }

                    if (botMemory.toConfirmFoodList.length == 0 && botMemory.confirmedFoodList.length > 0){
                        console.log('Going to reply the total calorie.');

                        dietitian.replyTotalCalorie(event.replyToken, botMemory.confirmedFoodList);

                    } else if (botMemory.toConfirmFoodList.length > 0){
                        console.log('Going to ask which food the user had');

                        dietitian.askWhichFood(event.replyToken, botMemory.toConfirmFoodList[0]);

                        botMemory.confirmingFood = botMemory.toConfirmFoodList[0];
                        botMemory.toConfirmFoodList.splice(0, 1);
                        memory.put(event.source.userId, botMemory);
                    }
                }
            );
        }
    }
});
