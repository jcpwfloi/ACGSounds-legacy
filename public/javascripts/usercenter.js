window.locales = {
    'zh': {
        'Pending': '待审核',
        'Unapproved': '未通过',
        'Approved': '通过'
    },
    'default': {}
};

window.loadUserProfile = function (u) {
    $('img[data-email]').attr('src',
        '//cn.gravatar.com/avatar/' + $.md5($('img[data-email]').data('email')) + '?s=2048');
    var data = {
        _csrf: $('meta[name=csrf-token]').attr('content'),
    };

    var sheetStatusColor = ['lime', '', 'grey', 'green'];
    var sheetStatus = ['Pending', '', 'Unapproved', 'Approved'];

    $.post('/user/sheetlist/' + u._id, data, function(res) {
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
};
