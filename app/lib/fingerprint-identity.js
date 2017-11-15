var main = function() {
    var FingerprintIdentity = this;

    var Identity = require("ti.identity"),
        _keychainItem = false;
    if (OS_ANDROID) {
        var securely = require('bencoding.securely'),
            stringCrypto = securely.createStringCrypto(),
            uuid = Ti.Platform.createUUID();
    }

    FingerprintIdentity.isInitialised = false;

    FingerprintIdentity.authenticate = function(args) {
        Identity.invalidate();
        var result = Identity.authenticate(args);

        return result;
    };
    FingerprintIdentity.cancelAuthentication = function() {
        return Identity.invalidate();
    };
    FingerprintIdentity.isSupported = function() {
        if (Ti.Platform.model.indexOf('sdk') !== -1) {
            console.error("Fingerprint is not supported on Android Virtual Devices.");
            return false;
        }
        return Identity.isSupported();
    };
    FingerprintIdentity.enableLogin = function(args) {
        Ti.App.Properties.setString("touchfinger.username", args.username);

        if (OS_ANDROID) {
            var usingGUID = securely.generateDerivedKey(uuid);
            var aesEncryptedString = stringCrypto.AESEncrypt(usingGUID, args.secret);
            Ti.App.Properties.setString("touchfinger.secret", aesEncryptedString);

            return args.callback({ success: true });
        }
        if (OS_IOS) {
            _keychainItem.addEventListener("save", function _innerCallback(e) {
                _keychainItem.removeEventListener("save", _innerCallback);
                return args.callback(e);
            });
            _keychainItem.save(args.secret);
        }
    };
    FingerprintIdentity.isLoginEnabled = function() {
        return !_.isEmpty(Ti.App.Properties.getString("touchfinger.username", ""));
    };
    FingerprintIdentity.canLoginWithFingerprint = function() {
        return FingerprintIdentity.isSupported() && FingerprintIdentity.isLoginEnabled();
    };
    FingerprintIdentity.getLoginCredentials = function(args) {
        onTrigger = args.onTrigger || function() {};
        onCompletion = args.onCompletion;

        var credentials = {
            success: true,
            username: Ti.App.Properties.getString("touchfinger.username", "")
        };
        if (OS_ANDROID) {
            FingerprintIdentity.authenticate({
                callback: function(e) {
                    if (e.success) {
                        var aesEncryptedString = Ti.App.Properties.getString("touchfinger.secret");
                        var usingGUID = securely.generateDerivedKey(uuid);
                        _.extend(credentials, {
                            secret: stringCrypto.AESDecrypt(usingGUID, aesEncryptedString)
                        });

                        return onCompletion(credentials);
                    } else {
                        return onCompletion(e);
                    }
                }
            });
            onTrigger();
        }
        if (OS_IOS) {
            _keychainItem.addEventListener("read", function _innerCallback(e) {
                _keychainItem.removeEventListener("read", _innerCallback);
                if (e.success) {
                    _.delay(function() {
                        return onCompletion(_.extend(credentials, {
                            secret: e.value
                        }));
                    }, 200);
                } else {
                    return onCompletion(e);
                }
            });
            _keychainItem.read();
            onTrigger();
        }
    };
    FingerprintIdentity.resetLogin = function() {
        if (OS_IOS) {
            _keychainItem.fetchExistence(function(e) {
                if (e.exists) {
                    _keychainItem.reset();
                }
            });
        }
        Ti.App.Properties.setString("touchfinger.username", null);
        Ti.App.Properties.setString("touchfinger.secret", null);

        return true;
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

            Identity.setAuthenticationPolicy(Identity.AUTHENTICATION_POLICY_BIOMETRICS);

            _keychainItem = Identity.createKeychainItem({
                identifier: "touchfinger.secret",
                accessGroup: Ti.App.Properties.getString("touchid.team_id") + "." + Ti.App.getId(),
                accessibilityMode: Identity.ACCESSIBLE_WHEN_PASSCODE_SET_THIS_DEVICE_ONLY,
                accessControlMode: Identity.ACCESS_CONTROL_TOUCH_ID_ANY,
                options: {
                    "u_OpPrompt": "Log in with Touch ID"
                }
            });

            _keychainItem.addEventListener("save", function(e) {
                if (!e.success) {
                    console.error("::FingerprintIdentity:: Error saving into the keychain item [" + "touchfinger.secret" + "]: " + _getErrorMessage(e));
                    return;
                }
                console.info("::FingerprintIdentity:: Keychain item [" + "touchfinger.secret" + "] successfully saved.");
            });
            _keychainItem.addEventListener("read", function(e) {
                if (!e.success) {
                    console.error("::FingerprintIdentity:: Error reading the keychain item [" + "touchfinger.secret" + "]: " + _getErrorMessage(e));
                    return;
                }
                console.info("::FingerprintIdentity:: Keychain item [" + "touchfinger.secret" + "] successfully read.");
            });
            _keychainItem.addEventListener("reset", function(e) {
                if (!e.success) {
                    console.error("::FingerprintIdentity:: Error resetting the keychain item [" + "touchfinger.secret" + "]: " + _getErrorMessage(e));
                    return;
                }
                console.info("::FingerprintIdentity:: Keychain item [" + "touchfinger.secret" + "] successfully resetted.");
                Ti.App.Properties.removeProperty("touchid.username");
            });
        }

        FingerprintIdentity.isInitialised = true;

        return FingerprintIdentity;
    })();
};

module.exports = main;
