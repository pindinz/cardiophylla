'use strict';

function showModal(options) {

    if (options.modalContentUrl) {

        $('#modal-content').load(options.modalContentUrl, function () {
            $('#modal').modal(options);
        });

    }
    else {
        console.error('Invalid URL passed to showModal.');
    }

}

function hideModal() {
    $('#modal').modal('hide');
}