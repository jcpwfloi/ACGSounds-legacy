function login() {
    var data = {
        username: $('#username').val(),
        password: $.md5($('#password').val()),
        _csrf: $('meta[name=csrf-token]').attr('content')
    };

    $.post('/api/login', data, function (res) {
        if (res.msg == 'Success') {
            if ($.urlParam('callback'))
                window.location.href = $.urlParam('callback');
            else window.location.href = '/';
        } else Materialize.toast('未知错误', 3000, 'rounded');
    }, "json").error(function (e) {
        if (e.responseJSON.msg === 'ENOTMATCH') {
            Materialize.toast('用户名或密码不正确', 3000, 'rounded');
        } else {
            Materialize.toast('未知错误 &gt; &lt;<br>Message: ' + e.responseJSON.msg, 3000, 'rounded');
        }
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
