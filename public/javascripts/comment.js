$(function() {

    String.prototype.format = function() {
        var args = arguments;
        return this.replace(/{(\d+)}/g, function(match, number) { 
            return typeof args[number] != 'undefined' ? args[number] : match;
        });
    };

    var parseComment = function() {
        $('#commentBox').html('');
        var str = $('.template-1').html();
        str = str.format('jcpwfloi', '嘿嘿嘿', '1', 0);
        $('#commentBox').append(str);
        $('#commentBox li:last img').attr('src', 'http://cn.gravatar.com/avatar/' + $.md5('jcpwfloi@gmail.com'));
        $('#commentBox').append(str);
        $('#commentBox li:last img').attr('src', 'http://cn.gravatar.com/avatar/' + $.md5('jcpwfloi@gmail.com'));
    };

    var bindComment = function() {
        $('a[data-comment]').click(function() {
            if ($(this).hasClass('text-lighten-4')) {
                $(this).removeClass('text-lighten-4');
                $(this).prev().html(Number($(this).prev().html()) + 1);
            } else {
                $(this).addClass('text-lighten-4');
                $(this).prev().html(Number($(this).prev().html()) - 1);
            }
        });
    };

    function comment() {
        parseComment();
        bindComment();
    }

    $(document).ready(function() {
        setTimeout(function() {
            comment();
        }, 2000);
    });

});

