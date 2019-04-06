class HomeView {

    tmpl = null;
    albums = null;

    constructor() {
        $.get('/templates/album-list.tmpl.html', (receivedTmpl) => {
            this.tmpl = receivedTmpl;
            this.refresh();
        });
    }

    refresh() {
        $.getJSON('/api/album', (receivedData) => {
            this.albums = receivedData;
            this.render();
        });
    }

    render() {
        const renderedPage = Mustache.to_html(this.tmpl, { albums: this.albums});
        $('.content').html(renderedPage);

        $('.modal').modal();
        $('a#show-album-create').click(() => {
            $('#create-album-modal').modal("open");
        });
        $('a#home-login').click(function () {
            window.location.replace('/login');
        });

        $('a#create-album').click(function () {
            const form = $('#create-album-form');
            $.ajax({
                url: `/api/album/`,
                type: 'post',
                dataType: 'json',
                data: form.serialize(),
                success: function (data) {
                    homeView.refresh();
                },
                error: function(jqXHR, status, data) {
                    M.toast({html: `<p>Unable to create album: ${data}</p>`});
                }
            });
        });
    }
}

const homeView = new HomeView();