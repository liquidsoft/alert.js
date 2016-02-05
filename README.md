# alert.js

> Customizable plug and play replacement for window.alert

## Dependencies
This plugin requires no dependencies by default. If you plan to use the *draggable* feature then you must include [jQuery](https://jquery.com/download/) and [jquery.ui.draggable](https://jqueryui.com/).

## Installation
Installation via npm:
```shell
npm install alert.js
```

Installation via bower:
```shell
bower install alert-js
```

Manual installation: download the contents of the *dist* folder.

## Getting started
Include the *alert.css* and *alert.js* or *alert.min.js* in your head.

```html
<head>
    <!-- jQuery is only necessary if you want to use the draggable feature -->
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/2.2.0/jquery.min.js"></script>
    <script src="https://ajax.googleapis.com/ajax/libs/jqueryui/1.11.4/jquery-ui.min.js"></script>
    <link rel="stylesheet" href="https://ajax.googleapis.com/ajax/libs/jqueryui/1.11.4/themes/smoothness/jquery-ui.css">
    <!-- alert.js -->
    <script src="/alert.js/dist/alert.min.js"></script>
    <link rel="stylesheet" href="/alert.js/dist/alert.css" />
</head>
```

You can style the appearance of the dialogs by editing the *alert.css* file.

## Usage
Once you are through the first two steps the plugin already replaces the default *window.alert* function.

```js
// Simple (default usage)
alert("This is an alert!");

// Using with HTMLElement
var body = document.createElement("div");
body.innerHtml("This is a <b>html</b> body!");
alert(body);

// Using with jQuery
var body = $("<div>").html("This is a <b>jQuery</b> body");
alert(body);
```

The alert dialogs are queued, similar to the native behavior. In order to force the closing of the current alert dialog and render the next in queue, you may use *alert()* with no parameters.
```js
alert("First dialog!");

// This will be shown after the first one is closed
alert("Second dialog!");
```

You may access the native alert using the function *_alert*
```js
_alert("Alert with the native behavior!");
```

### Options
The plugin uses a set of default options which are assigned to each particular alert dialog. You can override the default options globally or individually.

```js
// Override default options globally
alert({ title: "My custom alert title", draggable: false });

// Override options individually
alert("Alert body", { title: "This is a custom alert" });
```

The following options are available:

####displayHeader
Type: `Boolean`
Default: `true`

Show dialog header (includes title and close button).

####closeButton
Type: `Boolean`
Default: `true`

Show close button (requires *displayHeader*)

####close
Type: `Function`
Default: `null`

A function called when the alert dialog is closed.

####title
Type: `String`
Default: `Alert!`

Alert dialog title.

####skipQueue
Type: `Boolean`
Default: `false`

If true, the dialog is rendered before other queued dialogs.

####draggable
Type: `Boolean`
Default: `true` (if jQuery UI Draggable is available)

Makes the alert dialog draggable.

####position
Type: `Object`

**top**: a *css value* or `center` (defaults: `10%`)
**left**: a *css value* or `center` (defaults: `center`)

Sets the initial position of the dialog.

```js
alert("Hello world!", {
    position: {
        top: "center",
        left: "25px"
    }
});
```

####buttons
Type: `Object`

Default:
```js
alert("Hello world!", {
    buttons: {
        "Ok" : function (dialog) {
            dialog.close();
        }
    }
});
```

The buttons shall be defined as key : value pairs, where the key is used as the label and the value as the callback.

###Methods

####close
When defining the buttons, you receive the *dialog* as the first parameter. You may use this reference to close the dialog.

```js
alert("Hello world!", {
    buttons: {
        "Ok" : function (dialog) {
            // do something here
            dialog.close();
        }
    }
});
```