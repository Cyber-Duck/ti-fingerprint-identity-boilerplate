// The contents of this file will be executed before any of
// your view controllers are ever executed, including the index.
// You have access to all functionality on the `Alloy` namespace.
//
// This is a great place to do any initialization for your app
// or create any global variables/functions that you'd like to
// make available throughout your app. You can easily make things
// accessible globally by attaching them to the `Alloy.Globals`
// object. For example:
//
// Alloy.Globals.someGlobalFunction = function(){};

// Init the library
var TouchFinger = require("touchfinger");
Alloy.Globals.touchfinger = new TouchFinger();
// Extra functionality to the library when used for login
Alloy.Globals.canLoginWithFingerprint = function() {
    return Alloy.Globals.touchfinger.isSupported() && Alloy.Globals.touchfinger.isLoginEnabled();
};
