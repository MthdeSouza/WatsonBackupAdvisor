import json
import watson_developer_cloud
from dotenv import load_dotenv, find_dotenv
import os
import unicodecsv
import sys
import re

load_dotenv(find_dotenv())

conversation = watson_developer_cloud.ConversationV1(username=os.environ.get('CONVERSATION_USERNAME'), 
                                                     password=os.environ.get('CONVERSATION_PASSWORD'), 
                                                     version='2018-02-22')

# collect the data from the api
conversations = {}
pagination_token = None
while True:
  dataset = conversation.list_logs(workspace_id='bea3c0b9-da71-4c65-b2a7-f5dd9dfd5b1c', page_limit=100, 
                                   sort='request_timestamp', cursor=pagination_token)
  for log in dataset['logs']:
    conversation_id = log['response']['context']['conversation_id']
    conversations[conversation_id] = conversations.get(conversation_id, [])
    conversations[conversation_id].append(log['request']['input'].get('text'))
  pagination_token = dataset['pagination'].get('next_cursor')
  if not pagination_token:
    break

# create the csv
csv_writer = unicodecsv.writer(sys.stdout, encoding='utf-8')
csv_writer.writerow(['Conversation ID', 'User ID', 'Email', 'Name', 'Inputs...'])
for conversation_id, inputs in conversations.iteritems():
  if re.match('USERSSO', inputs[0] or ''):
    user_data = json.loads(re.search('USERSSO (.+)', inputs[0]).group(1))
    csv_writer.writerow([conversation_id, user_data['id'], user_data['email'], user_data['displayName']] + inputs[1:])
  #csv_writer.writerow([conversation_id] + inputs)