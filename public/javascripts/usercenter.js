$(document).ready(function() {
    $('img[data-email]').attr('src',
        'http://cn.gravatar.com/avatar/{0}?s=2048'
        .format(user.email));
    var data = {
        _csrf: $('meta[name=csrf-token]').attr('content'),
    };
    $.post('/user/mysheet', data, function(res) {
        var str = $('.template-1').html();
        each(res, function(sheet, key) {
            var current = str.format(sheet.sheetName, sheet.approved, sheet._id);
            $('#all').append(current);
            if (sheet.approved === 3) $('#approved').append(current);
            if (sheet.approved === 2) $('#unapproved').append(current);
            if (sheet.approved === 0) $('#pending').append(current);
        });
    }).error(function(error) {
    });
});
