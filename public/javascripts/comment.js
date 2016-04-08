$(function() {
    var comments = [];
    var pagination = new Pagination();
    window.pagination = pagination;

    var loadComments = function() {
        pagination.options.postParams = {
            sheet_id: window.sheet_id,
            _csrf: $('meta[name=csrf-token]').attr('content')
        };
        pagination.load('/api/comment/list', function (err) { console.log(err); });
        pagination.on('refresh', function (e) {
            // Pagination buttons
            var html = '';
            each(e.pages, function (p) {
                if (p.type === 'page') html += $('#template-pag-button' + (p.active ? '-active' : '')).html().replace('display: none', '').format(p.page, p.page + 1);
                else if (p.type === 'ellipsis') html += $('#template-pag-ellipsis').html().replace('display: none', '');
                else if (p.type === 'prev') html += $('#template-pag-prev' + (p.disabled ? '-disabled' : '')).html().replace('display: none', '');
                else if (p.type === 'next') html += $('#template-pag-next' + (p.disabled ? '-disabled' : '')).html().replace('display: none', '');
            });
            $('#pagination-container').html(html);
            // Contents
            if (e.list.length === 0) {
                $('#commentBox').html($('.template-nocomments').html());
            } else {
                $('#commentBox').html('');
                each(e.list, function (c) {
                    $('#commentBox').append($('.template-1').html().format(
                        c.content.author.username, c.content.text, c.index + 1, pagination.getItemCount() - c.index,
                        c.content.likeCount, (new Date(c.content.createdAt)).Format('yyyy-MM-dd hh:mm:ss')
                    ));
                    $("#commentBox li:last img").attr('src' , 'http://cn.gravatar.com/avatar/' + $.md5(c.content.author.email));
                    if (c.content.isLiked) {
                        $('#comment-thumbup-' + (c.index + 1)).removeClass('text-lighten-4');
                    }
                });
            }
        });
    };

    window.likeComment = function (floor) {
        var cmt = pagination.contents[floor - 1];
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
                        cmt.isLiked = true; ++cmt.likeCount;
                    } else {
                        likesDisp.html(Number(likesDisp.html()) - 1);
                        thumbBtn.removeClass('disabled').addClass('text-lighten-4').children().first().removeClass('thumb-popping');
                        cmt.isLiked = false; --cmt.likeCount;
                }}, 400);
            }
        });
    };

    var loadCommentBox = function () {
        // Will be ignored if no comment buttons are present.
        var updateWordCount = function () {
            var remaining = 500 - $('#text-comment').val().length;
            $('#words-disp').text(remaining).css('color', remaining < 0 ? 'red' : 'black');
            if (remaining < 0) $('#btn-comment').addClass('disabled');
            else $('#btn-comment').removeClass('disabled');
        };
        $('#btn-comment').click(function () {
            if ($('#btn-comment').hasClass('disabled')) return;
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
                    Materialize.toast('出错啦 &gt; &lt; (400)<br>' + r.responseJSON.msg, 3000, 'rounded');
                    $('#btn-comment').removeClass('disabled');
                    updateWordCount();
                }, 403: function (r) {
                    Materialize.toast('出错啦 &gt; &lt; (403)<br>' + r.responseJSON.msg, 3000, 'rounded');
                    $('#btn-comment').removeClass('disabled');
                    updateWordCount();
                } },
                success: function (r) {
                    Materialize.toast('评论发送成功 √', 3000, 'rounded');
                    $('#btn-comment').removeClass('disabled');
                    $('#text-comment').val('');
                    loadComments();
                }
            });
        });
        $('#text-comment').change(updateWordCount);
        $('#text-comment').keyup(updateWordCount);
    };

    $(document).ready(function() {
        loadComments();
        loadCommentBox();
    });

});

