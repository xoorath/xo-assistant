import {Express, Request, Response} from 'express-serve-static-core';
import * as dotenv from 'dotenv';
import * as express from 'express';
import * as winston from 'winston';

import * as Plugins from './plugins/plugins';
import * as Routes from './server/routes/routes';
import * as Views from './views/views';
import * as WinstonConfig from './config/configWinston';
import {Stopwatch} from './helpers/Stopwatch';

let appStartTimer = new Stopwatch();

// First thing we do is setup our environment variables.
dotenv.config();

const app:Express = express();

const { 
    WEB_HOST,
    WEB_PORT
} = process.env;

// Winston is used for logging, it should be the first thing we do once our environment is configured
WinstonConfig.Setup();

// Setup our view engine
Views.Setup(app);

// Setup our application routes
Routes.Setup(app);

Plugins.LoadPlugins()
.then(plugins => {

    Routes.AttachPluginRoutes(app, plugins)
    .then(pluginStylesAndScripts => {
        Views.SetPluginDependencies(pluginStylesAndScripts.styles, pluginStylesAndScripts.scripts);
        Views.SetPlugins(plugins);
        Views.AttachPlugins();
    
        // Begin running the application
        winston.info(`Assistant configuration complete! Running at ${WEB_HOST}:${WEB_PORT}.`);
        app.listen(WEB_PORT, ():void => {
            winston.info(`Assistant is online (${appStartTimer.Stop()})`);
            appStartTimer = null;
        });
    })
    .catch(reason => {
        winston.error(`Exiting application. Failed to load plugin static dependancies. (${appStartTimer.Stop()}) `, reason);
    });
})
.catch(reason => {
    winston.error(`Exiting application. Failed to initialize plugins. (${appStartTimer.Stop()})`, reason);
})