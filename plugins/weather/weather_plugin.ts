import {Router, Request, Response} from 'express';
import {IncomingMessage} from 'http';
import * as request from 'request';
import * as winston from 'winston';

import { Plugin } from '../plugins';
import { NextFunction } from 'connect';
import { Stopwatch } from '../../helpers/Stopwatch';

class WeatherWidget extends Plugin {

    Init():void {
        super.Init();

        if(!process.env.OPEN_WEATHER_APIKEY || process.env.OPEN_WEATHER_APIKEY.length == 0) {
            winston.error(`(plugin:weather) environment variable OPEN_WEATHER_APIKEY is required.`);
            throw new Error('Weather widget not setup correctly.');
        }
    }

    GetRoutes():Router{
        let routes = Router();

        routes.get('/status/:city', function(req:Request, res:Response, next:NextFunction) {
            winston.silly(`(plugin:weather) Got status request for ${req.params.city}.`);
            const city = req.params.city || 'London';
            const host = 'api.openweathermap.org';
            const url = `http://${host}/data/2.5/weather?q=${city}&appid=${process.env.OPEN_WEATHER_APIKEY}`;

            let reqTimer = new Stopwatch();
            request(url, {}, (err:Error, response:IncomingMessage, body:string) => {
                if(err) {
                    winston.error(`(plugin:weather) Error getting response from ${host} (${reqTimer.Stop()})`, err.message);
                    res.status(500).send('Internal server error.');
                    return;
                }

                try {
                    res.send(JSON.parse(body));
                    winston.silly(`(plugin:weather) Served weather status. (${reqTimer.Stop()})`);
                }
                catch(e) {
                    winston.error(`(plugin:weather) Failed to serve weather status request. (${reqTimer.Stop()})`, e);
                    res.status(500).send('Internal server error.');
                }
            });
        });


        routes.get('/forecast/:city', function(req:Request, res:Response, next:NextFunction) {
            winston.silly(`(plugin:weather) Got forecast request for ${req.params.city}.`);
            const city = req.params.city || 'London';
            const host = 'api.openweathermap.org';
            const url = `http://${host}/data/2.5/forecast?q=${city}&appid=${process.env.OPEN_WEATHER_APIKEY}`;

            let reqTimer = new Stopwatch();
            request(url, {}, (err:Error, response:IncomingMessage, body:string) => {
                if(err) {
                    winston.error(`(plugin:weather) Error getting response from ${host} (${reqTimer.Stop()})`, err.message);
                    res.status(500).send('Internal server error.');
                    return;
                }

                try {
                    res.send(JSON.parse(body));
                    winston.silly(`(plugin:weather) Served weather status. (${reqTimer.Stop()})`);
                }
                catch(e) {
                    winston.error(`(plugin:weather) Failed to serve weather status request. (${reqTimer.Stop()})`, e);
                    res.status(500).send('Internal server error.');
                }
            });
        });

        return routes;
    }
};

module.exports = new WeatherWidget();