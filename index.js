var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var Botmetrics = require('botmetrics');
var request = require("request");

app.use(bodyParser.json()); // for parsing application/json

app.get('/webhooks', function(req, res) {
  var verifyToken = req.query['hub.verify_token'];
  var hubChallenge = req.query['hub.challenge'];

  if(verifyToken == process.env.VERIFY_TOKEN) {
    res.status(200).send(hubChallenge);
  } else {
    res.status(403).send("invalid token");
  }
});

app.post('/webhooks', function(req, res) {
  var entries = null;

  if(entries = req.body['entry']) {
    var entry = entries[0];
    var messaging = null;

    if(messaging = entry['messaging']) {
      var messagingPayload = messaging[0];
      var message = messagingPayload['message'];

      if(message && !message['is_echo']) {
        var recipient = messagingPayload.sender.id;
        var text = message.text;
        var messageData = { text: "You said '" + text + "'!" };

        request({
          url: "https://graph.facebook.com/v2.6/me/messages",
          qs: { access_token: process.env.PAGE_ACCESS_TOKEN },
          method: "POST",
          json: {
            recipient: { id: recipient },
            message: messageData
          }
        }, function(err, response, body) {

        });
      }
    }
  }

  Botmetrics.track(req.body);

  res.status(200).send("success");
});

var port = process.env.PORT || 5000;

app.listen(port, function () {
  console.log('echobot listening on port ' + port + '!');
});
