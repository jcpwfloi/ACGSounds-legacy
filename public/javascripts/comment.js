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
    var addComment = function (cmt, floor) {
        $('#commentBox').append($('.template-1').html().format(
            cmt.author.username, cmt.text, floor, cmt.likeCount, (new Date(cmt.createdAt)).Format('yyyy-MM-dd hh:mm:ss')
        ));
        $("#commentBox li:last img").attr('src' , 'http://cn.gravatar.com/avatar/' + $.md5(cmt.email));
        if (cmt.isLiked) {
            $('#comment-thumbup-' + floor).removeClass('text-lighten-4');
        }
    };
    var loadComments = function() {
        $('#commentBox').html('');
        var data = {
            sheet_id: window.sheet_id,
            _csrf: $('meta[name=csrf-token]').attr('content')
        };
        $.post('/api/comment/list', data, function(r) {
            comments = r;
            for (var i = 0; i < r.length; ++i) {
                addComment(r[i], i + 1);
            }
        }, 'json').error(function (err) {
        });
    };

    window.likeComment = function (floor) {
        var cmt = comments[floor - 1];
        var likesDisp = $('#comment-likes-' + floor);
        var thumbBtn = $('#comment-thumbup-' + floor);
        if (thumbBtn.hasClass('disabled')) return;
        thumbBtn.addClass('disabled').toggleClass('text-lighten-4').children().first().addClass('thumb-popping');
        var data = {
            id: cmt._id,
            _csrf: $('meta[name=csrf-token]').attr('content')
        };
        $.ajax({
            type: 'POST',
            url: '/api/comment/like',
            data: data,
            statusCode: { 403: function () {
                Materialize.toast('请先登录', 3000, 'rounded');
                thumbBtn.removeClass('disabled').addClass('text-lighten-4').children().first().removeClass('thumb-popping');
                return;
            } },
            success: function (r) {
                setTimeout(function () {
                    if (r.operation === 'like') {
                        likesDisp.html(Number(likesDisp.html()) + 1);
                        thumbBtn.removeClass('disabled').removeClass('text-lighten-4').children().first().removeClass('thumb-popping');
                    } else {
                        likesDisp.html(Number(likesDisp.html()) - 1);
                        thumbBtn.removeClass('disabled').addClass('text-lighten-4').children().first().removeClass('thumb-popping');
                }}, 400);
            }
        });
    };

    var loadCommentBox = function () {
        // Will be ignored if no comment buttons are present.
        $('#btn-comment').click(function () {
            var data = {
                sheet_id: window.sheet_id,
                text: $('#text-comment').val(),
                _csrf: $('meta[name=csrf-token]').attr('content')
            };
            if (data.text.trim().length === 0) {
                Materialize.toast('请输入内容', 3000, 'rounded');
                return;
            }
            $('#btn-comment').addClass('disabled');
            $.ajax({
                type: 'POST',
                url: '/api/comment/create',
                data: data,
                statusCode: { 400: function (r) {
                    Materialize.toast('出错啦 &gt; &lt;<br>' + r.responseJSON.msg, 3000, 'rounded');
                    $('#btn-comment').removeClass('disabled');
                } },
                success: function (r) {
                    Materialize.toast('评论发送成功 √', 3000, 'rounded');
                    $('#btn-comment').removeClass('disabled');
                    $('#text-comment').val('');
                    loadComments();
                }
            });
        });
    };

    $(document).ready(function() {
        loadComments();
        loadCommentBox();
    });

});

