/**
 * jQuery Messages UI 0.2.1
 *
 * Copyright (c) 2011, Jonny Gerig Meyer
 * All rights reserved.
 *
 * Licensed under the New BSD License
 * See: http://www.opensource.org/licenses/bsd-license.php
 */

/*jslint    browser:    true,
            indent:     4,
            confusion:  true */
/*global    jQuery, ich, Handlebars */

(function ($) {

    'use strict';

    var methods = {
        init: function (opts) {
            var messageList = $(this);
            var options = $.extend({}, $.fn.messages.defaults, messageList.data('messages-ui-opts'), opts);
            messageList.data('messages-ui-opts', options);
            if (options.closeLink) {
                messageList.on('click', options.message + ' ' + options.closeLink, function (e) {
                    e.preventDefault();
                    var thisMessage = $(this).closest(options.message);
                    methods['remove'](thisMessage);
                });
            }
            if (options.handleAjax) {
                $.ajaxSetup({
                    dataType: 'json',
                    dataFilter: function (data, type) {
                        if (data && type === 'json') {
                            var json;
                            try {
                                json = $.parseJSON(data);
                            } catch (e) {
                                json = false;
                            }
                            if (json && json.messages) {
                                var messages = $(json.messages);
                                messages.each(function () {
                                    methods['add'](this, opts, messageList);
                                });
                            }
                        }
                        return data;
                    }
                });
            }
            methods.bindHandlers(messageList);
        },

        add: function (msg_data, opts, messageList) {
            var msgList = messageList || $(this);
            var options = $.extend({}, $.fn.messages.defaults, msgList.data('messages-ui-opts'), opts);
            var msg;
            msg_data.escapeHTML = options.escapeHTML;
            if (options.templating === 'handlebars') {
                msg = Handlebars.templates['message.html'](msg_data);
            } else if (options.templating === 'ich') {
                msg = ich.message(msg_data);
            }
            $(msg).appendTo(msgList);
            methods.bindHandlers(msgList);
        },

        remove: function (msg) {
            msg.stop().fadeOut('fast', function () {
                msg.detach();
            });
        },

        bindHandlers: function (messageList) {
            var options = $.extend({}, $.fn.messages.defaults, messageList.data('messages-ui-opts'));
            var messages = messageList.find(options.message);
            var transientMessages = messages.filter(options.transientMessage);
            if (transientMessages.length) {
                transientMessages.each(function () {
                    var msg = $(this);
                    $(document).bind('mousedown keydown', function (event) {
                        $.doTimeout(options.transientDelay, function () {
                            msg.fadeOut(options.transientFadeSpeed, function () {
                                msg.detach();
                            });
                            $(this).unbind(event);
                        });
                    });
                });
            }
        }
    };

    $.fn.messages = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.messages');
        }
    };

    /* Setup plugin defaults */
    $.fn.messages.defaults = {
        message: '.message',            // Selector for individual messages
        transientMessage: '.success',   // Selector for messages that will disappear on mousedown, keydown
        closeLink: '.close',            // Selector for link that closes message (set to ``false`` to disable close-link handlers)
        transientDelay: 500,            // Delay before mousedown or keydown events trigger transient message fade (ms)
        transientFadeSpeed: 3000,       // Fade speed for transient messages (ms)
        handleAjax: false,              // Enable automatic handling of messages in "messages" key of JSON AJAX response
        templating: 'handlebars',       // Set to ``ich`` to use ICanHaz.js instead of Handlebars.js for templating
                                        //      ...only used if ``handleAjax: true``
        escapeHTML: true                // Set to ``false`` to not HTML-escape message content (allowing for in-line HTML in message)
    };
}(jQuery));
