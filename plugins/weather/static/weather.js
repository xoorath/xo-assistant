$(document).ready(function() {
    let city = 'Ottawa';
    // todo: get timezone utc offset more reliably.
    // this is EDT and with daylight savings will cease being true.
    let timezone = -4;

    $place              = $('.weather-plugin #place');

    $celsius            = $('.weather-plugin .temp #temp-celsius');
    $fahrenheit         = $('.weather-plugin .temp #temp-fahrenheit');
    $temp_low           = $('.weather-plugin .temp #low');
    $temp_high          = $('.weather-plugin .temp #high');
    $temp_icon          = $('.weather-plugin .temp .icon #icon');
    $temp_icon_label    = $('.weather-plugin .temp .icon label');

    $sunrise    = $('.weather-plugin .sun #sunrise');
    $sunset     = $('.weather-plugin .sun #sunset');
    $sunprog    = $('.weather-plugin .sun .progress-bar');
    $daylight   = $('.weather-plugin .sun #daylight');
    $timeuntil  = $('.weather-plugin .sun #time-until');

    $moon_icon          = $('.weather-plugin .moon.icon #icon');
    $moon_icon_label    = $('.weather-plugin .moon.icon label');
    
    function TempKToF(K) { return ((K-273.15)*1.8)+32; }
    function TempKToC(K) { return K-273.15; }

    moment.relativeTimeThreshold('m',  120);

    function ParseOWMLocation(data) {
        $place.text(data.name);
    }

    function ParseOWMTempAndIcon(data) {
        var nowTime = Math.floor(Date.now() / 1000);
        var weatherClass = 'wi wi-owm-';
        var isDaytime = (nowTime > data.sys.sunrise && nowTime <= data.sys.sunset);
        weatherClass +=  isDaytime? 'day-' : 'night-';
        weatherClass += data.weather[0].id;
        $temp_icon
            .removeClass()
            .addClass('wi')
            .addClass(weatherClass);
        
        $temp_icon_label.text(data.weather[0].description);

        
        $celsius.text(      Math.floor(TempKToC(data.main.temp)) + '°C')
        $fahrenheit.text(   Math.floor(TempKToF(data.main.temp)) + '°F');

        $temp_low.text('Low: ' + Math.floor(TempKToC(data.main.temp_min)) + '°C | ' + Math.floor(TempKToF(data.main.temp_min)) + '°F');
        $temp_high.text('High: ' + Math.floor(TempKToC(data.main.temp_max)) + '°C | ' + Math.floor(TempKToF(data.main.temp_max)) + '°F');
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
        ParseOWMLocation(data);
        ParseOWMTempAndIcon(data);
        ParseOWMSunriseSunset(data);
        ParseOWMMoon(data);

        console.log(data);
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

    setInterval(GetWeatherStatus, 5000);
    GetWeatherStatus();
});