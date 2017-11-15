function basicPrompt() {
    if (!Alloy.Globals.fingerprintIdentity.isSupported()) {
        alert("Touch ID is currently locked or not supported on this device.");
        return;
    }

    var reason = "This is a basic prompt";
    if (OS_ANDROID) {
        $.fingerprintDialog.setReason(reason);
    }
    Alloy.Globals.fingerprintIdentity.authenticate({
        reason: reason,
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
                    $.fingerprintDialog.failure(e.error);
                } else {
                    alert("Error: " + e.error);
                }
            }
            refreshUI();
        }
    });

    if (OS_ANDROID) {
        $.fingerprintDialog.show(function() {
            Alloy.Globals.fingerprintIdentity.cancelAuthentication();
        });
    }
}

function setupLogin() {
    if (OS_ANDROID) {
        $.password.setValue("");
    }
    return $.passwordPromt.show();
}

function savePassword(e) {
    var plainPassword = OS_IOS ? e.text : $.password.getValue();

    Alloy.Globals.fingerprintIdentity.authenticate({
        reason: "Confirm fingerprint to continue",
        fallbackTitle: "", // disable Enter Password fallback when Touch ID fails
        callback: function(e) {
            if (e.success) {
                Alloy.Globals.fingerprintIdentity.enableLogin({
                    username: "foobar",
                    secret: plainPassword,
                    callback: function(result) {
                        if (result.success) {
                            if (OS_ANDROID) {
                                $.fingerprintDialog.success();
                            } else {
                                alert("Success!");
                            }
                        } else {
                            if (OS_ANDROID) {
                                $.fingerprintDialog.failure(result.error);
                            } else {
                                alert("Error: " + result.error);
                            }
                        }
                        refreshUI();
                    }
                });
            } else {
                if (OS_ANDROID) {
                    $.fingerprintDialog.failure(e.error);
                } else {
                    alert("Error: " + e.error);
                }
            }
        }
    });
    if (OS_ANDROID) {
        $.fingerprintDialog.show(function() {
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
                });
            }
        },
        onCompletion: function(e) {
            if (OS_ANDROID) {
                if (e.success) {
                    $.fingerprintDialog.success();
                    _.delay(function() {
                        alert(JSON.stringify(e));
                    }, 2000);
                } else {
                    $.fingerprintDialog.failure(e.error);
                }
            }
            if (OS_IOS) {
                return alert(JSON.stringify(e));
            }
        }
    });
}

function reset() {
    Alloy.Globals.fingerprintIdentity.resetLogin();
    refreshUI();
}

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

refreshUI();
$.index.open();
