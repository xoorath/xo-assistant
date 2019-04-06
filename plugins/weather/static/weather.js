$(document).ready(function() {
    let city = 'Ottawa';
    // todo: get timezone utc offset more reliably.
    // this is EDT and with daylight savings will cease being true.
    let timezone = -4;

    var $future1_day        = $('.weather-plugin .week .day#day1 #day');
    var $future1_icon       = $('.weather-plugin .week .day#day1 .icon #icon');
    var $future1_icon_label = $('.weather-plugin .week .day#day1 .icon label');

    var $future2_day        = $('.weather-plugin .week .day#day2 #day');
    var $future2_icon       = $('.weather-plugin .week .day#day2 .icon #icon');
    var $future2_icon_label = $('.weather-plugin .week .day#day2 .icon label');

    var $future3_day        = $('.weather-plugin .week .day#day3 #day');
    var $future3_icon       = $('.weather-plugin .week .day#day3 .icon #icon');
    var $future3_icon_label = $('.weather-plugin .week .day#day3 .icon label');

    var $futurex_day = [$future1_day, $future2_day, $future3_day];
    var $futurex_icon = [$future1_icon, $future2_icon, $future3_icon];
    var $futurex_label = [$future1_icon_label, $future2_icon_label, $future3_icon_label];

    var $sunrise    = $('.weather-plugin .sun #sunrise');
    var $sunset     = $('.weather-plugin .sun #sunset');
    var $sunprog    = $('.weather-plugin .sun .progress-bar');
    var $daylight   = $('.weather-plugin .sun #daylight');
    var $timeuntil  = $('.weather-plugin .sun #time-until');

    var $moon_icon          = $('.weather-plugin .moon.icon #icon');
    var $moon_icon_label    = $('.weather-plugin .moon.icon label');

    window.WeatherWidget = window.WeatherWidget || {};
    window.WeatherWidget.View = window.WeatherWidget.View || new WeatherWidgetView();
    /**
     * @type {WeatherWidgetView}
     */
    var View = window.WeatherWidget.View;
    
    
    
    function TempKToF(K) { return ((K-273.15)*1.8)+32; }
    function TempKToC(K) { return K-273.15; }
    function Weekday(date) {
        var dayOfWeek = new Date(date).getDay();    
        return isNaN(dayOfWeek) ? null : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek];
    }

    moment.relativeTimeThreshold('m',  120);


    function ParseOWMTempAndIcon(data) {
        var nowTime = Math.floor(Date.now() / 1000);
        var dayNight = (nowTime > data.sys.sunrise && nowTime <= data.sys.sunset) ? 'day' : 'night';
        
        View.SetCurrentWeatherIcon(data.weather[0].id, dayNight, 'owm');
        View.SetCurrentWeatherDescription(data.weather[0].description);

        View.SetCurrentTemp         (data.main.temp,        'k');
        View.SetCurrentDailyLow     (data.main.temp_min,    'k');
        View.SetCurrentDailyHigh    (data.main.temp_max,    'k');

        View.SetCurrentWindspeed    (data.wind.speed,       'm/s');
    }

    function ParseOWMSunriseSunset(data) {
        var nowTime = Math.floor(Date.now() / 1000);
        var isDaytime = (nowTime > data.sys.sunrise && nowTime <= data.sys.sunset);

        var nowMoment = moment().utcOffset(timezone);
        var sunriseMoment = moment(data.sys.sunrise * 1000).utcOffset(timezone);
        var sunsetMoment = moment(data.sys.sunset * 1000).utcOffset(timezone);
        var lastMoment, nextMoment;

        $sunrise.text((isDaytime ? sunriseMoment:sunsetMoment).format('h:mm a'));
        $sunset.text( (isDaytime ? sunsetMoment:sunriseMoment).format('h:mm a'));
                
        if(isDaytime) {
            $daylight.show().text( sunsetMoment.from(sunriseMoment, true) + ' of daylight' );
            $sunprog.addClass('bg-warning');
            $sunprog.removeClass('bg-info');

            lastMoment = sunriseMoment;
            nextMoment = sunsetMoment;
            $timeuntil.text('Sunset is ' + sunsetMoment.from(nowMoment));
        } else {
            $daylight.hide();
            $sunprog.addClass('bg-info');
            $sunprog.removeClass('bg-warning');

            if(nowMoment.diff(sunsetMoment) > 0) {
                lastMoment = sunsetMoment;
                nextMoment = sunriseMoment.add({days:1});
                $timeuntil.text('Sunrise is ' + nextMoment.from(nowMoment));
            } else {
                lastMoment = sunsetMoment.subtract({days:1});
                nextMoment = sunriseMoment;
                $timeuntil.text('Sunrise is ' + nextMoment.from(nowMoment));
            }
        }

        
        var progress = Math.abs((1-(nowMoment.diff(nextMoment) / lastMoment.diff(nextMoment))) * 100);
            
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
    }

    function ParseOWMMoon(data) {
        var phase = SunCalc.getMoonIllumination(new Date()).phase;
        var moonIcons = [
            {n:'new moon',          i:'wi-moon-alt-new'},
            {n:'waxing crescent',   i:'wi-moon-alt-waxing-crescent-1'},
            {n:'waxing crescent',   i:'wi-moon-alt-waxing-crescent-2'},
            {n:'waxing crescent',   i:'wi-moon-alt-waxing-crescent-3'},
            {n:'waxing crescent',   i:'wi-moon-alt-waxing-crescent-4'},
            {n:'waxing crescent',   i:'wi-moon-alt-waxing-crescent-5'},
            {n:'waxing crescent',   i:'wi-moon-alt-waxing-crescent-6'},
            {n:'first quarter',     i:'wi-moon-alt-first-quarter'},
            {n:'waxing gibbous',    i:'wi-moon-alt-waxing-gibbous-1'},
            {n:'waxing gibbous',    i:'wi-moon-alt-waxing-gibbous-2'},
            {n:'waxing gibbous',    i:'wi-moon-alt-waxing-gibbous-3'},
            {n:'waxing gibbous',    i:'wi-moon-alt-waxing-gibbous-4'},
            {n:'waxing gibbous',    i:'wi-moon-alt-waxing-gibbous-5'},
            {n:'waxing gibbous',    i:'wi-moon-alt-waxing-gibbous-6'},
            {n:'full moon',         i:'wi-moon-alt-full'},
            {n:'waning gibbous',    i:'wi-moon-alt-waning-gibbous-1'},
            {n:'waning gibbous',    i:'wi-moon-alt-waning-gibbous-2'},
            {n:'waning gibbous',    i:'wi-moon-alt-waning-gibbous-3'},
            {n:'waning gibbous',    i:'wi-moon-alt-waning-gibbous-4'},
            {n:'waning gibbous',    i:'wi-moon-alt-waning-gibbous-5'},
            {n:'waning gibbous',    i:'wi-moon-alt-waning-gibbous-6'},
            {n:'third quarter',     i:'wi-moon-alt-third-quarter'},
            {n:'waning crescent',   i:'wi-moon-alt-waning-crescent-1'},
            {n:'waning crescent',   i:'wi-moon-alt-waning-crescent-2'},
            {n:'waning crescent',   i:'wi-moon-alt-waning-crescent-3'},
            {n:'waning crescent',   i:'wi-moon-alt-waning-crescent-4'},
            {n:'waning crescent',   i:'wi-moon-alt-waning-crescent-5'},
            {n:'waning crescent',   i:'wi-moon-alt-waning-crescent-6'},
        ];
        var current = moonIcons[Math.floor(((moonIcons.length-1)*phase)+0.5)];
        $moon_icon
            .removeClass()
            .addClass('wi')
            .addClass(current.i);
        $moon_icon_label.text(current.n);
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
            console.log(data);
            let day0 = new Date();
            day0.setHours(0, 0, 0, 0);
            console.log(day0);
            let days = [
                (day0/1000) + ((24) * 60 * 60 ),
                (day0/1000) + ((24+24) * 60 * 60 ),
                (day0/1000) + ((24+24+24) * 60 * 60 ),
            ];
            let icons = [[],[],[]];
            console.log(JSON.stringify(days));
            let counted = [0, 0, 0];
            let temps = [0, 0, 0];
            for(let i = 0; i < data.list.length; ++i ) {
                for(let j = 0; j < days.length; ++j) {
                    if(data.list[i].dt <= days[j]) {
                        temps[j] += data.list[i].main.temp;
                        icons[j].push(data.list[i].weather[0].icon);
                        counted[j]++;
                        break;
                    }
                }
            }

            for(let i = 0; i < counted.length; ++i) {
                if(counted[i] > 0) {
                    temps[i] /= counted[i];
                    $futurex_day[i].text(Weekday(new Date(days[i]*1000)));
                    $futurex_label[i].text(Math.round(TempKToC(temps[i])));
                    console.log(icons[i]);
                }
            }
            console.log(JSON.stringify(counted));
            console.log(JSON.stringify(temps));
        })
        .fail(function(jqXHR, textStatus, errorThrown){
            console.error(textStatus, errorThrown);
        });
    }

    setInterval(GetForecast, 60 * 60 * 1000);
    GetForecast();
});