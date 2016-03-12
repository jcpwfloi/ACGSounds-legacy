$(function() {

    String.prototype.format = function() {
        var args = arguments;
        return this.replace(/{(\d+)}/g, function(match, number) { 
            return typeof args[number] != 'undefined' ? args[number] : match;
        });
    };
    
    Date.prototype.Format = function (fmt) {
        var o = {
            "M+": this.getMonth() + 1, //月份
            "d+": this.getDate(), //日
            "h+": this.getHours(), //小时
            "m+": this.getMinutes(), //分
            "s+": this.getSeconds(), //秒
            "q+": Math.floor((this.getMonth() + 3) / 3), //季度
            "S": this.getMilliseconds() //毫秒
        };
        if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        return fmt;
    };

    var comments = [];
    var loadComments = function() {
        $('#commentBox').html('');
        var str = $('.template-1').html();
        var data = {
            sheet_id: window.sheet_id,
            _csrf: $('meta[name=csrf-token]').attr('content')
        };
        $.post('/api/comment/list', data, function(r) {
            comments = r;
            for (var i = 0; i < r.length; ++i) {
                $('#commentBox').append(str.format(
                    r[i].author.username, r[i].text, i + 1, r[i].likeCount, (new Date(r[i].createdAt)).Format('yyyy-MM-dd hh:mm:ss')
                ));
                $("#commentBox li:last img").attr('src' , 'http://cn.gravatar.com/avatar/' + $.md5(r[i].email))
                if (r[i].isLiked) {
                    $('#comment-thumbup-' + (i + 1)).removeClass('text-lighten-4');
                }
            }
        }, 'json').error(function (err) {
        });
    };

    window.likeComment = function (floor) {
        var cmt = comments[floor - 1];
        var likesDisp = $('#comment-likes-' + floor);
        $('#comment-thumbup-' + floor).removeClass('text-lighten-4');
        if (!cmt.isLiked) {
            likesDisp.html(Number(likesDisp.html()) + 1);
            $('#comment-thumbup-' + floor).removeClass('text-lighten-4');
        } else {
            likesDisp.html(Number(likesDisp.html()) - 1);
            $('#comment-thumbup-' + floor).addClass('text-lighten-4');
        }
        cmt.isLiked = !cmt.isLiked;
    };

    $(document).ready(function() {
        loadComments();
    });

});

