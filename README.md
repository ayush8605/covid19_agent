# covid19_agent

a) Name - Ayush Sharma

c)Program Description - This program is a windows desktop application. It is a speech agent that can help a user get the latest stats on COVID-19 pandemic. It uses an open API to fetch all the required information. Currently it can fetch stats on all the coutries in the world. Additionly it can fetch information about the states and counties in United States. It can not fetch the data based on individual cities as that data is not available on the API. Apart from this the application can also provide stats for perticular time periods like a week, a month or since a perticular date like (april 1, 2020).

d) Tools used to develop
                    -- Windows operating system
                    -- Unity - version: 2019.3.9f1. Use: To develop the animation for the agent. 
                    -- DialogFlow - Use: To design the conversation between the user and the speech agent.
                    -- Google cloud Firebase - Use : To host the fulfilment webhook for DialogFlow. It implements the logic for fethching the data and sending back a response to the user. 
                    -- Open API at https://coronavirus-tracker-api.ruizlab.org/#/v2/get_locations_v2_locations_get

e) use the unity assets folder in a new unity project, it includes the required scripts and animation assets. build the unity project.
f) how to run: Every time you wish to send a request, please click the record button and click the stop button after you have recorded the request. 
g)Note:  In unity assets/scripts/microphoneCapture, write the project ID and email ID from the dialogflow speech agent at line 27,28. Also add authentication certificates to the project and add its path to line 30.
g) Note: Please make sure to use the word "since last" when quering for stats since a weekday. for example: what are the latest stats for canada since last Monday? 

h) Folder Structure: 
                    -- The folder name "dr" contains the desktop application
                    -- The folder named "DialogFlow fulfillment" contains the javascript source code for the fulfilment webhook deployed on firebase
                    -- The Zip file named "DrStats_Covid" contains the dialogflow conversation agent. It can be used to restore the agent on any other account. 
