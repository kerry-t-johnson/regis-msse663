class AlbumView {

    name = null;
    tmpl = null;
    album = null;

    constructor() {
        const pathParts = window.location.href.split('/');
        this.name = pathParts[4];

        $.get('/templates/album.tmpl.html', (receivedTmpl) => {
            this.tmpl = receivedTmpl;

            this.refresh();
        });

        $.get('/templates/album-undo-delete.tmpl.html', (receivedTmpl) => {
            this.undoTmpl = receivedTmpl;
        });
    }


    refresh() {
        $.getJSON('/api/album/' + this.name, (receivedData) => {
            this.album = receivedData;

            console.log(this.album);

            this.render();
        });
    }

    render() {
        const renderedPage = Mustache.to_html(this.tmpl, this.album);
        $('.content').html(renderedPage);
        $('.modal').modal();

        $('a#show-image-upload').click(() => {
            $('#upload-image-modal').modal("open");
        });
        $('a#submit-image').click( function() {
            const album = $(this).data('album');
            const form = new FormData($('#image-upload-form')[0]);
            $.ajax({
                url: `/api/album/${album}`,
                type: 'post',
                dataType: 'json',
                data: form,
                enctype: 'multipart/form-data',
                processData: false,
                contentType: false,
                success: function(data) {
                    albumView.refresh();
                },
                error: function(jqXHR, status, data) {
                    M.toast({html: `<p>Unable to add image: ${data}</p>`});
                }
            });
        });

        $('a.confirm-delete-image').click(this.confirmDeleteImage);
        $('a.delete-image').click(this.deleteImage);
    }

    confirmDeleteImage() {
        const image = $(this).data('image');
        $($(".modal[data-image='" + image + "']")).modal("open");
    }

    deleteImage() {
        const album = $(this).data('album');
        const image = $(this).data('image');
        const undo =  Mustache.to_html(albumView.undoTmpl, { album_name: album, image_name: image});
        console.log(undo);

        console.log(`DELETE /api/album/${album}/${image}`);
        $.ajax({
            url: `/api/album/${album}/${image}`,
            type: 'delete',
            dataType: 'json',
            success: function(data) {
                M.toast({html: undo});
                albumView.refresh();
            },
            error: function(jqXHR, status, data) {
                M.toast({html: `<p>Unable to delete image: ${data}</p>`});
            }
        });
    }

    static undeleteImage(album_name, image_name) {
        console.log(this);
        const album = album_name || $(this).data('album');
        const image = image_name || $(this).data('image');
        console.log(`PUT /api/album/${album}/undelete/${image}`);
        $.ajax({
            url: `/api/album/${album}/undelete/${image}`,
            type: 'put',
            // data: JSON.stringify({ image: image }),
            dataType: 'json',
            success: function(data) {
                albumView.refresh();
            }
        });
    }

}

albumView = new AlbumView();
