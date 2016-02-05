"use strict";

(function (root, $window, factory) {
    if (typeof($window) !== "object") {
        console.error("alert.js requires a valid window object to work with!");
        return;
    }

    // Backup native alert to _alert
    $window._alert = window.alert;

    // Override default window.alert
    $window.alert = factory(root, $window);

    if (typeof(module) === "object") {
        module.exports = $window.alert;
    }

    // If working with AMD, define the module
    else if ((typeof(define) === "function") && define.amd) {
        define(function () {
            return $window.alert;
        });
    }

}) (this, this.window, function (root, $window) {

    /*
    @private
     */

    /**
     * alert.js default options
     *
     * @access private
     */
    var options = {
        // Frame header
        displayHeader : true,

        // Close button available in header
        closeButton : true,

        // Callback (called when the dialog is closed)
        close : null,

        // Title
        title : "Alert!",

        // If true, the dialog is rendered prior to the already queued dialogs
        skipQueue: false,
		
		// jQuery draggable
		draggable: (typeof($window.jQuery) === "function") && (typeof($window.jQuery.ui) === "object") && (typeof($window.jQuery.fn.draggable) === "function"),
		
		position: {
			top: "10%",
			left: "center"
		},

        /*
         Buttons as {title : callback}
         - the callback receives the alert as parameter
         */
        buttons : {
            "Ok" : function (alert) {
                alert.close();
            }
        }
    }

    /**
     * Alert class
     *
     * @param {string|HTMLElement} body
     * @param {object} [opts]
     * @constructor
     */
    var Alert = function() {
        this.init.apply(this, arguments);
    }

    Alert.prototype.init = function (body, opts) {
        this.body = body
        this.element = null;

        // Construct local options
        this.options = {};

        var keys = Object.keys(options);
        for (var i = 0, length = keys.length; i < length; i++) {
            this.options[keys[i]] = (typeof(opts) === "object") && opts.hasOwnProperty(keys[i]) ? opts[keys[i]] : options[keys[i]];
        }
    }

    Alert.prototype.close = function () {
        if (this.element === null) return;

        // Remove from DOM
        this.element.parentElement.removeChild(this.element);
        this.element = null;

        // Fire close event
        if (typeof(this.options.close) === "function") {
            this.options.close(this);
        }
		
		// Destroy draggable
		if (this.options.draggable) {
			$window.jQuery(this.element).draggable("destroy");
		}

        // Register alert for garbage collection
        Alert.gc(this);
    }

    /**
     * Renders the alert as HTMLElement
     */
    Alert.prototype.render = function () {
        var self = this, clearEl = null;
        var alert = $window.document.createElement("div");
        alert.className = "alert-dialog";

        // Display header
        if (this.options.displayHeader) {
            var header = $window.document.createElement("div");
            header.className = "alert-header";
            alert.appendChild(header);

            var title = $window.document.createElement("span");
            title.className = "alert-title";
            title.appendChild($window.document.createTextNode(this.options.title));
            header.appendChild(title);

            if (this.options.closeButton) {
                var close = $window.document.createElement("a");
                close.className = "alert-close";
                close.innerText = "x";
                header.appendChild(close);
                close.addEventListener("click", function (e) {
                    e.preventDefault();
                    self.close();
                });
            }

            clearEl = $window.document.createElement("div");
            clearEl.style.clear = "both";

            header.appendChild(clearEl);
        };

        // Display body
        var body = $window.document.createElement("div");
        body.className = "alert-body";
        alert.appendChild(body);

        if (this.body instanceof HTMLElement) {
            body.appendChild(this.body);
        }
        else if ((typeof($window.jQuery) === "function") && (this.body instanceof $window.jQuery)) {
            $window.jQuery(body).append(this.body);
        }
        else {
            body.innerHTML = typeof(this.body) === "string" ? this.body : "";
        }

        // Display buttons
        var buttons = $window.document.createElement("ul");
        buttons.className = "alert-buttons";
        alert.appendChild(buttons);

        if ((this.options.buttons !== null) && (typeof(this.options.buttons) === "object")) {
            var keys = Object.keys(this.options.buttons),
                li, button, callback;

            for (var i = 0, length = keys.length; i < length; i++) {
                li = $window.document.createElement("li");
                buttons.appendChild(li);

                button = $window.document.createElement("a");
                button.className = "alert-button";
                button.appendChild($window.document.createTextNode(keys[i]));
                li.appendChild(button);

                callback = this.options.buttons[keys[i]];
                if (typeof(callback) === "function") {

                    // Create a scope for the listener
                    (function (callback) {
                        button.addEventListener("click", function (e) {
                            e.preventDefault();
                            callback.call(this, self);
                        })

                    }) (callback);
                }
            }
        }

        this.element = alert;
		
		// Initialize draggable
		if (	this.options.draggable && 
				(typeof($window.jQuery) === "function") && 
				(typeof($window.jQuery.ui) === "object") && 
				(typeof($window.jQuery.fn.draggable) === "function")
		) {
			$window.jQuery(this.element).draggable({
					
				containment: "parent",
				handle: ".alert-header",
				stop: function () {
					relative(self);
				}
				
			});

			// Fix position: relative set by jquery
			this.element.style.position = "absolute";
		}

        return alert;
    }

    /*
     Garbage collection helpers (so there is no waste of resources)
     */

    /**
     * @type {Array} - Garbage collection storage
     */
    var gc = [];

    /**
     * Garbage colllection handler
     *
     * @param {Alert|string|HTMLElement} arg0 - If an Alert object is passed, the handler stores it. Otherwise the arguments refer to Alert.init
     * @param {Object} [arg1]
     */
    Alert.gc = function (arg0, arg1) {
        if (arg0 instanceof Alert) {
            if (arg0.element !== null) {
				arg0.close();
				return;
			}
			
            gc.push(arg0);
            return;
        }

        var alert;
        if (gc.length > 0) {
            alert = gc.shift();
            alert.init(arg0, arg1);
        }
        else {
            alert = new Alert(arg0, arg1);
        }

        return alert;
    }

    /*
    Handler (public interface)
     */

    var
        // Stores all dialogs waiting to be rendered
        queue = [],

        // Currently rendered dialog
        dialog = null,

        // DOM alert container
        container = null,

        // Centers a dialog into the container
        position = function (alert) {
            if ((container === null) || (alert.element === null)) return;

			alert.element.style.left = (alert.options.position.left === "center") ?
											((container.offsetWidth - alert.element.offsetWidth) *.5) + "px" :
											alert.options.position.left;
											
            alert.element.style.top = (alert.options.position.top === "center") ?
											((container.offsetHeight - alert.element.offsetHeight) *.5) + "px" :
											alert.options.position.top;
			
			return alert;
        },
		
		// Sets the position of the dialog in percentage rather than pixels
		relative = function(alert) {
			if ((container === null) || (alert.element === null)) return;
			
			var left 	= (((alert.element.offsetLeft + alert.element.offsetWidth * 0.5) / container.offsetWidth) * 100),
				top		= (((alert.element.offsetTop + alert.element.offsetHeight * 0.5) / container.offsetHeight) * 100);
			
			alert.element.style.left	=  "calc(" + left + "% - " + (alert.element.offsetWidth * 0.5) + "px)";
			alert.element.style.top		=  "calc(" + top + "% - " + (alert.element.offsetHeight * 0.5) + "px)";
			
			return alert;
			
		},

        // Public interface
        alert = function (arg0, arg1) {
            /*
            alert() - Forces next dialog in queue to be rendered
             */
            if (arguments.length === 0) {
                if (container === null) return;

                if (dialog !== null) {
                    dialog.close();
                    dialog = null;
                    container.style.display = "none";
                }

                if (queue.length > 0) {
                    dialog = queue.shift();

                    // Proxy the close callback
                    var close = dialog.options.close;
                    dialog.options.close = function () {
                        if (typeof(close) === "function") {
                            close.apply(this, arguments);
                        }

                        alert();
                    };

                    container.style.display = "block";
                    container.appendChild(dialog.render());

                    relative(position(dialog));
                }

                return;
            }

            /*
            alert(body, options)  - Queues a new Alert dialog
             */
            if (    (arg0 instanceof HTMLElement) ||
                    (typeof($window.jQuery) === "function") && (arg0 instanceof $window.jQuery) ||
                    (typeof(arg0) === "string")
            ) {
				
				// Convert newlines to break lines
				if (typeof(arg0) === "string") {
					arg0 = arg0.replace("\n", "<br/>");
				}

                if((typeof(arg1) === "object") && (arg1.skipQueue)) {
                    queue.unshift(Alert.gc(arg0, arg1));
                }
                else {
                    queue.push(Alert.gc(arg0, arg1));
                }

                if ((container !== null) && (dialog === null)) {
                    // Render next if no dialog is rendered
                    alert();
                }

                return;
            }

            /*
            alert(options)  - Override default module options (see @private options)
             */
            if (typeof(arg0) === "object") {
                var keys = Object.keys(options);

                for (var i = 0, length = keys.length; i < length; i++) {
                    if (arg0.hasOwnProperty(keys[i])) {
                        options[keys[i]] = arg0[keys[i]];
                    }
                }
            }
        };

    /*
    Subscribe to document.ready
     */
    $window.document.addEventListener("DOMContentLoaded", function(e) {
        container = $window.document.createElement("div");
        container.className = "alert-container";
        container.style.display = "none";

        $window.document.body.appendChild(container);

        alert();

        /*
         Subscribe to document.resize
         */
        /*$window.onresize = $window.document.body.onresize = function (e) {
            if (dialog !== null) center(dialog);
        };*/
    });

    /*
     @public
     */
    return alert;
});