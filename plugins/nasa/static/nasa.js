$(document).ready(function() {
    var $detail = $('<div>')
        .addClass('nasa-detail');

    var $hideBtn = $('<button>')
        .addClass('nasa-hide-btn btn btn-sm')
        .text('Hide NASA Astronomy POTD');

    var $video_iframe = $('#wallpaper-youtube');
    var $wallpaper = $('#wallpaper');
    var hideAll = $.cookie('nasa-hide-all');
    if(typeof hideAll == 'string') {
        hideAll = hideAll === 'true';
    }
    hideAll = hideAll === undefined ? false : hideAll;
    if(hideAll) {
        $hideBtn.text('Show NASA Astronomy POTD');
    }

    $video_iframe.hide();
    $wallpaper.hide();

    $hideBtn.click(function() {
        hideAll = !hideAll;
        $.cookie('nasa-hide-all', hideAll, {expires: 7});
        if(hideAll) {
            $(this).text('Show NASA Astronomy POTD');
        } else {
            $(this).text('Hide NASA Astronomy POTD');
        }
        GetImageOfTheDay();
    });

    function ClearImageOfTheDaySettings() {
        $wallpaper.hide().attr('src', '');
        $video_iframe.hide().attr('src', '');
        $detail.css('padding-right', '0').text('');
    }

    function GetImageOfTheDay() {
        $.get('/plugins/nasa/apod/')
        .done(function(data, textStatus, jqXHR) {
            ClearImageOfTheDaySettings();
            if(hideAll) {
                $wallpaper
                    .show()
                    .attr('src', '/static/ghandruk-nepal.jpg');
            } else {
                if(data.media_type === 'video') {
                    var url = data.url;
                    url = url.substring(0, url.lastIndexOf('?'));
                    var videoId = url.substring(url.lastIndexOf('/')+1);
                    $video_iframe
                        .show()
                        .attr('src',  url+'?modestbranding=1&autohide=1&controls=0&showinfo=0&rel=0&autoplay=1&loop=1&playlist='+videoId);
                    $detail.css('padding-right', '8em');
                } else {
                    var url = data.hdurl || data.url;
                    $wallpaper.show().attr('src', url);
                }
                var copyrightText = data.copyright ? ' &#169; ' + data.copyright : '';
                $detail.html(data.title + '<br>NASA Astronomy POTD.' + copyrightText);
            }
        })
        .fail(function(jqXHR, textStatus, errorThrown){
            console.error(textStatus, errorThrown);
        });
    }

    setInterval(GetImageOfTheDay, 60 * 60 * 1000);
    GetImageOfTheDay();

    $detail.text('');
    $('.body-content').append($detail).append($hideBtn);
});