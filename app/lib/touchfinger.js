var main = function() {
    var TouchFinger = this;

    var Identity = require("ti.identity");
    var _keychainItem = false;
    var _itemId = "touchfinger_token_access";

    TouchFinger.isInitialised = false;

    TouchFinger.authenticate = function(args) {
        Identity.invalidate();
        var result = Identity.authenticate(args);

        return result;
    };
    TouchFinger.cancelAuthentication = function() {
        Identity.invalidate();
    };
    TouchFinger.isSupported = function() {
        if (Ti.Platform.model === 'Simulator' || Ti.Platform.model.indexOf('sdk') !== -1) {
            console.error("Touch ID / Fingerprint not supported on Virtual Devices.");
            return false;
        }
        return Identity.isSupported();
    };
    TouchFinger.getKeychainItem = function() {
        return _keychainItem;
    };
    TouchFinger.enableLogin = function(username) {
        Ti.App.Properties.setString("touchfinger.username", username);
    };
    TouchFinger.isLoginEnabled = function() {
        return !_.isEmpty(Ti.App.Properties.getString("touchfinger.username", ""));
    };

    var _getErrorMessage = function(error) {
        switch (error.code) {
            case Identity.ERROR_APP_CANCELLED:
                return "ERROR_APP_CANCELLED (Code: " + error.code + ")";
            case Identity.ERROR_AUTHENTICATION_FAILED:
                return "ERROR_AUTHENTICATION_FAILED (Code: " + error.code + ")";
            case Identity.ERROR_BIOMETRY_LOCKOUT:
                return "ERROR_BIOMETRY_LOCKOUT (Code: " + error.code + ")";
            case Identity.ERROR_BIOMETRY_NOT_AVAILABLE:
                return "ERROR_BIOMETRY_NOT_AVAILABLE (Code: " + error.code + ")";
            case Identity.ERROR_BIOMETRY_NOT_ENROLLED:
                return "ERROR_BIOMETRY_NOT_ENROLLED (Code: " + error.code + ")";
            case Identity.ERROR_INVALID_CONTEXT:
                return "ERROR_INVALID_CONTEXT (Code: " + error.code + ")";
            case Identity.ERROR_PASSCODE_NOT_SET:
                return "ERROR_PASSCODE_NOT_SET (Code: " + error.code + ")";
            case Identity.ERROR_SYSTEM_CANCEL:
                return "ERROR_SYSTEM_CANCEL (Code: " + error.code + ")";
            case Identity.ERROR_TOUCH_ID_LOCKOUT:
                return "ERROR_TOUCH_ID_LOCKOUT (Code: " + error.code + ")";
            case Identity.ERROR_TOUCH_ID_NOT_AVAILABLE:
                return "ERROR_TOUCH_ID_NOT_AVAILABLE (Code: " + error.code + ")";
            case Identity.ERROR_TOUCH_ID_NOT_ENROLLED:
                return "ERROR_TOUCH_ID_NOT_ENROLLED (Code: " + error.code + ")";
            case -128:
            case Identity.ERROR_USER_CANCEL:
                return "ERROR_USER_CANCEL (Code: " + error.code + ")";
            case Identity.ERROR_USER_FALLBACK:
                return "ERROR_USER_FALLBACK (Code: " + error.code + ")";
            default:
                return "UNKNOWN (Code: " + error.code + ")";
        }
    };

    return (function() {
        if (OS_IOS) {
            if (!Ti.App.Properties.hasProperty("touchid.team_id")) {
                throw new Error("<property name=\"touchid.team_id\" type=\"string\"></property> is missing from your tiapp.xml file.");
            }

            _keychainItem = Identity.createKeychainItem({
                identifier: _itemId,
                accessGroup: Ti.App.Properties.getString("touchid.team_id") + "." + Ti.App.getId(),
                accessibilityMode: Identity.ACCESSIBLE_WHEN_PASSCODE_SET_THIS_DEVICE_ONLY,
                accessControlMode: Identity.ACCESS_CONTROL_TOUCH_ID_ANY,
                options: {
                    "u_OpPrompt": "Log in with Touch ID"
                }
            });

            _keychainItem.addEventListener("save", function(e) {
                if (!e.success) {
                    console.error("::TouchFinger:: Error saving into the keychain item [" + _itemId + "]: " + _getErrorMessage(e));
                    return;
                }
                console.info("::TouchFinger:: Keychain item [" + _itemId + "] successfully saved.");
            });
            _keychainItem.addEventListener("read", function(e) {
                if (!e.success) {
                    console.error("::TouchFinger:: Error reading the keychain item [" + _itemId + "]: " + _getErrorMessage(e));
                    return;
                }
                console.info("::TouchFinger:: Keychain item [" + _itemId + "] successfully read.");
            });
            _keychainItem.addEventListener("reset", function(e) {
                if (!e.success) {
                    console.error("::TouchFinger:: Error resetting the keychain item [" + _itemId + "]: " + _getErrorMessage(e));
                    return;
                }
                console.info("::TouchFinger:: Keychain item [" + _itemId + "] successfully resetted.");
                Ti.App.Properties.removeProperty("touchid.username");
            });
        }

        TouchFinger.isInitialised = true;

        return TouchFinger;
    })();
};

module.exports = main;
