class RegisterView {

    tmpl = null;

    constructor() {
        $.get('/templates/register.tmpl.html', (receivedTmpl) => {
            this.tmpl = receivedTmpl;
            this.refresh();
        });
    }

    refresh() {
        this.render();
    }

    render() {
        $('.content').html(this.tmpl);
        $('a#register-submit').click(function () {
            const form = $('#register-form');
            $.ajax({
                url: '/api/user/register',
                type: 'post',
                dataType: 'json',
                data: form.serialize(),
                processData: false,
                success: function(data) {
                    window.location.replace('/login');
                },
                error: function(jqXHR, status, data) {
                    M.toast({html: `<p>Unable to register: ${data}</p>`});
                }
            });
        });
    }
}

const registerView = new RegisterView();
