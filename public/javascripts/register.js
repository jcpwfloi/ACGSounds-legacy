window.locales = {
    'zh': {
        'Network Error': "网络错误，请稍后再试 ({0})",
        '404 Not Found': "404 找不到页面",
        'EREQ': "请填写 {0}",
        'EMINL': "{0} (`{1}`) 小于最短长度 ({2})",
        'EMAXL': "{0} (`{1}`) 大于最短长度 ({2})",
        'email': "电子邮箱",
        'username': "用户名",
        'Username duplicated.': "用户名或电子邮箱已被占用",
        'Passwords differ.': "两次输入密码不一致",
        'Password is too simple.': "密码过于简单"
    },
    'default': {
        'Network Error': "Network Error ({0})",
        '404 Not Found': "404 Not Found",
        'EREQ': "Required {0}",
        'EMINL': "{0} (`{1}`) is shorter than the minimum allowed length ({2})",
        'EMAXL': "{0} (`{1}`) is longer than the maximum allowed length ({2})",
        'Username duplicated.': "Username or Email duplicated."
    }
};

function handleError(err) {
    switch(err.kind) {
        case 'required':
            return __('EREQ').format(__(err.path));
        case 'minlength':
            return __('EMINL').format(__(err.path), err.value, err.properties.minlength);
        case 'maxlength':
            return __('EMAXL').format(__(err.path), err.value, err.properties.maxlength);
        default:
            return __('EUNKNOWN');
    }
}

function register() {
    if (!/((\w)|[!@#$%^&*()]|(\d)){8,}/.test($('#password').val())) {
        Materialize.toast(__('Password is too simple.'), 3000, 'rounded');
        return;
    }

    if ($('#password').val() != $('#password-again').val()) {
        Materialize.toast(__('Passwords differ.'), 3000, 'rounded');
        return;
    }

    var data = {
        username: $('#username').val(),
        password: $.md5($('#password').val()),
        email: $('#email').val(),
        _csrf: $('meta[name=csrf-token]').attr('content')
    };

    $.post('/api/register', data, function(res) {
    }, "json").error(function(e) {
        if (e.status == 400) {
            var res = JSON.parse(e.responseText);
            if (res.code) {
                if (res.code == 11000) Materialize.toast(__('Username duplicated.'), 3000, 'rounded');
                else Materialize.toast(res.errmsg, 3000, 'rounded');
                return;
            }
            for (i in res.errors) {
                Materialize.toast(handleError(res.errors[i]), 3000, 'rounded');
            }
            return;
        }
        Materialize.toast(__('Network Error').format(__(e.status + ' ' + e.statusText)), 3000, 'rounded');
    });

}

$(document).ready(function() {
    $('div.input-field').find('input').keydown(function(e) {
        e.stopImmediatePropagation();
        if (e.keyCode == 13)
            register();
    });
});
