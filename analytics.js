/*jslint browser: true, plusplus: true */
/*global console */
/**
 * @preserve Voyeur
 * github.com/btomaj/voyeur
 *
 * All rights reserved.
 */
/**
 * The purpose of this code structure is to have a centralised recording logic
 * controlled by the technically competent analytics team. The benefits are that
 * the business logic (and the subsequent recording logic) isn't baked into the
 * page and doesn't require IT change requests for updates; keeping analytics
 * agile.
 *
 * Include this file by inserting this snippet at the top of the <head />
 * element of the document:
 *
 * <script type="text/javascript">
 * var A = A || {};
 * A.site = A.site || '<name>'; // site/platform identifier
 * A.page = A.page || '<page>'; // page name when not using URL structure
 *
 * A.record = A.record || [];
 * A.record.push(function () { // called right before production or development
 *     // ...opportunity to pass information to implementation using A.observer
 * });
 *
 * (function () {
 *     'use strict';
 *
 *     var timeStamp = new Date(),
 *         cacheBuster = timeStamp.getUTCFullYear().toString() +
 *             (timeStamp.getUTCMonth() + 1) +
 *             timeStamp.getUTCDate() + 'T' +
 *             timeStamp.getUTCHours() +
 *             Math.ceil(timeStamp.getUTCMinutes() / 15) * 15,
 *
 *         hook = document.getElementsByTagName('script')[0],
 *         script = document.createElement('script');
 *
 *     script.src = '//remotehost/analytics.js?cb=' + cacheBuster;
 *     script.type = 'text/javascript';
 *     script.async = true;
 *
 *     hook.parentNode.insertBefore(script, hook);
 * }());
 * </script>
 *
 * Appending analytics=<mode> to the query string allows you to dynamically
 * select the source from which to load the implementation file to assist in
 * debugging and development. The available <mode> options are:
 *  - rc: loads the development file from the server.
 *  - dev: loads the development file from localhost.
 *  - restore: restores mode and loads the production file from the server.
 * It is expected that the development file is named dev.js. The name of the
 * production file needs to be defined in the analytics.js file. It is
 * recommended that a naming convention using the release date is used to
 * distinguish between releases (e.g. 20121212.js).
 *
 * The selected mode is preserved across page views by setting a session cookie.
 * NB: This cookie is also used in the implementation file, if the cookie name
 * is changed the change needs to be reflected in the implementation file.
 *
 * This library uses console.log() for debugging purposes. To avoid throwing
 * errors in browsers where console.log() isn't supported the function is
 * stubbed if it doesn't exist.
 *
 * To start using this library, first set the name of the implementation file
 * and its location on the internet by changing A.file and replacing
 * '//remotehost/' with the correct URL below.
 *
 * GLHF!
 *
 * @module Analytics
 * @main Analytics
 */
/**
 * @class A
 *
 * @static
 */
var A = A || {};

/**
 * @property file
 * @type String
 */
A.file = '<date>.js';

(function () {
    'use strict';

    var host = '//remotehost/',
        file = A.file,

        query = window.location.search.substr(1).split('&'),
        i = query.length,

        mode;

    if (!window.console) {
        window.console = {
            log: function () {}
        };
    }

    while (i--) {
        if (query[i].indexOf('analytics=') + 1) {
            mode = query[i].replace('analytics=', '');

            document.cookie = 'A-mode=' + mode + ';'; // preserve mode for subsequent pageviews; do not alter cookie name without ammending implementation.js
            break;
        }
    }

    if (!mode) {
        query = document.cookie.split('; ');
        i = query.length;

        while (i--) {
            if (query[i].indexOf('A-mode=') + 1) {
                mode = query[i].replace('A-mode=', '');
                break;
            }
        }
    }

    switch (mode) {
    case 'dev':
        host = 'http://localhost/';
        file = 'dev.js?cb=' + Math.floor(1000000 * Math.random());

        console.log('Development mode: Development file loaded from localhost');
        break;

    case 'rc':
        file = 'dev.js?cb=' + Math.floor(1000000 * Math.random());

        console.log('Release Candidate mode: Development file loaded from server');
        break;

    case 'restore':
        document.cookie = 'A-mode=' + mode + '; Expires=' +
            (new Date(0)).toGMTString() + ';';

        console.log('Restore mode: Production file loaded from server');
        break;

    default:
    }

    mode = document.createElement('script');
    mode.src = host + file;
    mode.type = 'text/javascript';
    mode.async = true;

    query = document.getElementsByTagName('script')[0];
    query.parentNode.insertBefore(mode, query);

}());
