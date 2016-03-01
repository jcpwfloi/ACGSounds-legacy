function login() {
    var data = {
        username: $('#username').val(),
        password: $.md5($('#password').val()),
        _csrf: $('meta[name=csrf-token]').attr('content')
    };

    console.log(data);

    $.post('/api/login', data, function(res) {
    }, "json").error(function(e) {
    });
}

$(document).ready(function() {
    $('#username').keyup(function(e) {
        if (e.keyCode == 13)
            login();
    });
    $('#password').keyup(function(e) {
        if (e.keyCode == 13)
            login();
    });
});
