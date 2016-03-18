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
    $('#play').click(function() {
        MIDIjs.play('http://cdn.acgsounds.com/{0}.mid'.format(sheet_id));
        $('#play').hide();
        $('#pause').show();
    });
    $('#pause').click(function() {
        MIDIjs.pause();
        $('#pause').hide();
        $('#resume').show();
    });
    $('#resume').click(function() {
        MIDIjs.resume();
        $('#resume').hide();
        $('#pause').show();
    });
    $('#stop').click(function() {
        MIDIjs.stop();
        $('#resume').hide();
        $('#pause').hide();
        $('#play').show();
    });
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
