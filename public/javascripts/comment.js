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
    }

    var parseComment = function() {
        $('#commentBox').html('');
        var str = $('.template-1').html();

        /*
        $.post('/api/getCommentBySheet', data, function(res) {
            for (var i = 0; i < res.data; ++ i) {
                $('#commentBox').append(str.format(res.data[i].username, res.data[i].content, i, res.data[i].like));
                $('#commentBox li:last img').attr('src', 'http://cn.gravatar.com/avatar/' + $.md5(res.data[i].email));
            }
        }, "json").error(function(e) {
        });*/

       /*
        str = str.format('jcpwfloi', '嘿嘿嘿', '1', 0, new Date().Format('yyyy-MM-dd hh:mm:ss'));
        $('#commentBox').append(str);
        $('#commentBox li:last img').attr('src', 'http://cn.gravatar.com/avatar/' + $.md5('jcpwfloi@gmail.com'));
        $('#commentBox').append(str);
        $('#commentBox li:last img').attr('src', 'http://cn.gravatar.com/avatar/' + $.md5('jcpwfloi@gmail.com'));*/
    };

    var bindComment = function() {
        $('a[data-comment]').click(function(e) {
            e.preventDefault();
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
        comment();
    });

});

