// See https://github.com/dialogflow/dialogflow-fulfillment-nodejs
// for Dialogflow fulfillment library docs, samples, and to report issues
"use strict";

const functions = require("firebase-functions");
const { WebhookClient } = require("dialogflow-fulfillment");
const { Card, Suggestion } = require("dialogflow-fulfillment");
const bent = require("bent");
const getJSON = bent("json");
const apiUrl = `https://coronavirus-tracker-api.ruizlab.org/v2/locations?source=`;

process.env.DEBUG = "dialogflow:debug"; // enables lib debugging statements

exports.dialogflowFirebaseFulfillment = functions.https.onRequest(
  (request, response) => {
    const agent = new WebhookClient({ request, response });
    console.log(
      "Dialogflow Request headers: " + JSON.stringify(request.headers)
    );
    console.log("Dialogflow Request body: " + JSON.stringify(request.body));

    function welcome(agent) {
      agent.add(`Welcome to my agent!`);
    }

    function fallback(agent) {
      agent.add(`I didn't understand`);
      agent.add(`I'm sorry, can you try again?`);
    }

    function worldWideStats(agent) {
      const type = agent.parameters.type;
      // var str = `this is a test String=${agent.parameters.type}`;
      return getJSON(
        "https://coronavirus-tracker-api.ruizlab.org/v2/latest?source=jhu"
      )
        .then((result) => {
          if (type.length >= 3) {
            agent.add(
              `The total number of confirmed cases are ${result.latest.confirmed}.  ${result.latest.deaths} have succumbed to the virus. Additionaly ${result.latest.recovered} people have recovered so far. I hope things get better soon. `
            );
          } else {
            for (let i = 0; i < type.length; i++) {
              if (i == 1) {
                agent.add(`Moreover. `);
              }
              switch (type[i]) {
                case "confirmed":
                  agent.add(
                    `According to the latest updates ${result.latest.confirmed} have been infected by the Corona virus worldwide.`
                  );
                  break;
                case "deaths":
                  if (result.latest.deaths > 0) {
                    agent.add(`Unfortunately, `);
                  }
                  agent.add(
                    ` ${result.latest.deaths} people have died due to the Corona virus disease.`
                  );
                  break;
                case "recovered":
                  agent.add(
                    `${result.latest.recovered} patients have recovered from Corona virus so far.`
                  );
                  break;
                default:
                  agent.add(
                    `The total number of confirmed cases are ${result.latest.confirmed}.  ${result.latest.deaths} have succumbed to the virus. Additionaly ${result.latest.recovered} people have recovered so far.`
                  );
              }
            }
          }
        })
        .catch((error) => {
          console.error(error);
        });
    }

    async function locationStat() {
      const type = agent.parameters.type;
      // const country = agent.parameters.country;
      const state = agent.parameters.state;
      const county = agent.parameters.county;
      const city = agent.parameters.city;
      let result;

      // agent.add(`in location stat`);

      if (state.length == 0 && county.length == 0) {
        agent.add(
          `I am sorry, I am not able to help you with this right now, I am still learning`
        );
      } else if (city && city.length != 0) {
        // If the user enquiers for a city
        agent.add(
          `Currently I am unable to provide information about corona virus cases for a particular city. But I can help you with finding the stats for county, state or a country`
        );
      } else if (state.length == 0 && county.length == 0) {
      } else if (state.length != 0 && county.length == 0) {
        // when you have just state names and no county

        try {
          for (let j = 0; j < state.length; j++) {
            var currentState = state[j];
            result = await getJSON(
              apiUrl + `csbs&province=${currentState}&timelines=false`
            );

            if (j == 1) {
              agent.add(`Moreover. `);
            } else if (j > 1) {
              agent.add(`Additionaly. `);
            }

            if (type.length >= 3) {
              agent.add(
                `The total number of confirmed cases in ${currentState} are ${result.latest.confirmed}.  ${result.latest.deaths} have succumbed to the virus. Additionaly ${result.latest.recovered} people have recovered so far. I hope things get better soon. `
              );
            } else {
              for (let i = 0; i < type.length; i++) {
                if (i == 1) {
                  agent.add(`And. `);
                }
                switch (type[i]) {
                  case "confirmed":
                    agent.add(
                      `According to the latest updates ${result.latest.confirmed} have been infected by the Corona virus in ${currentState}.`
                    );
                    break;
                  case "deaths":
                    if (result.latest.deaths > 0) {
                      agent.add(`Unfortunately, `);
                    }
                    agent.add(
                      ` ${result.latest.deaths} people have died in ${currentState} due to the Corona virus disease.`
                    );
                    break;
                  case "recovered":
                    agent.add(
                      `${result.latest.recovered} patients have recovered from Corona virus so far.`
                    );
                    break;
                  default:
                    agent.add(
                      `The total number of confirmed cases in ${currentState} are ${result.latest.confirmed}.  ${result.latest.deaths} have succumbed to the virus. Additionaly ${result.latest.recovered} people have recovered so far.`
                    );
                }
              }
            }
          }
          return result;
        } catch (error) {
          console.error(error);
          agent.add(`There does not seem be be any information for this state`);
        }
      } else if (state.length != 0 && county.length != 0) {
        // code for when both state and county are present. This works for only one county and state pair.

        for (let k = 0; k < county.length; k++) {
          console.log(`county name us : ${county}`);
          let countyName = getCountyname(county[k]);

          if (k > 0) {
            agent.add(`meanwhile.`);
          }

          console.log(`county name us : ${countyName}`);
          console.log(
            apiUrl +
              `csbs&province=${state[0]}&county=${countyName}&timelines=false`
          );

          try {
            result = await getJSON(
              apiUrl +
                `csbs&province=${state[0]}&county=${countyName}&timelines=false`
            );
            if (type.length >= 3) {
              agent.add(
                `The total number of confirmed cases in ${county[k]}, ${state[0]} are ${result.latest.confirmed}.  ${result.latest.deaths} have succumbed to the virus. Additionaly ${result.latest.recovered} people have recovered so far. I hope things get better soon. `
              );
            } else {
              for (let i = 0; i < type.length; i++) {
                if (i == 1) {
                  agent.add(`And. `);
                }
                switch (type[i]) {
                  case "confirmed":
                    agent.add(
                      `According to the latest updates ${result.latest.confirmed} have been infected by the Corona virus in ${county[k]}, ${state[0]}.`
                    );
                    break;
                  case "deaths":
                    if (result.latest.deaths > 0) {
                      agent.add(`Unfortunately, `);
                    }
                    agent.add(
                      ` ${result.latest.deaths} people have died in ${county[k]}, ${state[0]} due to the Corona virus disease.`
                    );
                    break;
                  case "recovered":
                    agent.add(
                      `${result.latest.recovered} patients have recovered from Corona virus so far.`
                    );
                    break;
                  default:
                    agent.add(
                      `The total number of confirmed cases in ${county[k]}, ${state[0]} are ${result.latest.confirmed}.  ${result.latest.deaths} have succumbed to the virus. Additionaly ${result.latest.recovered} people have recovered so far.`
                    );
                }
              }
            }
          } catch (error) {
            console.error(error);
            agent.add(
              `There does not seem be any information for ${county[k]}`
            );
          }
        }
        //  return result;
      } else if (state.length == 0 && county.length != 0) {
        // well need to think about the behaviour here when we have only county name and not state name

        for (let k = 0; k < county.length; k++) {
          let countyName = getCountyname(county[k]);
          // agent.add(`${countyName}`);

          console.log(`county name us : ${countyName}`);
          console.log(
            apiUrl +
              `csbs&province=${state[0]}&county=${countyName}&timelines=false`
          );

          try {
            result = await getJSON(
              apiUrl + `csbs&county=${countyName}&timelines=false`
            );

            if (result.locations.length > 1) {
              agent.add(
                `There are more then 1 ${county[k]} in the united states. It would be really helpful if you can name the state along with the county name `
              );
            } else {
              if (type.length >= 3) {
                agent.add(
                  `The total number of confirmed cases in ${county[k]}, ${result.locations[0].province} are ${result.latest.confirmed}.  ${result.latest.deaths} have succumbed to the virus. Additionaly ${result.latest.recovered} people have recovered so far. I hope things get better soon. `
                );
              } else {
                for (let i = 0; i < type.length; i++) {
                  if (i == 1) {
                    agent.add(`And. `);
                  }
                  switch (type[i]) {
                    case "confirmed":
                      agent.add(
                        `According to the latest updates ${result.latest.confirmed} have been infected by the Corona virus in ${county[k]}, ${result.locations[0].province}.`
                      );
                      break;
                    case "deaths":
                      if (result.latest.deaths > 0) {
                        agent.add(`Unfortunately, `);
                      }
                      agent.add(
                        ` ${result.latest.deaths} people have died in ${county[k]}, ${result.locations[0].province} due to the Corona virus disease.`
                      );
                      break;
                    case "recovered":
                      agent.add(
                        `${result.latest.recovered} patients have recovered from Corona virus so far.`
                      );
                      break;
                    default:
                      agent.add(
                        `The total number of confirmed cases in ${county[k]}, ${result.locations[0].province} are ${result.latest.confirmed}.  ${result.latest.deaths} have succumbed to the virus. Additionaly ${result.latest.recovered} people have recovered so far.`
                      );
                  }
                }
              }
            }
          } catch (error) {
            console.error(error);
            agent.add(
              `There does not seem be any information for ${county[k]}`
            );
          }
        }
        //  return result;
      } else {
        agent.add(
          `I am sorry, I am not able to help you with this right now, I am still learning `
        );
      }
    }

    function getCountyname(county) {
      if (county.includes(`county`)) {
        return county.replace(` county`, ``);
      } else if (county.includes(`County`)) {
        return county.replace(` County`, ``);
      } else if (county.includes(`Parish`)) {
        return county.replace(` Parish`, ``);
      } else if (county.includes(`parish`)) {
        return county.replace(` parish`, ``);
      }
    }

    async function sinceCountry(agent) {
      const type = agent.parameters.type;
      const country = agent.parameters.country;
      const dt = agent.parameters.period;
      let result;

      if (dt) {
        // if date period exsists
        console.log("in date section");
        let currentCountry = country[0];
        const stDate = dt.startDate.substring(0, 11) + `00:00:00Z`;
        const edDate = dt.endDate.substring(0, 11) + `00:00:00Z`;

        //agent.add(`in the fullfilement  end date is : ${edDate}`);
        console.log(`in the sinceCountry intent`);
        console.log(
          apiUrl +
            `jhu&country_code=${currentCountry["alpha-2"]}&timelines=true`
        );
        //agent.add(apiUrl+`jhu&country_code=${currentCountry["alpha-2"]}&timelines=true`);

        return getJSON(
          apiUrl +
            `jhu&country_code=${currentCountry["alpha-2"]}&timelines=true`
        )
          .then((result) => {
            let outCases = 0;
            let outDeaths = 0;
            for (let i = 0; i < result.locations.length; i++) {
              var firstLocation = result.locations[i];

              let lStartCase =
                firstLocation.timelines.confirmed.timeline[stDate] == undefined
                  ? 0
                  : firstLocation.timelines.confirmed.timeline[stDate];
              let lEndCase =
                firstLocation.timelines.confirmed.timeline[edDate] == undefined
                  ? 0
                  : firstLocation.timelines.confirmed.timeline[edDate];

              outCases = outCases + Math.abs(lEndCase - lStartCase);

              lStartCase =
                firstLocation.timelines.deaths.timeline[stDate] == undefined
                  ? 0
                  : firstLocation.timelines.deaths.timeline[stDate];
              lEndCase =
                firstLocation.timelines.deaths.timeline[edDate] == undefined
                  ? 0
                  : firstLocation.timelines.deaths.timeline[edDate];

              outDeaths = outDeaths + Math.abs(lEndCase - lStartCase);
            }

            if (type.length >= 3) {
              agent.add(
                `The total number of confirmed cases in ${currentCountry.name} are ${outCases}.  ${outDeaths} have succumbed to the virus. Additionaly zero people have recovered so far. I hope things get better soon. `
              );
            } else {
              for (var i = 0; i < type.length; i++) {
                if (i == 1) {
                  agent.add(`And. `);
                }
                switch (type[i]) {
                  case "confirmed":
                    agent.add(
                      `According to the latest updates ${outCases} have been infected by the Corona virus in ${currentCountry.name}.`
                    );
                    break;
                  case "deaths":
                    if (outDeaths > 0) {
                      agent.add(`Unfortunately, `);
                    }
                    agent.add(
                      ` ${outDeaths} people have died in ${currentCountry.name} due to the Corona virus disease.`
                    );
                    break;
                  case "recovered":
                    agent.add(
                      `zero patients have recovered from Corona virus so far.`
                    );
                    break;
                  default:
                    agent.add(
                      `The total number of confirmed cases in ${currentCountry.name} are ${outCases}.  ${outDeaths} have succumbed to the virus. Additionaly zero people have recovered so far.`
                    );
                }
              }
            }
          })
          .catch((error) => {
            console.error(error);
          });
      } else if (!dt) {
        // If the user asks for one or more countries - No state and county

        console.log("in no date section");
        try {
          for (let j = 0; j < country.length; j++) {
            let currentCountry = country[j];
            result = await getJSON(
              apiUrl +
                `jhu&country_code=${currentCountry["alpha-2"]}&timelines=false`
            );
            if (j == 1) {
              agent.add(`Meanwhile. In ${currentCountry.name}`);
            } else if (j > 1) {
              agent.add(`And. As for ${currentCountry.name}.`);
            }
            // agent.add(`the current country is ${currentCountry.name}`);
            // agent.add(`the total cases are: ${result.latest.confirmed}`);
            if (type.length >= 3) {
              agent.add(
                `The total number of confirmed cases in ${currentCountry.name} are ${result.latest.confirmed}.  ${result.latest.deaths} have succumbed to the virus. Additionaly ${result.latest.recovered} people have recovered so far. I hope things get better soon. `
              );
            } else {
              for (let i = 0; i < type.length; i++) {
                if (i == 1) {
                  agent.add(`And. `);
                }
                switch (type[i]) {
                  case "confirmed":
                    agent.add(
                      `According to the latest updates ${result.latest.confirmed} have been infected by the Corona virus in ${currentCountry.name}.`
                    );
                    break;
                  case "deaths":
                    if (result.latest.deaths > 0) {
                      agent.add(`Unfortunately, `);
                    }
                    agent.add(
                      ` ${result.latest.deaths} people have died in ${currentCountry.name} due to the Corona virus disease.`
                    );
                    break;
                  case "recovered":
                    agent.add(
                      `${result.latest.recovered} patients have recovered from Corona virus so far.`
                    );
                    break;
                  default:
                    agent.add(
                      `The total number of confirmed cases in ${currentCountry.name} are ${result.latest.confirmed}.  ${result.latest.deaths} have succumbed to the virus. Additionaly ${result.latest.recovered} people have recovered so far.`
                    );
                }
              }
            }
          }
          return result;
        } catch (error) {
          console.error(error);
          agent.add(
            `I am sorry. I am unable to find any information for this location`
          );
        }
      }
    }

    // Run the proper function handler based on the matched Dialogflow intent name
    let intentMap = new Map();
    intentMap.set("Default Welcome Intent", welcome);
    intentMap.set("Default Fallback Intent", fallback);
    intentMap.set("worldWideStats", worldWideStats);
    intentMap.set("locationStat", locationStat);
    intentMap.set("sinceCountry", sinceCountry);

    // intentMap.set('your intent name here', yourFunctionHandler);
    // intentMap.set('your intent name here', googleAssistantHandler);
    agent.handleRequest(intentMap);
  }
);
