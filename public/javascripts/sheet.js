var parseTime = function (time) {
    var d = new Date('2000/1/1 00:00:00');
    d = new Date(d.getTime() + time * 1000);
    return d.Format('hh:mm:ss');
}

var read_array_buffer_async = function (url, callback) {
    var req = new XMLHttpRequest();
    req.open('GET', url, true);
    req.responseType = 'arraybuffer';
    req.onload = function (e) {
        var buf = req.response;
        if (buf) {
            callback(buf);
        }
    };
    req.send(null);
};

var read_midi_events = function (url, callback) {
    read_array_buffer_async(url, function (buf) {
        var file = new MIDIFile(buf);
        var events = file.getEvents();
        var ret = [];
        for (var i = 0; i < events.length; ++i) {
            if (events[i].type === MIDIEvents.EVENT_MIDI) {
                if (events[i].subtype === MIDIEvents.EVENT_MIDI_NOTE_OFF) {
                    ret.push({
                        time: events[i].playTime,
                        is_on: 0,
                        pitch: events[i].param1,
                        vel: events[i].param2
                    });
                } else if (events[i].subtype === MIDIEvents.EVENT_MIDI_NOTE_ON) {
                    ret.push({
                        time: events[i].playTime,
                        is_on: 1,
                        pitch: events[i].param1,
                        vel: events[i].param2
                    });
                }
            }
        }
        callback(events);
    });
};

function lengthParser(callback) {
    read_midi_events('http://cdn.acgsounds.com/{0}.mid'.format(window.sheet_id), function(data) {
        callback(Math.round(data[data.length - 1].playTime / 1000));
    });
}
function resize() {
    $('#pdf').css('height', window.innerHeight - Number(/\d+/.exec($('nav').css('height'))[0]) - 20 + 'px');
}

$(window).resize(resize);

$(document).ready(function() {
    resize();
    lengthParser(function(length) {
        $('#currentTime').html(parseTime(0));
        $('#totalTime').html(parseTime(length));
        MIDIjs.message_callback = function(res) {
            Materialize.toast(res, 2000);
        }
        MIDIjs.player_callback = function(res) {
            $('#currentTime').html(parseTime(res.time));
            $('.determinate').css('width', Math.floor(res.time * 100 / length) + '%');
        }
    });
});
