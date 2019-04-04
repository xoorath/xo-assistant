import {Router, Request, Response} from 'express';
import {IncomingMessage} from 'http';
import * as request from 'request';
import * as winston from 'winston';

import { Plugin } from '../plugins';
import { NextFunction } from 'connect';
import { Stopwatch } from '../../helpers/Stopwatch';

class NasaWidget extends Plugin {
    Init():void {
        super.Init();

        if(!process.env.NASA_APIKEY || process.env.NASA_APIKEY.length == 0) {
            winston.error(`(plugin:nasa) environment variable NASA_APIKEY is required.`);
            throw new Error('Nasa widget not setup correctly.');
        }
    }

    GetRoutes():Router{
        let routes = Router();

        routes.get('/apod', function(req:Request, res:Response, next:NextFunction) {
            winston.silly(`(plugin:nasa) Got status request for apod.`);
            
            const host = 'api.nasa.gov';
            const url = `https://${host}/planetary/apod?api_key=${process.env.NASA_APIKEY}`;
            
            let reqTimer = new Stopwatch();
            request(url, {}, (err:Error, response:IncomingMessage, body:string) => {
                let apiResponse:any=null;
                if(err) {
                    winston.error(`(plugin:nasa) Error getting response from ${host} (${reqTimer.Stop()})`, err.message);
                    res.status(500).send('Internal server error.');
                    return;
                }

                try {
                    apiResponse = JSON.parse(body);
                    if(apiResponse.error) {
                        winston.error(`(plugin:nasa) Nasa API returned error "${apiResponse.error.code}" message: ${apiResponse.error.message}`);
                        res.status(400).send(apiResponse.error);
                        return;
                    }
                }
                catch(e) {
                    winston.error(`(plugin:nasa) Failed to serve nasa api response. (${reqTimer.Stop()})`, e);
                    res.status(500).send('Internal server error.');
                    return;
                }

                res.send(apiResponse);
                winston.silly(`(plugin:nasa) Served apod. (${reqTimer.Stop()})`);
            });
        });

        return routes;
    }
};

module.exports = new NasaWidget();