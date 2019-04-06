class LoginView {

    tmpl = null;

    constructor() {
        $.get('/templates/login.tmpl.html', (receivedTmpl) => {
            this.tmpl = receivedTmpl;
            this.refresh();
        });
    }

    refresh() {
        this.render();
    }

    render() {
        $('.content').html(this.tmpl);
        $('a#login-submit').click(function () {
            const form = $('#login-form');
            $.ajax({
                url: '/api/user/login',
                type: 'post',
                dataType: 'json',
                data: form.serialize(),
                processData: false,
                success: function(data) {
                    window.location.replace('/');
                },
                error: function(jqXHR, status, data) {
                    M.toast({html: `<p>Unable to login: ${data}</p>`});
                }
            });
        });
        $('a#login-register').click(function () {
            window.location.replace('/register');
        });
    }
}

const loginView = new LoginView();
