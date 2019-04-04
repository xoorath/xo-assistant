import { Express } from "express-serve-static-core";
import * as winston from 'winston';
import * as pug from 'pug';
import * as path from 'path';

import { Plugin } from '../plugins/plugins'
import { Stopwatch } from '../helpers/Stopwatch';

interface iRenderVars {
    NODE_ENV: string;
    SERVER_HOST: string;
    SERVER_PORT: string;

    plugins: Plugin[];
    pluginCss: string[];
    pluginJs: string[];
}

let constantVars: iRenderVars;
let plugins: Plugin[] = null;

export function Setup(app: Express): void {
    let configuringTimer:Stopwatch = new Stopwatch();
    winston.info('(Views) Configuring views');
    app.set('view engine', 'pug');

    const { NODE_ENV, SERVER_HOST, SERVER_PORT } = process.env;
    constantVars = {
        NODE_ENV,
        SERVER_HOST,
        SERVER_PORT,
        plugins,        // expect null here, plugins are provided after setup
        // plugin css and js is provided after plugins are loaded.
        pluginCss:[],
        pluginJs:[]
    };

    winston.info(`↳ (Views) Configuring views complete (${configuringTimer.Stop()})`);
}

export function GetStandardRenderVars(): iRenderVars {
    return { ...constantVars };
}

export function SetPlugins(providedPlugins: Plugin[]): void {
    plugins = providedPlugins;
}

export function SetPluginDependencies(css:string[], js:string[]) {
    constantVars.pluginCss = css;
    constantVars.pluginJs = js;
}

function RenderPlugin(plugin: Plugin): void {
    if(!plugin.view) {
        return;
    }
    
    let renderTime = new Stopwatch();
    let renderVars: any = GetStandardRenderVars();
    renderVars.name = plugin.name;
    renderVars.view = plugin.view;
    winston.info(`↳ (Views) Rendering ${plugin.name} plugin. `);
    pug.renderFile(
        path.join(__dirname, '../plugins', plugin.name, plugin.view),
        renderVars,
        (err: Error, html: string): void => {
            if (err) {
                winston.error(`↳ ↳ (Views) Failed to render ${plugin.name} plugin. ${err.message}`);
                return;
            }
            plugin.body = html;
            winston.info(`↳ ↳ (Views) Done rendering ${plugin.name} plugin. (${renderTime.Stop()})`);
        });
}

export function RenderPlugins(): void {
    plugins.forEach(plugin => RenderPlugin(plugin));
}

export function AttachPlugins(): void {
    let attachTimer:Stopwatch = new Stopwatch();
    winston.info('(Views) Attaching plugins.');
    constantVars.plugins = plugins;
    RenderPlugins();
    winston.info(`↳ (Views) Plugins attached. (${attachTimer.Stop()})`);
}