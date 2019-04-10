$(document).ready(function() {
    let city = 'Ottawa';
    // todo: get timezone utc offset more reliably.
    // this is EDT and with daylight savings will cease being true.
    let timezone = -4;

    window.WeatherWidget = window.WeatherWidget || {};
    window.WeatherWidget.View = window.WeatherWidget.View || new WeatherWidgetView();

    /**
     * @type {WeatherWidgetView}
     */
    var View = window.WeatherWidget.View;

    function TempKToF(K) { return ((K - 273.15) * 1.8) + 32; }
    function TempKToC(K) { return K-273.15; }
    function Weekday(date) {
        var dayOfWeek = new Date(date).getDay();    
        return isNaN(dayOfWeek) ? null : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek];
    }

    function CalculateHeatIndex(t, rh) {
        var tRounded = Math.floor(t + 0.5);

        if(tRounded < 76) {
            return null;
        }

        // according to the NWS, we try this first, and use it if we can
        var tHeatEasy = 0.5 * (t + 61.0 + ((t - 68.0) * 1.2) + (rh * 0.094));

        // The NWS says we use tHeatEasy if (tHeatHeasy + t)/2 < 80.0
        // This is the same computation:
        if ((tHeatEasy + t) < 160.0)
                return tHeatEasy;

        // need to use the hard form, and possibly adjust.
        var t2 = t * t;         // t squared
        var rh2 = rh * rh;      // rh squared
        var tResult =
            -42.379 +
            (2.04901523 * t) +
            (10.14333127 * rh) +
            (-0.22475541 * t * rh) +
            (-0.00683783 * t2) +
            (-0.05481717 * rh2) +
            (0.00122874 * t2 * rh) +
            (0.00085282 * t * rh2) +
            (-0.00000199 * t2 * rh2);

        // these adjustments come from the NWA page, and are needed to
        // match the reference table.
        var tAdjust;
        if (rh < 13.0 && 80.0 <= t && t <= 112.0)
            tAdjust = -((13.0 - rh) / 4.0) * Math.sqrt((17.0 - Math.abs(t - 95.0)) / 17.0);
        else if (rh > 85.0 && 80.0 <= t && t <= 87.0)
            tAdjust = ((rh - 85.0) / 10.0) * ((87.0 - t) / 5.0);
        else
            tAdjust = 0;

        // apply the adjustment
        tResult += tAdjust;

        // finally, the reference tables have no data above 183 (rounded),
        // so filter out answers that we have no way to vouch for.
        if (tResult >= 183.5)
            return null;
        else
            return tResult;
    }

    function CalculateWindchill(t, v) {
        var v16 = Math.pow(v, 0.16);
        return 13.12 + (0.6215*t) - (11.37*v16) + (0.3965*t*v16);
    }

    moment.relativeTimeThreshold('m',  120);

    function ParseOWMTempAndIcon(data) {
        var nowTime = Math.floor(Date.now() / 1000);
        var dayNight = (nowTime > data.sys.sunrise && nowTime <= data.sys.sunset) ? 'day' : 'night';
        
        View.SetCurrentWeatherIcon(data.weather[0].id, dayNight, 'owm');
        View.SetCurrentWeatherDescription(data.weather[0].description);

        console.log(data);
        // var airTempC = TempKToC(data.main.temp);
        // var vapourPressure = data.main.pressure * 0.1;
        // var windSpeed = data.wind.speed;
        // // https://www.ncdc.noaa.gov/societal-impacts/apparent-temp/at
        // var apparentTemp = -2.7 + (1.04*airTempC) + (2.0*vapourPressure) + (-0.65*windSpeed);

        var T = TempKToF(data.main.temp);
        var RH = data.main.humidity;
        var V = data.wind.speed * 3.6; // m/s to km/h
        var HI = CalculateHeatIndex(T, RH);
        var WC = CalculateWindchill(TempKToC(data.main.temp), V);
        
        if(HI !== null) {
            View.SetCurrentFeelsLike(HI,                    'f');
        } else {
            View.SetCurrentFeelsLike(WC,                    'c');
        }
        View.SetCurrentTemp         (data.main.temp,        'k');
        View.SetCurrentDailyLow     (data.main.temp_min,    'k');
        View.SetCurrentDailyHigh    (data.main.temp_max,    'k');

        View.SetCurrentWindspeed    (data.wind.speed,       'm/s');
    }

    function ParseOWMSunriseSunset(data) {
        View.SetCurrentSunriseSunset(
            moment()                        .utcOffset(timezone),
            moment(data.sys.sunrise * 1000) .utcOffset(timezone),
            moment(data.sys.sunset * 1000)  .utcOffset(timezone));
    }

    function ParseOWMMoon(data) {
        var phase = SunCalc.getMoonIllumination(new Date()).phase;
        View.SetCurrentMoonPhase(phase);
    }

    function ParseOWM(data) {
        View.SetCity(data.name);
        ParseOWMTempAndIcon(data);
        ParseOWMSunriseSunset(data);
        ParseOWMMoon(data);
    }

    function GetWeatherStatus() {
        $.get('/plugins/weather/status/' + city)
        .done(function(data, textStatus, jqXHR){
            ParseOWM(data);
        })
        .fail(function(jqXHR, textStatus, errorThrown){
            console.error(textStatus, errorThrown);
        });
    }

    setInterval(GetWeatherStatus, 10 * 1000);
    GetWeatherStatus();

    function GetForecast() {
        $.get('/plugins/weather/forecast/' + city)
        .done(function(data, textStatus, jqXHR){

            /** @type {import('moment').Moment} */
            var now = moment().utcOffset(timezone);
            now = now.startOf('day');
            var forecastDays = [
                moment().startOf('day').add({ days:1 }),
                moment().startOf('day').add({ days:2 }),
                moment().startOf('day').add({ days:3 })
            ];

            View.SetFutureDates(forecastDays);

            // how many days were evaluated?
            var dataForDay = [0, 0, 0];

            // total forecasted temperature for the day
            var forecastTemperatures = [0, 0, 0];

            // weather object per day
            var weatherPerDay = [[], [], []];

            for(var i = 0; i < data.list.length; ++i ) {
                var dataDay = moment(data.list[i].dt*1000).startOf('day');
                var idx = dataDay.diff(now, 'days', false)-1;
                if(idx >= 0 && idx < forecastDays.length) {
                    dataForDay[idx]++;
                    forecastTemperatures[idx] += data.list[i].main.temp;
                    weatherPerDay[idx].push(data.list[i].weather[0]);
                }
            }

            for(var i = 0; i < forecastDays.length; ++i) {
                var forecastTemp = forecastTemperatures[i] / dataForDay[i];
                var weatherIndex = Math.floor((dataForDay[i]-1) / 2);
                var weather = weatherPerDay[i][weatherIndex];

                View.SetFutureAverageTemperature(forecastDays[i], forecastTemp, 'k');
                View.SetFutureWeatherIcon(forecastDays[i], weather.id, 'owm');
                View.SetFutureWeatherDescription(forecastDays[i], weather.description);
            }
        })
        .fail(function(jqXHR, textStatus, errorThrown){
            console.error(textStatus, errorThrown);
        });
    }

    setInterval(GetForecast, 60 * 60 * 1000);
    GetForecast();
});