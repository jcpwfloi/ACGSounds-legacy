/**
    FUNC: parseData
        Accept data form search API and render the views

    FUNC: parsePagination
        Render pagination with current and total
*/

var locales = {
    zh: {
        "Searching....Wait": '搜索中....请稍候'
    }
};

function min(a,b){return a<b?a:b;}
function max(a,b){return a>b?a:b;}

function parseData(data) {
    $('#searchResult').html('');
    for (i in data) {
        var tagString = '';
        for (j in data[i].sheetTag) tagString = tagString + '<div class="chip">{0}</div>'.format(data[i].sheetTag[j]);
        var str = $('.template-1').html();
        $('#searchResult').append(str.format(data[i].sheetName,
                                            data[i].sheetIntro,
                                            (i == 0 ? 'active' : ''),
                                            data[i]._id, tagString,
                                            data[i].user.username));
        $('.collapsible').collapsible();
    }
}

var CONTROL = 5;

function parsePagination(current, total) {
    console.log(current, total);
    $('.pagination').html('');
    $('.pagination').append('<li class="' + (current - CONTROL > 0 ? 'waves-effect' : 'disabled') + '"><a href="javascript:prev()"><i class="material-icons">chevron_left</i></a></li>');
    for (var i = max(1, current - CONTROL + 1); i <= min(total, current + CONTROL - 1); ++ i)
        $('.pagination').append('<li class="' + (i == current ? 'active blue lighten-2' : '') + '"><a href="#">' + i+ '</a></li>');
    $('.pagination').append('<li class="' + (total - current > CONTROL ? 'waves-effect' : 'disabled') + '"><a href="javascript:next()"><i class="material-icons">chevron_right</i></a></li>');
}

function prev() {
}

function next() {
}

function search(str, page) {
    var data = {
        _csrf: $('meta[name=csrf-token]').attr('content'),
        querystring: str,
        current: page
    };

    $('#searchResult').html('<div class="row center"><div class="col s6 offset-s3"><div class="progress"><div class="indeterminate"></div></div>{0}</div></div>'.format(locales[window.languageSetting] ? locales[window.languageSetting]['Searching....Wait'] : 'Searching....Wait'));

    $.post('/api/search', data,
            function(res) {
                parseData(res.data);
                parsePagination(res.current, res.total);
            }, "json").error(function(e) {
        $('#searchResult').html('<center>搜索失败，建议重新加载页面&nbsp;&nbsp;<a href="javascript:window.location.reload()">重新加载</a></center>');
    });
}

$(document).ready(function() {
    search(window.querystr, 1);
    $('#doSearch').click(function() {
        search($('#searchInput').val(), 1);
    });
    $('#searchInput').keyup(function(e) {
        if (e.keyCode == 13) $('#doSearch').click();
    });
    $('select').material_select();
    $('.collapsible').collapsible({
        accordion : false
    });
});

