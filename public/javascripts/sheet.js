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
    $('#seek').click(function(e) {
        if (!MIDIjs.length) {
            Materialize.toast('MIDI not loaded', 2000, 'rounded');
        }
        var clickPos = e.pageX;
        var time = (clickPos - $(this).offset().left) * MIDIjs.length / ($(this).width());
        MIDIjs.seek(time);
        $('#pause').show();
        $('#resume').hide();
        $('#play').hide();
    });
    $('#currentTime').html(parseTime(0));
    $('#totalTime').html(parseTime(0));
    MIDIjs.message_callback = function(res) {
        Materialize.toast(res, 2000);
    }
    MIDIjs.player_callback = function(res) {
        if (res.stop && abs(res.time - MIDIjs.length) < 3) {
            $('#play').show();
            $('#resume').hide();
            $('#pause').hide();
        }
        if (MIDIjs.length) {
            $('#currentTime').html(parseTime(res.time));
            $('#totalTime').html(parseTime(MIDIjs.length));
            $('.determinate').css('width', Math.floor(res.time * 100 / MIDIjs.length) + '%');
        }
    }
});
