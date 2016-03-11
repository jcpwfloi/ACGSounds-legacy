(function() {
    var tempStr = "";
    $(document).ready(function() {
        var files;

        $('input[type=file]').on('change', function(event) {
            files = event.target.files;
        });

        $('#sheetIntro').keyup(function(e) {
            if ($('#sheetIntro').val() != tempStr) {
                tempStr = $('#sheetIntro').val();
                $('#textCount').html(tempStr.length);
            }
        });

        $('#submit').click(function(e) {
            $('form').submit();
        });

    });
})();
