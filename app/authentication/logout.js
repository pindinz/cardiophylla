'use strict';

function logout() {

    $.get({
        url: '/logout'
    }).done(function (data, status, req) {
        if (req.status === 204) {
            window.location.reload();
        }
    });
}