window.locales = {
    'zh': {
        'Pending': '待审核',
        'Unapproved': '未通过',
        'Approved': '通过'
    },
    'default': {}
};

$(document).ready(function() {
    $('img[data-email]').attr('src',
        'http://cn.gravatar.com/avatar/{0}?s=2048'
        .format(user.email));
    var data = {
        _csrf: $('meta[name=csrf-token]').attr('content'),
    };

    var sheetStatusColor = ['lime', '', 'grey', 'green'];
    var sheetStatus = ['Pending', '', 'Unapproved', 'Approved'];

    $.post('/user/mysheet', data, function(res) {
        var str = $('.template-1').html();

        each(res, function(sheet, key) {
            var current = str.format(sheet.sheetName, '<div class="chip white-text text-lighten-2 {0}">{1}</div>'.format(sheetStatusColor[sheet.approved], __(sheetStatus[sheet.approved])), sheet._id);
            $('#all').append(current);
            if (sheet.approved === 3) $('#approved').append(current);
            if (sheet.approved === 2) $('#unapproved').append(current);
            if (sheet.approved === 0) $('#pending').append(current);
        });
    }).error(function(error) {
    });
});
