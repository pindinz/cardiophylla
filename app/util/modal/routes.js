(function () {
    'use strict';


    function init(app) {

        app.get('/js/modal.js', function (req, res) {
            const options = {
                root: __dirname
            };
            res.status(200).sendFile('./modal.js', options);
        });

    }

    module.exports = {init: init};

})();