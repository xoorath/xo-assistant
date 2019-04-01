import {Express} from "express-serve-static-core";
import * as express from "express";
import * as fs from 'fs';
import * as path from 'path';
import * as winston from 'winston';
import * as readdir from 'recursive-readdir-async'; /** @see https://www.npmjs.com/package/recursive-readdir-async */

import {Stopwatch} from '../../helpers/Stopwatch';
import {Plugin} from '../../plugins/plugins';
import { fstat } from "fs";

// Path from this file to the project root.
const pathToRoot:string = '../../';

export function Setup(app:Express):void {
    let timer = new Stopwatch();
    winston.info('(Routes) Configuring routes.');

    // Serve static files
    app.use('/static', express.static(path.join(__dirname, pathToRoot, 'static')));

    // Map web routes to the application root
    app.use('/', require('./web'));

    winston.info(`↳ (Routes) All routes configured. (${timer.Stop()})`);
}

interface iStylesAndScripts {
    styles:string[];
    scripts:string[];
}

export function AttachPluginRoutes(app:Express, plugins:Plugin[]):Promise<iStylesAndScripts> {
    let timer = new Stopwatch();
    return new Promise<iStylesAndScripts>((resolve, reject) => {
        winston.info(`(Routes) Attaching plugin routes.`);
        
        // Bind dynamic routes
        plugins.forEach(plugin => {
            let routes = plugin.GetRoutes();
            if(routes) {
                app.use(`/plugins/${plugin.name}`, routes);
            }
        });

        let stylesAndScripts:iStylesAndScripts = {
            styles:[],
            scripts:[]
        };
        let readdirResults:Promise<any>[] = [];
        
        // Bind static routes, and provide a list of sources to the promise
        plugins.forEach(plugin => {

            let dir = path.join(__dirname, pathToRoot, 'plugins', plugin.name, 'static');
            if(fs.existsSync(dir)) {
                app.use(`/static`, express.static(dir));
                let readPromise = readdir.list(dir, {
                    extensions: true,
                    recursive: true
                }, 
                null);
                readdirResults.push(readPromise);
            }
        });

        Promise.all(readdirResults)
            .then((allResults:any[])=>{
                const FixPath = function(path:string):string {
                    const staticDir = 'static/'
                    let staticIdx = path.indexOf(staticDir);
                    path = path.substr(staticIdx + staticDir.length);
                    return path;
                }

                allResults.forEach(results => 
                    results.forEach(obj => {
                        if(obj.isDirectory) {
                            return;
                        }
                        
                        if(obj.extension == '.css') {
                            stylesAndScripts.styles.push(FixPath(obj.fullname));
                        } else if(obj.extension == '.js') {
                            stylesAndScripts.scripts.push(FixPath(obj.fullname));
                        }
                    })
                );
                winston.info(`↳ (Routes) Plugin routes attached. (${timer.Stop()})`);
                resolve(stylesAndScripts);
            })
            .catch(e => reject(e));
    });
}