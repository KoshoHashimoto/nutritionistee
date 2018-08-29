// -----------------------------------------------------------------------------
// モジュールのインポート
const server = require("express")();
const bodyParser = require('body-parser');
const app = express();
const request = require('request');
const mecab = require('mecabaas-client'); 
const shokuhin = require('shokuhin-db');
const memory = require('memory-cache');
const dietitian = require('./dietitian');
const line = require("@line/bot-sdk"); // Messaging APIのSDKをインポート

// -----------------------------------------------------------------------------
// パラメータ設定
const line_config = {
    channelAccessToken: process.env.LINE_ACCESS_TOKEN, // 環境変数からアクセストークンをセットしています
    channelSecret: process.env.LINE_CHANNEL_SECRET // 環境変数からChannel Secretをセットしています
};

// -----------------------------------------------------------------------------
// Webサーバー設定
server.listen(process.env.PORT || 3000);

// APIコールのためのクライアントインスタンスを作成
const bot = new line.Client(line_config);

// -----------------------------------------------------------------------------
// ルーター設定
server.post('/webhook', line.middleware(line_config), (req, res, next) => {
    // 先行してLINE側にステータスコード200でレスポンスする。
    res.sendStatus(200);

    // すべてのイベント処理のプロミスを格納する配列。
    let events_processed = [];

    // イベントオブジェクトを順次処理。
    req.body.events.forEach((event) => {
        // この処理の対象をイベントタイプがメッセージで、かつ、テキストタイプだった場合に限定。
        if (event.type == "message" && event.message.type == "text"){
   // Mecabクラウドサービスでメッセージを解析
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
                function(response){
// 記憶すべき情報を整理する。
                    var botMemory = {
                        confirmedFoodList: [],
                        toConfirmFoodList: [],
                        confirmingFood: null
                    }
                    for (var nutritionList of responseList){
                        if (nutritionList.length == 0){
                            // 少なくとも今回の食品DBでは食品と判断されなかったのでスキップ。
                            continue;
                        } else if (nutritionList.length == 1){
                            // 該当する食品が一つだけ見つかったのでこれで確定した食品リストに入れる。
                            botMemory.confirmedFoodList.push(nutritionList[0]);
                        } else if (nutritionList.length > 1){
                            // 複数の該当食品が見つかったのでユーザーに確認するリストに入れる。
                            botMemory.toConfirmFoodList.push(nutritionList);
                        }
                    }

                    /*
                     * もし確認事項がなければ、合計カロリーを返信して終了。
                     * もし確認すべき食品があれば、質問して現在までの状態を記憶に保存。
                     */
                    if (botMemory.toConfirmFoodList.length == 0 && botMemory.confirmedFoodList.length > 0){
                        console.log('Going to reply the total calorie.');

                        // 確認事項はないので、確定した食品のカロリーの合計を返信して終了。
                        dietitian.replyTotalCalorie(event.replyToken, botMemory.confirmedFoodList);

                    } else if (botMemory.toConfirmFoodList.length > 0){
                        console.log('Going to ask which food the user had');

                        // どの食品が正しいか確認する。
                        dietitian.askWhichFood(event.replyToken, botMemory.toConfirmFoodList[0]);

                        // ユーザーに確認している食品は確認中のリストに入れ、確認すべきリストからは削除。
                        botMemory.confirmingFood = botMemory.toConfirmFoodList[0];
                        botMemory.toConfirmFoodList.splice(0, 1);

                        // Botの記憶に保存
                        memory.put(event.source.userId, botMemory);
                    }
                }
            );
        }
    }
});
