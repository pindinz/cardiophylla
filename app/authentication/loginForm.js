'use strict';


function postLogin(event) {

    $('#login-failed-alert').hide();
    $.post({
        url: '/login',
        data: $('#login-form').serialize(),
        dataType: 'text/plain'
    })
        .done(function (data, status, req) {
            if (req.status === 204) {
                hideModal();
                $('#login-form')[0].reset();
                window.location.reload();
            }
        })
        .fail(function (xhr, status, errorThrown) {
            $('#login-failed-alert').show();
            console.error(errorThrown); // TODO show error in modal
        });

    event.preventDefault();
}