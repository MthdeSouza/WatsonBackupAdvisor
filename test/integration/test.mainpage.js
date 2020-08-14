/**
 * Copyright 2015 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/* eslint no-undef: 0 */

casper.test.begin('Celeste Conversation', function suite(test) {
  var baseHost = 'http://localhost:3000';

  function testWelcomeMessageExists() {
    casper.waitForSelector('.from-watson', function () {
      test.assertExists('.message-inner', 'Welcome message received');
    });
  }

  function testEnterMessageClick() {
    casper.then(function () {
      this.sendKeys('#textInput', 'Hi!');
      this.sendKeys('#textInput', casper.page.event.key.Enter);
    });
    casper.waitForSelector('.from-user', function () {
      test.assertExists('.message-inner', 'Message sent');
      test.assertTextExists('Hi!', 'Message in chat');
    });
    casper.waitForSelector('.segments:last-child .from-watson', function () {
      test.assertSelectorHasText('.segments:last-child .from-watson', 'help', 'Celeste answered');
    });
  }

  casper.start(baseHost, function () {
    casper.test.comment('Starting Testing');
    test.assertHttpStatus(200, 'Conversation is up');
    // TODO: mock req.user
    //test.assertTitle('Celeste Conversation', 'Title is correct');

    //testWelcomeMessageExists();
    //testEnterMessageClick();
  });

  casper.run(function () {
    test.done();
  });
});
