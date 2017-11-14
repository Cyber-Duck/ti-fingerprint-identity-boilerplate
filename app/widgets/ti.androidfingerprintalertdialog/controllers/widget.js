var usePasswordCallback, cancelCallback;

$.fingerprintIcon.image = WPATH("android_fingerprint.png");

function show(UsePasswordCB,CancelCB){
    $.fingerprintIcon.image = WPATH("android_fingerprint.png");
	$.fingerprintLabel.color = "#cccccc";
	$.fingerprintLabel.text = "Touch sensor";
	$.alertDialog.show();
	usePasswordCallback = UsePasswordCB || {};
	cancelCallback = CancelCB || {};
};

function hide(){
	$.alertDialog.hide();
};

function success(duration) {
	duration = duration || 1000;
	$.fingerprintIcon.image = WPATH("android_fingerprint_success.png");
	$.fingerprintLabel.color = "#009689";
	$.fingerprintLabel.text = "Fingerprint recognized";
	setTimeout(function() {
		$.alertDialog.hide();
	}, duration);
};

function failure(){
	$.fingerprintIcon.image = WPATH("android_fingerprint_failure.png");
	$.fingerprintLabel.color = "#f4511f";
	$.fingerprintLabel.text = "Fingerprint not recognized.\nTry again.";
};

function fingerprintButtonPressed(e){
	if (e.index === 1) {			//"Use Password"
		usePasswordCallback();
	} else if (e.index === 0) {		//"Cancel"
		cancelCallback();
	}
};
exports.show = show;
exports.hide = hide;
exports.success = success;
exports.failure = failure;
exports.fingerprintButtonPressed = fingerprintButtonPressed;
