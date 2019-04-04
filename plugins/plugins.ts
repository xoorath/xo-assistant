import *  as fs from 'fs';
import * as path from 'path';
import * as winston from 'winston';
import {Router} from 'express';

import { Stopwatch } from '../helpers/Stopwatch';

export class Plugin {
    /**
     * The name of the plugin, determined by its directory name.
     * @note This is configured progromatically before Init is called.
     * If you're writing a plugin, you do not need to set this value.
     */
    name:string;

    /**
     * Filename of the pug view, relative to the plugin's own directory.
     * @note This is configured progromatically before Init is called.
     * If you're writing a plugin, you do not need to set this value.
     */
    view:string;

    /**
     * Populate with the html content to render for this plugin.
     */
    body:string;
    
    /**
     * Called once all plugins are successfully loaded.
     */
    Init():void{};

    /**
     * Routes are bound to a path "/plugins/{name}/" after initialization.
     */
    GetRoutes():Router{ return null; };
}

export function LoadPlugins() {
    let loadPluginsTimer = new Stopwatch();
    winston.info('(Plugins) Loading plugins.');
    return new Promise<Plugin[]>((resolve, reject) => { 
        fs.readdir(__dirname, (err:NodeJS.ErrnoException, files:string[]) => {
            if(err) {
                winston.error(`↳ (Plugins) Error loading plugins: ${err.message}`);
                return reject(err);
            }
            let plugins:Plugin[] = [];
            let anyFailed:Boolean = false;
            files
                .filter(name => name !== 'plugins.ts')
                .forEach(name => {
                    let stopwatch = new Stopwatch();
                    try {
                        winston.info(`↳ (Plugins) Loading ${name} plugin`);
                        const modulePath = path.join(__dirname, name, `${name}_plugin.ts`);

                        let plugin:Plugin = null;

                        if(!fs.existsSync(modulePath)) {
                            winston.error(`↳ ↳ Error loading plugin "${name}". No module at "${modulePath}" (${stopwatch.Stop()})`);
                            anyFailed = true;
                            return;
                        } else {
                            plugin = require(modulePath);
                        }
                        
                        plugin.name = name;
                        plugin.view = `${name}.pug`

                        if(!fs.existsSync(path.join(__dirname, name, plugin.view))) {
                            plugin.view = null;
                        }

                        plugins.push(plugin);
                    }
                    catch(e) {
                        winston.error(`↳ ↳ Error loading ${name} plugin (${stopwatch.Stop()})`, e);
                        anyFailed = true;
                    }
                    finally {
                        winston.info(`↳ ↳ (Plugins) Done loading ${name} plugin. (${stopwatch.Stop()})`);
                    }
                });
            if(anyFailed) {
                return reject('At least one plugin failed to load. See error log for details.');
            } else {
                winston.info(`↳ (Plugins) Initializing plugins`);
                // Init plugins once all of them are successfully loaded.
                plugins.forEach(plugin => {
                    let stopwatch = new Stopwatch();
                    plugin.Init();
                    winston.info(`↳ ↳ (Plugins) Done initializing ${plugin.name} plugin. (${stopwatch.Stop()})`);
                });
                winston.info(`↳ (Plugins) Done loading (and initializing) plugins. (${loadPluginsTimer.Stop()})`);
                resolve(plugins);
            }

        });
    });
}