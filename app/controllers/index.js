function refreshUI() {
    _.delay(function(){
        if (Alloy.Globals.fingerprintIdentity.isLoginEnabled()) {
            $.setupSection.hide();
        } else {
            $.setupSection.show();
        }
        if (Alloy.Globals.fingerprintIdentity.canLoginWithFingerprint()) {
            $.loginFingerBtn.show();
        } else {
            $.loginFingerBtn.hide();
        }
    }, 50);
}

 function basicPrompt() {
    if (!Alloy.Globals.fingerprintIdentity.isSupported()) {
        alert("Touch ID / Fingerprint is not supported on this device!");
        return;
    }

    Alloy.Globals.fingerprintIdentity.authenticate({
        reason: "A reason to ask for Touch ID.",
        fallbackTitle: "", // disable Enter Password fallback when Touch ID fails
        callback: function(e) {
            if (e.success) {
                if (OS_ANDROID) {
                    $.fingerprintDialog.success();
                } else {
                    alert("Success!");
                }
            } else {
                if (OS_ANDROID) {
                    $.fingerprintDialog.failure();
                } else {
                    alert("Error: " + e.error);
                }
            }
            Alloy.Globals.fingerprintIdentity.cancelAuthentication();
            refreshUI();
        }
    });

    if (OS_ANDROID) {
        $.fingerprintDialog.show(function() {
            Alloy.Globals.fingerprintIdentity.cancelAuthentication();
        }, function() {
            Alloy.Globals.fingerprintIdentity.cancelAuthentication();
        });
    }
 }

function setupLogin() {
    return $.passwordPromt.show();
}

function savePassword(e) {
    var plainPassword = OS_IOS ? e.text : $.password.getValue();

    Alloy.Globals.fingerprintIdentity.authenticate({
        reason: "Confirm your fingerprint now.",
        fallbackTitle: "", // disable Enter Password fallback when Touch ID fails
        callback: function(e) {
            if (e.success) {
                Alloy.Globals.fingerprintIdentity.enableLogin({
                    username: "foobar",
                    secret: plainPassword,
                    callback: function(e) {
                        if (e.success) {
                            if (OS_ANDROID) {
                                $.fingerprintDialog.success();
                            } else {
                                alert("Success!");
                            }
                        } else {
                            if (OS_ANDROID) {
                                $.fingerprintDialog.failure();
                            } else {
                                alert("Error: " + e.error);
                            }
                        }
                        refreshUI();
                    }
                });
            } else {
                Alloy.Globals.fingerprintIdentity.cancelAuthentication();
            }
        }
    });
    if (OS_ANDROID) {
        $.fingerprintDialog.show(function() {
            Alloy.Globals.fingerprintIdentity.cancelAuthentication();
        }, function() {
            Alloy.Globals.fingerprintIdentity.cancelAuthentication();
        });
    }
}

function loginWithFingerprint() {
    if (!Alloy.Globals.fingerprintIdentity.canLoginWithFingerprint()) {
        return alert("Login using Touch ID is not accessible at the moment.");
    }

    Alloy.Globals.fingerprintIdentity.getLoginCredentials({
        onTrigger: function(e) {
            if (OS_ANDROID) {
                $.fingerprintDialog.show(function() {
                    Alloy.Globals.fingerprintIdentity.cancelAuthentication();
                }, function() {
                    Alloy.Globals.fingerprintIdentity.cancelAuthentication();
                });
            }
        },
        onFailedTouch: function() {
            if (OS_ANDROID) {
                $.fingerprintDialog.failure();
            }
        },
        onCompletion: function(e) {
            if (OS_ANDROID) {
                $.fingerprintDialog.success();
            }
           return alert(JSON.stringify(e));
        }
    });
}

function reset() {
    Alloy.Globals.fingerprintIdentity.resetLogin();
    refreshUI();
}

refreshUI();
$.index.open();
