$(function() {
    var comments = [];
    var pagination = new Pagination({
        pageButton: function (num, active) {
            return $('#template-pag-button' + (active ? '-active' : '')).html().replace('display: none', '').format(num, num + 1);
        }, prevButton: function (disabled) {
            return $('#template-pag-prev' + (disabled ? '-disabled' : '')).html().replace('display: none', '');
        }, nextButton: function (disabled) {
            return $('#template-pag-next' + (disabled ? '-disabled' : '')).html().replace('display: none', '');
        }, pageButtonsAdd: function (html) {
            $('#pag').html(html);
        }, contentRenderer: function (num, ctnt) {
            $('#commentBox').append($('.template-1').html().format(
                ctnt.author.username, ctnt.text, num + 1, ctnt.likeCount, (new Date(ctnt.createdAt)).Format('yyyy-MM-dd hh:mm:ss')
            ));
            $("#commentBox li:last img").attr('src' , 'http://cn.gravatar.com/avatar/' + $.md5(ctnt.author.email));
            if (ctnt.isLiked) {
                $('#comment-thumbup-' + floor).removeClass('text-lighten-4');
            }
        }, contentClearer: function () {
            $('#commentBox').html('');
        }
    });
    window.pag_go = function (page) {
        pagination.go(page);
    };
    window.pag_prev = function () { pagination.prev(); };
    window.pag_next = function () { pagination.next(); };
    var loadComments = function() {
        /*var data = {
            sheet_id: window.sheet_id,
            _csrf: $('meta[name=csrf-token]').attr('content')
        };
        $.post('/api/comment/list', data, function(r) {
            comments = r;
            // Create pagination
            $('#pag-numbers').html('');
            for (var i = 0; i < Math.ceil(r.length / pag_size); ++i) {
                var li = $('<li class="waves-effect" id="pag-{0}"><a href="javascript:;">{0}</a></li>'.format(i + 1));
                li.click((function (_i) { return function () { window.pag_go(_i); }; })(i + 1));
                $('#pag-numbers').append(li);
            }
            pag_cur = undefined;
            window.pag_go(1);
        }, 'json').error(function (err) {
        });*/
        r = [];
        for (var i = 0; i < 100; ++i) {
            r.push({
                text: 'Lorem ipsum Dolor<br>I\'m floor #' + (i + 1),
                likeCount: 233,
                createdAt: Date.now(),
                author: {username: 'tester233', email: 'tester233@example.com'}
            });
        }
        pagination.load(r, function (err) { console.log(err); });
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

