var parseTime = function (time) {
    var d = new Date('2000/1/1 00:00:00');
    d = new Date(d.getTime() + time * 1000);
    return d.Format('hh:mm:ss');
}

function resize() {
    $('#pdf').css('height', window.innerHeight - Number(/\d+/.exec($('nav').css('height'))[0]) - 20 + 'px');
}

$(window).resize(resize);

$(document).ready(function() {
    resize();
    $('#currentTime').html(parseTime(0));
    $('#totalTime').html(parseTime(0));
    MIDIjs.message_callback = function(res) {
        Materialize.toast(res, 2000);
    }
    MIDIjs.player_callback = function(res) {
        if (MIDIjs.length) {
            $('#currentTime').html(parseTime(res.time));
            $('#totalTime').html(parseTime(MIDIjs.length));
            $('.determinate').css('width', Math.floor(res.time * 100 / MIDIjs.length) + '%');
        }
    }
});
