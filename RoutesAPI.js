var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var Conversation = require('watson-developer-cloud/conversation/v1'); // watson sdk
var textToSpeech = require('watson-developer-cloud/text-to-speech/v1');
var voice = new textToSpeech ();
var ToneAnalyzerV3 = require('watson-developer-cloud/tone-analyzer/v3');
var toneAnalyzer = new ToneAnalyzerV3({
  version_date: '2017-09-21'
});
var omit = require('object.omit');

// Create the service wrapper
var conversation = new Conversation({
  'version_date': '2017-05-26'
});

var relayHandler = function relayHandler(req, res) {
  var relayState = req.query && req.query.RelayState || req.body && req.body.RelayState;
  var hashQuery = relayState && relayState.match(/^\#/) && ('/app'+relayState) || relayState  || '/';
  res.redirect(hashQuery);
};

module.exports = function(app, config, passport) {

  router.post("/message",function(req, res) {
    try {
      workspace=req.body.context.WORKSPACE_ID
    } catch (e) {
      workspace = req.session.WORKSPACE_ID || process.env.WORKSPACE_ID || '<workspace-id>';
    }

    if (!workspace || workspace === '<workspace-id>') {
      return res.json({
        'output': {
          'text': 'The app has not been configured with a <b>WORKSPACE_ID</b> environment variable. Please refer to the ' + '<a href="https://github.com/watson-developer-cloud/conversation-simple">README</a> documentation on how to set this variable. <br>' + 'Once a workspace has been defined the intents may be imported from ' + '<a href="https://github.com/watson-developer-cloud/conversation-simple/blob/master/training/car_workspace.json">here</a> in order to get a working application.'
        }
      });
    }
    // console.log(req.body.input.text)
    function sendToConversation()
    {
      var payload = {
        workspace_id: workspace,
        context: req.body.context || {},
        input: req.body.input || {}
      };
      // Send the input to the conversation service
      conversation.message(payload, function(err, data) {
        if (err) {
          return res.status(err.code || 500).json(err);
        }
        if(!data.context.WORKSPACE_ID)
          data.context.WORKSPACE_ID=workspace
        return res.json(updateMessage(payload, data));
      });
    }
    if(req.body.context)
      toneAnalyzer.tone({"text": req.body.input.text}, function(err, data)
      {
        if (err)
          req.body.context.document_tone = {"tones": []};
        req.body.context.document_tone = data.document_tone;
        return sendToConversation();
      })
    else
      return sendToConversation();
  });

  /**
  * Updates the response text using the intent confidence
  * @param  {Object} input The request to the Conversation service
  * @param  {Object} response The response from the Conversation service
  * @return {Object}          The response with the updated message
  */
  function updateMessage(input, response) {
    var responseText = null;
    if (!response.output) {
      response.output = {};
    } else {
      return response;
    }
    if (response.intents && response.intents[0]) {
      var intent = response.intents[0];
      if (intent.confidence >= 0.75) {
        responseText = 'I understood your intent was ' + intent.intent;
      } else if (intent.confidence >= 0.5) {
        responseText = 'I think your intent was ' + intent.intent;
      } else {
        responseText = 'I did not understand your intent';
      }
    }
    response.output.text = responseText;
    return response;
  }

  router.post('/talk', function(req, res) {
    if (req.user && req.body.text) {
    var params = {
      text: req.body.text,
      voice: 'en-US_AllisonVoice',
      accept: 'audio/ogg'
    };
    voice.synthesize(params).on('error', function(error) {
      console.log('Error:', error);
    }).pipe(res);
    } else {
      res.sendStatus(204);
    }
  });

  router.get('/get_user', function(req, res) {
    if (req.user) {
      res.json(omit(req.user, 'blueGroups')); //Conversation has a input limit of 1024 chars
    } else {
      res.sendStatus(403);
    }
  });

  return router;
};
