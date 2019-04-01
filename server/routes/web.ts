import { Router, Request, Response } from 'express';
import * as winston from 'winston';

import {GetStandardRenderVars} from '../../views/views';
import {Stopwatch} from '../../helpers/Stopwatch';
import {RenderPlugins} from '../../views/views';

let configTimer = new Stopwatch();

let router = Router();

router.get('/', (req:Request, res:Response) => {
    if(process.env.NODE_ENV === 'development') {
        // re-render plugin views in development mode for faster plugin itteration
        RenderPlugins();
    }

    let renderVars = GetStandardRenderVars();
    res.render('index', renderVars);
});

winston.info(`↳ (Routes) Web routes configured. (${configTimer.Stop()})`);
configTimer = null;
module.exports = router;