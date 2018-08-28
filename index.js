const LINE_CHANNEL_ACCESS_TOKEN = 'h6q3KVIwGb8XULyKnh/MoRedLHZvuQkmUZMI1k0FshhriZLMLhjZM1OQAuj4ZZ81uVlgMkuEwj1vfPavFop9aGcAgdntr7jh0hx9o9X+lxjBFuIlom7d5JKlXHOnJ/3AG69goXt87/wxrhN1VkmmKgdB04t89/1O/w1cDnyilFU='; 


const server = require("express")();
const line = require("@line/bot-sdk"); 


const line_config = {
    channelAccessToken: process.env.LINE_ACCESS_TOKEN, 
    channelSecret: process.env.LINE_CHANNEL_SECRET 
};


server.listen(process.env.PORT || 3000);

const bot = new line.Client(line_config);



server.post('/webhook', line.middleware(line_config), (req, res, next) => {
    res.sendStatus(200);

    
    let events_processed = [];

    
    req.body.events.forEach((event) => {
        
        if (event.type == "message" && event.message.type == "text"){
            
            if (event.message.text == "こんにちは"){
                
                events_processed.push(bot.replyMessage(event.replyToken, {
                    type: "text",
                    text: "これはこれは"
                }));
            }
        }
    });

    
    Promise.all(events_processed).then(
        (response) => {
            console.log(`${response.length} event(s) processed.`);
        }
    );
});
