$(function() {
    let tmpl = null;
    let data = {};

    let initPage = function() {
        $.get('/templates/album-list.tmpl.html', (receivedTmpl) => {
            tmpl = receivedTmpl;
        });

        $.getJSON('/api/album', (receivedData) => {
            $.extend(data, receivedData);
        });

        $(document).ajaxStop(() => {
            let renderedPage = Mustache.to_html(tmpl, data);
            $('.content').html(renderedPage);
        });
    }();
});
