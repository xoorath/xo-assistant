function WeatherWidgetView() {
    var $place = $('.weather-plugin #place');

    var $current_temp = $('.weather-plugin .today .current-temp .description');
    var $current_feels_like = $('.weather-plugin .today .current-feels-like .description');
    
    var $temp_low = $('.weather-plugin .today .current-low .description');
    var $temp_high = $('.weather-plugin .today .current-high .description');
    
    var $weather_icon = $('.weather-plugin .today .weather-description .weather-icon i');
    var $weather_description = $('.weather-plugin .today .weather-description .description');

    var $wind_icon = $('.weather-plugin .wind.wind-description i');
    var $wind_icon_label = $('.weather-plugin .wind.wind-description .wind-speed');

    var $sunrise    = $('.weather-plugin .sun #sunrise');
    var $sunset     = $('.weather-plugin .sun #sunset');
    var $sunprog    = $('.weather-plugin .sun .progress-bar');
    var $daylight   = $('.weather-plugin .sun #daylight');
    var $timeuntil  = $('.weather-plugin .sun #time-until');

    var $moon_icon          = $('.weather-plugin .moon.icon #icon');
    var $moon_icon_label    = $('.weather-plugin .moon.icon label');

    var $futurex_day = [];
    var $futurex_day_sm = [];
    var $futurex_icon = [];
    var $futurex_temp = [];

    for(var i = 0; i < 3; ++i) {
        $futurex_day.push($('.weather-plugin .forecast .day #day-of-week:eq('+i+')'));
        $futurex_day_sm.push($('.weather-plugin .forecast .day #day-of-week-sm:eq('+i+')'));
        $futurex_icon.push($('.weather-plugin .forecast .day i#weather-icon:eq('+i+')'));
        $futurex_temp.push($('.weather-plugin .forecast .day .temp:eq('+i+')'));
    }

    /**  @type {import('moment').Moment[]} */
    var futureDays = [];

    var moonIcons = [
        {n:'new moon',          i:'wi wi-moon-alt-new'},
        {n:'waxing crescent',   i:'wi wi-moon-alt-waxing-crescent-1'},
        {n:'waxing crescent',   i:'wi wi-moon-alt-waxing-crescent-2'},
        {n:'waxing crescent',   i:'wi wi-moon-alt-waxing-crescent-3'},
        {n:'waxing crescent',   i:'wi wi-moon-alt-waxing-crescent-4'},
        {n:'waxing crescent',   i:'wi wi-moon-alt-waxing-crescent-5'},
        {n:'waxing crescent',   i:'wi wi-moon-alt-waxing-crescent-6'},
        {n:'first quarter',     i:'wi wi-moon-alt-first-quarter'},
        {n:'waxing gibbous',    i:'wi wi-moon-alt-waxing-gibbous-1'},
        {n:'waxing gibbous',    i:'wi wi-moon-alt-waxing-gibbous-2'},
        {n:'waxing gibbous',    i:'wi wi-moon-alt-waxing-gibbous-3'},
        {n:'waxing gibbous',    i:'wi wi-moon-alt-waxing-gibbous-4'},
        {n:'waxing gibbous',    i:'wi wi-moon-alt-waxing-gibbous-5'},
        {n:'waxing gibbous',    i:'wi wi-moon-alt-waxing-gibbous-6'},
        {n:'full moon',         i:'wi wi-moon-alt-full'},
        {n:'waning gibbous',    i:'wi wi-moon-alt-waning-gibbous-1'},
        {n:'waning gibbous',    i:'wi wi-moon-alt-waning-gibbous-2'},
        {n:'waning gibbous',    i:'wi wi-moon-alt-waning-gibbous-3'},
        {n:'waning gibbous',    i:'wi wi-moon-alt-waning-gibbous-4'},
        {n:'waning gibbous',    i:'wi wi-moon-alt-waning-gibbous-5'},
        {n:'waning gibbous',    i:'wi wi-moon-alt-waning-gibbous-6'},
        {n:'third quarter',     i:'wi wi-moon-alt-third-quarter'},
        {n:'waning crescent',   i:'wi wi-moon-alt-waning-crescent-1'},
        {n:'waning crescent',   i:'wi wi-moon-alt-waning-crescent-2'},
        {n:'waning crescent',   i:'wi wi-moon-alt-waning-crescent-3'},
        {n:'waning crescent',   i:'wi wi-moon-alt-waning-crescent-4'},
        {n:'waning crescent',   i:'wi wi-moon-alt-waning-crescent-5'},
        {n:'waning crescent',   i:'wi wi-moon-alt-waning-crescent-6'},
    ];

    function TempKToF(K) { return ((K - 273.15) * 1.8) + 32; }
    function TempKToC(K) { return K - 273.15; }
    function TempCToF(C) { return (C * 1.8) + 32; }
    function TempFToC(F) { return (F - 32) / 1.8; }
    function SpeedMPHtoMPS(mph) { return mph * 0.44704; }
    function SpeedMPStoMPH(mps) { return mps * 2.236936; }
    function Weekday(date) {
        var dayOfWeek = new Date(date).getDay();
        return isNaN(dayOfWeek) ? null : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek];
    }
    /**
     * @param {number} value 
     * @param {string} units 
     */
    function GetConvertedTempUnits(value, units) {
        var valC, valF;
        switch (units.toLowerCase()) {
            case 'c':
                valC = value;
                valF = TempCToF(value);
                break;
            case 'f':
                valC = TempFToC(value);
                valF = value;
                break;
            default:
            case 'k':
                valC = TempKToC(value);
                valF = TempKToF(value);
                break;
        }
        valC = valC.toFixed(0);
        valF = valF.toFixed(0);
        valC = valC == -0 ? 0 : valC;
        valF = valF == -0 ? 0 : valF;
        return { C: valC, F: valF };
    }

    /**
     * 
     * @param {number} phase 
     */
    function GetMoonPhaseData(phase) {
        if(phase < 0 || phase > 1) {
            return {description:'unknown', icon: 'wi wi-alien'};
        }
        var data = moonIcons[Math.floor(((moonIcons.length-1)*phase)+0.5)];
        return {description: data.n, icon: data.i};
    }
    /**
     * @param {number} value 
     * @param {string} units 
     */
    function GetConvertedSpeedUnits(value, units) {
        var valMiles, valMeters;
        switch (units.toLowerCase()) {
            case 'm/h':
            case 'mph':
                valMiles = value;
                valMeters = SpeedMPHtoMPS(value);
                break;
            case 'm/s':
            case 'mps':
                valMiles = SpeedMPStoMPH(value);
                valMeters = value;
                break;
        }
        return { MilesPerHour: valMiles.toFixed(0), MetersPerSecond: valMeters.toFixed(1) };
    }

    /**
     * 
     * @param {number} icon 
     * @param {'day'|'night'} dayNight 
     * @param {'owm'} format 
     */
    function GetWeatherIcon(icon, dayNight, format) {
        switch(format.toLowerCase()) {
            case 'owm':
            return 'wi wi-owm-'+dayNight+'-'+icon;
        }
        return 'wi wi-alien';
    }

    /**
     * @param {string} cityName
     * @returns {void}
     */
    this.SetCity = function (cityName) {
        $place.text(cityName);
    };

    /**
     * @param {number} value The current temperature
     * @param {'c'|'f'|'k'} units
     * @returns {void}
     */
    this.SetCurrentTemp = function (value, units) {
        var temps = GetConvertedTempUnits(value, units);
        $current_temp.text(temps.C);
    };

    /**
     * @param {number} value The current feels-like temperature
     * @param {'c'|'f'|'k'} units
     * @returns {void}
     */
    this.SetCurrentFeelsLike = function (value, units) {
        var temps = GetConvertedTempUnits(value, units);
        $current_feels_like.text('Feels like '+temps.C);
    }

    /**
     * @param {number} value The low temperature for today
     * @param {'c'|'f'|'k'} units
     * @returns {void}
     */
    this.SetCurrentDailyLow = function (value, units) {
        var temps = GetConvertedTempUnits(value, units);
        $temp_low.text(temps.C);
    };

    /**
     * @param {number} value The high temperature for today
     * @param {'c'|'f'|'k'} units
     * @returns {void}
     */
    this.SetCurrentDailyHigh = function (value, units) {
        var temps = GetConvertedTempUnits(value, units);
        $temp_high.text(temps.C);
    };

    /**
     * @param {number} value The current temperature
     * @param {'m/s'|'mph'} units
     * @returns {void}
     */
    this.SetCurrentWindspeed = function(value, units) {
        var speeds = GetConvertedSpeedUnits(value, units);

        var beaufortIcons = [
            {s:0.5, d:'calm', c:'wi-wind-beaufort-0'},
            {s:1.5, d:'light air', c:'wi-wind-beaufort-1'},
            {s:3.3, d:'light breeze', c:'wi-wind-beaufort-2'},
            {s:5.5, d:'gentle breeze', c:'wi-wind-beaufort-3'},
            {s:7.9, d:'moderate breeze', c:'wi-wind-beaufort-4'},
            {s:10.7, d:'fresh breeze', c:'wi-wind-beaufort-5'},
            {s:13.8, d:'strong breeze', c:'wi-wind-beaufort-6'},
            {s:17.1, d:'high winds', c:'wi-wind-beaufort-7'},
            {s:20.7, d:'gale force winds', c:'wi-wind-beaufort-8'},
            {s:24.4, d:'strong winds', c:'wi-wind-beaufort-9'},
            {s:28.4, d:'storm winds', c:'wi-wind-beaufort-10'},
            {s:32.6, d:'violent storm', c:'wi-wind-beaufort-11'},
            {s:32.7, d:'hurricane force', c:'wi-wind-beaufort-12'},
        ];
        let activeWind = beaufortIcons[beaufortIcons.length-1];
        for(var i = 0; i < beaufortIcons.length-1; ++i) {
            if(speeds.MetersPerSecond <= beaufortIcons[i].s) {
                activeWind = beaufortIcons[i];
                break;
            }
        }
        $wind_icon.removeClass().addClass('wi').addClass(activeWind.c);
        $wind_icon_label.text(speeds.MetersPerSecond + ' m/s' );
    };

    /**
     * @param {number} icon 
     * @param {'day'|'night'} dayNight
     * @param {'owm'} format 
     */
    this.SetCurrentWeatherIcon = function(icon, dayNight, format) {
        $weather_icon
            .removeClass()
            .addClass(GetWeatherIcon(icon, dayNight, format));
    };

    /**
     * @param {string} description 
     */
    this.SetCurrentWeatherDescription = function(description) {
        $weather_description.text(description);
    };

    /**
     * @param {import('moment').Moment} now
     * @param {import('moment').Moment} sunrise
     * @param {import('moment').Moment} sunset
     */
    this.SetCurrentSunriseSunset = function(now, sunrise, sunset) {
        var isDaytime = (now.diff(sunrise) >= 0 && now.diff(sunset) <= 0);
        
        var lastMoment, nextMoment;

        $sunrise.text((isDaytime ? sunrise:sunset).format('h:mm a'));
        $sunset.text( (isDaytime ? sunset:sunrise).format('h:mm a'));
                
        if(isDaytime) {
            $daylight.show().text( sunset.from(sunrise, true) + ' of daylight' );
            $sunprog.addClass('bg-warning');
            $sunprog.removeClass('bg-info');

            lastMoment = sunrise;
            nextMoment = sunset;
            $timeuntil.text('Sunset is ' + sunset.from(now));
        } else {
            $daylight.hide();
            $sunprog.addClass('bg-info');
            $sunprog.removeClass('bg-warning');

            if(now.diff(sunset) > 0) {
                lastMoment = sunset;
                nextMoment = sunrise.add({days:1});
            } else {
                lastMoment = sunset.subtract({days:1});
                nextMoment = sunrise;
            }
            $timeuntil.text('Sunrise is ' + nextMoment.from(now));
        }

        
        var progress = Math.abs((1-(now.diff(nextMoment) / lastMoment.diff(nextMoment))) * 100);
            
        $sunprog.parent().css('height', '1.5em');
        if(progress >= 80 || progress <= 10) {
            $sunprog.addClass('progress-bar-animated');
            if(progress > 90) {
                $sunprog.parent().css('height', '2.5em');
            }
        } else {
            $sunprog.removeClass('progress-bar-animated');
        }

        $sunprog.attr('aria-valuenow', Math.floor(progress));
        $sunprog.css('width', progress + '%');
    };

    /**
     * @param {number} phase
     */
    this.SetCurrentMoonPhase = function(phase) {
        var current = GetMoonPhaseData(phase);
        
        $moon_icon
            .removeClass()
            .addClass(current.icon);

        $moon_icon_label.text(current.description);
    };

    /**
     * Show any UI that indicates which future dates contain data for display.
     * example: show "Wednesday" above the first future forecast day if it's tuesday.
     * @param {import('moment').Moment} now current date
     * @param {import('moment').Moment[]} dates
     */
    this.SetFutureDates = function(dates) {
        if($futurex_day.length !== dates.length) {
            return console.error('Future dates provided don\'t match');
        }
        for(var i = 0; i < dates.length; ++i) {
            $futurex_day[i].text(dates[i].format('dddd'));
            $futurex_day_sm[i].text(dates[i].format('ddd'));
        }
        // store for future UI updates related to these days.
        futureDays = dates;
    };

    /**
     * @param {import('moment').Moment} date date the temp is relative to
     * @param {number} value
     * @param {'c'|'f'|'k'} units
     */
    this.SetFutureAverageTemperature = function(date, value, units) {
        var temps = GetConvertedTempUnits(value, units);
        var changed = 0;
        for(var i = 0; i < futureDays.length; ++i) {
            if(futureDays[i].diff(date, 'days') === 0) {
                changed++;
                $futurex_temp[i].text(' ' + temps.C);
            }
        }
        if(changed !== 1) {
            console.error('SetFutureAverageTemperature had no effect');;
        }
    };

    /**
     * @param {import('moment').Moment} date date the icon is relative to 
     * @param {number} icon 
     * @param {'owm'} format 
     */
    this.SetFutureWeatherIcon = function(date, icon, format) {
        var changed = 0;
        for(var i = 0; i < futureDays.length; ++i) {
            if(futureDays[i].diff(date, 'days') === 0) {
                changed++;
                $futurex_icon[i]
                    .removeClass()
                    .addClass(GetWeatherIcon(icon, 'day', format));
            }
        }
        if(changed !== 1) {
            console.error('SetFutureWeatherIcon had no effect');;
        }
    };

    /**
     * @param {string} description 
     */
    this.SetFutureWeatherDescription = function(date, description) {
        for(var i = 0; i < futureDays.length; ++i) {
            if(futureDays[i].diff(date, 'days') === 0) {
                $futurex_icon[i]
                    .attr('title', description);
            }
        }
    };

}