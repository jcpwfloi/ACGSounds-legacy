(function() {
    $(document).ready(function() {
        $('a[data-id]').click(function() {
            var data = {
                id: $(this).data('id'),
                _csrf: $('meta[name=csrf-token]').attr('content'),
                type: $(this).data('type')
            };
            $.post('/audit/submit', data, function(res) {
                Materialize.toast(res.message);
                window.location.reload();
            }, "json");
        });
    });
})();
