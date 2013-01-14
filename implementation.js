/*jslint browser: true, plusplus: true, indent: 4, maxlen: 80 */
/**
 * @preserve Voyeur
 * github.com/btomaj/voyeur
 *
 * All rights reserved.
 */
/**
 * TODO document libraries and their use
 * Startup process:
 * 1. If page is internal, fire 'internal' event and continue,
 * 2. If 'dev' or 'rc' mode is active, fire 'development' event and exit,
 * 3. Else, If site is excluded, exit,
 * 4. Else, If site name and domain are known,
 *  4.1 If no development keywords are found in the URL, fire 'production' event
 *      and exit,
 *  4.2 If development keywords are found in the URL, fire 'development' event
 *      and exit,
 * 5. Else, unknown site and/or domain, do nothing and exit.
 *
 * @module Analytics
 * @submodule Implementation
 */
var A = A || {};

/**
 * TODO document better
 *
 * internal // domains that definitively identify browser as internal (e.g. intranet) useful to avoid retargeting internals
 * exclude // domains that are not supported
 * dev // development keywords in URL, e.g. 'staging', 'test', etc.
 * @property config
 * @type Object
 */
A.config = {
    internal: [],
    exclude: [],
    site: [],
    domain: [],
    dev: []
};

/**
 * Adobe Site Catalyst
 */
A.sc = A.sc || {};

/**
 * Google Analytics
 */
A.ga = A.ga || {};

/**
 * Kiss Metrics
 */
A.km = A.km || {};

/**
 * @preserve Marathon
 * github.com/btomaj/marathon
 *
 * A standalone implementation of jQuery.ready(). The below copyright notice
 * applies to the adaptation of the jQuery.ready() implementation only.
 *
 * Copyright 2012 jQuery Foundation and other contributors
 * http://jquery.com/
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
/**
 * Guarantees that the supplied callback is run but only run when the document
 * has loaded.
 *
 * All functions are run in the order that they are passed to Marathon.
 *
 * @method run
 * @for A
 *
 * @param callback {Function} The function that must only be called after the
 *      the document has loaded.
 *
 * @static
 */
A.run = (function () {
    'use strict';

    // Dependencies
    var

    // Private properties
        backlog = [],
        documentElement, // used for IE

    // Private methods
        run = function run(callback) {

            if (!backlog) {
                callback();
            } else {
                backlog.push(callback);
            }

        },

        runBacklog = function runBacklog() {

            if (!backlog) {
                return;
            }

            if (!document.body) { // confirm loading is complete
                return setTimeout(runBacklog, 1);
            }

            var callback = backlog,
                i,
                j;

            backlog = undefined;

            for (i = 0, j = callback.length; i < j; i += 1) {
                callback[i]();
            }

        },

        DOMContentLoaded = function DOMContentLoaded() {

            if (document.addEventListener) {
                document.removeEventListener('DOMContentLoaded',
                    DOMContentLoaded, false);
                runBacklog();
            } else if (document.readyState === 'complete') { // IE
                document.detachEvent('onreadystatechange', DOMContentLoaded);
                runBacklog();
            }

        };
    // End var

    // Initialisation proceedures
    if (document.readyState === 'complete') { // ready event already fired

        runBacklog();

    } else if (document.addEventListener) { // standards compliant browsers

        document.addEventListener('DOMContentLoaded', DOMContentLoaded, false);
        window.addEventListener('load', runBacklog, false); // fallback

    } else { // fallback to event model

        document.attachEvent('onreadystatechange', DOMContentLoaded);
        window.attachEvent('onload', runBacklog); // fallback

        // main test for IE when not a frame
        // trick by Diego Perini http://javascript.nwbox.com/IEContentLoaded/
        documentElement = false;

        try {
            documentElement = window.frameElement === null &&
                document.documentElement;
        } catch (e) {}

        if (documentElement && documentElement.doScroll) {

            (function checkScroll() {

                if (!backlog) {
                    return;
                }

                try {
                    documentElement.doScroll('left');
                } catch (e) {
                    return setTimeout(checkScroll, 49);
                }

                runBacklog();

            }());

        }

    }

    // Public API
    return run;

}());

/**
 * @preserve Big Brother
 * github.com/btomaj/big-brother
 *
 * All rights reserved.
 */
/**
 * A simple JavaScript observer
 *
 * @class observer
 * @for A
 *
 * @static
 */
A.observer = (function () {
    'use strict';

    // Dependencies
    var

    // Private properties
        registered = {},

    // Private methods
        /**
         * Registers a new event handler for the specified event type.
         *
         * @method on
         *
         * @param {String} eventType
         * @param {Function} eventHandler
         *
         * @static
         */
        on = function on(eventType, eventHandler) {
            if (!registered[eventType]) {
                registered[eventType] = [];
            }

            registered[eventType].push(eventHandler);
        },

        /**
         * Triggers the specified event type and passes the supplied custom
         * event object to any registered event handlers.
         *
         * @method trigger
         *
         * @param {String} eventType
         * @param {Object} eventObject
         *
         * @static
         */
        /**
         * An alias to the trigger method. For consistency, consult the
         * documentation for trigger method.
         *
         * @method fire
         *
         * @param {String} eventType
         * @param {Object} eventObject
         *
         * @static
         *
         * @for A
         */
        trigger = function trigger(eventType, eventObject) {
            var eventHandler = registered[eventType] || [],
                i = eventHandler.length;

            while (i--) {
                eventHandler[i](eventObject);
            }
        };

    // End var

    // Initialisation proceedures

    // Public API
    return {
        on: on,
        trigger: trigger,
        fire: trigger
    };

}());

/**
 * Inserts a beacon after the page has finished loading.
 *
 * interface Beacon {
 *      type {String} The beacon type. Currently only 'img' is supported.
 *      src {String} The location of the beacon.
 * }
 *
 * @method beacon
 * @for A
 *
 * @param insert {Object} Implements interface Beacon (see method
 *      documentation).
 */
A.beacon = function beacon(insert) {
    'use strict';

    var tag,
        hook;

    switch (insert.type) {
    case 'img':
        tag = document.createElement('img');
        tag.src = insert.src;
        tag.width = 1;
        tag.height = 1;
        tag.style.position = 'absolute';
        break;
    default:
    }

    if (tag) {
        A.run(function () {
            hook = document.getElementsByTagName('script')[0];
            hook.parentNode.insertBefore(tag, hook);
        });
    }
};

/**
 * Rewrite A.site and A.page here if neccessary
 *
 * Document all rewrite rules and the reasons for their existence in this
 * commenting block.
 */
(function () {
    'use strict';

}());

// ---- everything below this line should be the last thing in this file ---- //
A.run(function () { // the shot caller (what a baller)
    'use strict';

    var config = A.config,

        internal = config.internal,
        exclude = config.exclude,
        site = config.site,
        domain = config.domain,
        dev = config.dev,

        query,
        i,

        mode;

    query = document.domain;
    i = internal.length;
    while (i--) {
        if (query.indexOf(internal[i]) + 1) {
            A.observer.fire('internal');
        }
    }

    query = document.cookie.split('; ');
    i = query.length;
    while (i--) {
        if (query[i].indexOf('A-mode=') + 1) {
            mode = query[i].replace('A-mode=', '');
            break;
        }
    }
    if (mode === 'dev' || mode === 'rc') {
        A.observer.fire('development');
        return;
    }

    query = document.domain;
    i = exclude.length;
    while (i--) {
        if (query.indexOf(exclude[i]) + 1) {
            return;
        }
    }

    // query = document.domain;
    i = dev.length;
    while (i--) {
        if (query.indexOf(dev[i]) + 1) {
            dev = true;
            break;
        }
    }
    //query = document.domain;
    i = domain.length;
    while (i--) {
        if (query.indexOf(domain[i]) + 1) {
            domain = true;
            break;
        }
    }
    query = A.site;
    i = site.length;
    while (i--) {
        if (site[i] === query) {
            site = true;
            break;
        }
    }

    query = A.record;
    if (query) {
        i = query.length;

        while (i--) {
            if (typeof query[i] === 'function') {
                query[i]();
            }
        }

        delete A.record;
    }

    if (site === true && domain === true) {
        if (dev !== true) {
            A.observer.fire('production');
        } else {
            A.observer.fire('development');
        }
    }

});
