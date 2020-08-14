# Celeste [![Build Status](https://travis.ibm.com/WatsonBackupAdvisor/WBA.svg?token=34Jxt1H7fviB8mNy1npo&branch=master)](https://travis.ibm.com/WatsonBackupAdvisor/WBA)

This app is the frontend of our app called Celeste which uses Watson Conversation to be a guide with regard the backup offerings.

You can [view the app here][demo_url].

## Before you begin

* Create a [IBM Cloud Passort](https://cloud-passport.w3ibm.mybluemix.net) to access [Bluemix CIO](https://console.w3ibm.bluemix.net)
    * Ask for permission to work in the IBM_DST_BACKUP Bluemix group 
* Make sure that you have the following prerequisites installed:
    * The [Node.js](https://nodejs.org/#download) runtime, including the [npm][npm_link] package manager
    * The [Cloud Foundry][cloud_foundry] command-line client

      Note: Ensure that you Cloud Foundry version is up to date

### Installing and starting the app

1. Install the demo app package into the local Node.js runtime environment:

    ```bash
    npm install
    ```

1. Start the app:

    ```bash
    npm start
    ```

1. Point your browser to http://localhost:3000 to try out the app.

## Deploying to Bluemix

You can use Cloud Foundry to deploy your local version of the app to Bluemix.

1. Push the app to Bluemix:

  ```bash
  cf push
  ```
  Access your app on Bluemix at the URL specified in the command output.

## Troubleshooting

If you encounter a problem, you can check the logs for more information. To see the logs, run the `cf logs` command:

```none
cf logs <application-name> --recent
```

[cloud_foundry]: https://github.com/cloudfoundry/cli#downloads
[demo_url]: https://askcelly.w3ibm.mybluemix.net/
[node_link]: (http://nodejs.org/)
[npm_link]: (https://www.npmjs.com/)
