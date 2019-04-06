function WeatherWidgetView() {
    var $place = $('.weather-plugin #place');

    var $celsius = $('.weather-plugin .temp #temp-celsius');
    var $fahrenheit = $('.weather-plugin .temp #temp-fahrenheit');
    var $temp_low = $('.weather-plugin .temp #low');
    var $temp_high = $('.weather-plugin .temp #high');
    var $temp_icon = $('.weather-plugin .temp .icon #icon');
    var $temp_icon_label = $('.weather-plugin .temp .icon label');

    var $wind_icon = $('.weather-plugin .wind-and-highlow .icon #icon');
    var $wind_icon_label = $('.weather-plugin .wind-and-highlow .icon #description');

    var $future1_day = $('.weather-plugin .week .day#day1 #day');
    var $future1_icon = $('.weather-plugin .week .day#day1 .icon #icon');
    var $future1_icon_label = $('.weather-plugin .week .day#day1 .icon label');

    var $future2_day = $('.weather-plugin .week .day#day2 #day');
    var $future2_icon = $('.weather-plugin .week .day#day2 .icon #icon');
    var $future2_icon_label = $('.weather-plugin .week .day#day2 .icon label');

    var $future3_day = $('.weather-plugin .week .day#day3 #day');
    var $future3_icon = $('.weather-plugin .week .day#day3 .icon #icon');
    var $future3_icon_label = $('.weather-plugin .week .day#day3 .icon label');

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
        return { C: valC.toFixed(0), F: valF.toFixed(0) };
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
    }

    /**
     * @param {number} value The current temperature
     * @param {'c'|'f'|'k'} units
     * @returns {void}
     */
    this.SetCurrentTemp = function (value, units) {
        var temps = GetConvertedTempUnits(value, units);
        $celsius.text(temps.C);
        $celsius.append($('<div>').text('°C').addClass('degree-unit'));

        $fahrenheit.text(temps.F);
        $fahrenheit.append($('<div>').text('°F').addClass('degree-unit'));
    }

    /**
     * @param {number} value The low temperature for today
     * @param {'c'|'f'|'k'} units
     * @returns {void}
     */
    this.SetCurrentDailyLow = function (value, units) {
        var temps = GetConvertedTempUnits(value, units);
        $temp_low.text('Low: ' + temps.C);
        $temp_low.append($('<div>').text('°C').addClass('degree-unit'));
        $temp_low.append($('<span>').html(temps.F).addClass('temp-fahrenheit'));
        $temp_low.append($('<div>').text('°F').addClass('degree-unit'));
    }

    /**
     * @param {number} value The high temperature for today
     * @param {'c'|'f'|'k'} units
     * @returns {void}
     */
    this.SetCurrentDailyHigh = function (value, units) {
        var temps = GetConvertedTempUnits(value, units);
        $temp_high.text('High: ' + temps.C);
        $temp_high.append($('<div>').text('°C').addClass('degree-unit'));
        $temp_high.append($('<span>').html(temps.F).addClass('temp-fahrenheit'));
        $temp_high.append($('<div>').text('°F').addClass('degree-unit'));
    }

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
        $wind_icon_label.html(activeWind.d + '<br>' + speeds.MetersPerSecond + ' m/s');
    }

    /**
     * @param {number} icon 
     * @param {'day'|'night'} dayNight
     * @param {'owm'} format 
     */
    this.SetCurrentWeatherIcon = function(icon, dayNight, format) {
        $temp_icon
            .removeClass()
            .addClass(GetWeatherIcon(icon, dayNight, format));
    }

    /**
     * @param {string} description 
     */
    this.SetCurrentWeatherDescription = function(description) {
        $temp_icon_label.text(description);
    }
}