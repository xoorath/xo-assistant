$(document).ready(function() {
    let $detail = $('<div>').addClass('nasa-detail');

    function GetImageOfTheDay() {
        $.get('/plugins/nasa/apod/')
        .done(function(data, textStatus, jqXHR){
            $('#wallpaper').attr('src', `${data.hdurl}`);
            $detail.html(data.title + '<br>NASA Picture of the Day. &#169; ' + data.copyright);
        })
        .fail(function(jqXHR, textStatus, errorThrown){
            console.error(textStatus, errorThrown);
        });
    }

    setInterval(GetImageOfTheDay, 60 * 1000);
    GetImageOfTheDay();


    $detail.text('');
    $('.body-content').append($detail);
});