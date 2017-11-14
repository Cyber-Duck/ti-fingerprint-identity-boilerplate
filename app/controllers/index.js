if (OS_IOS) {
    $.getView().setTitle("Touch ID Boilerplate");
} else {
    $.getView().setTitle("Fingerprint Boilerplate");
}

 function authenticate() {
     if (!Alloy.Globals.touchfinger.isSupported()) {
         alert("Touch ID / Fingerprint is not supported on this device!");
         return;
     }

     Alloy.Globals.touchfinger.authenticate({
         reason: "A reason to ask for Touch ID.",
         callback: function(e) {
             if (!e.success) {
                if (OS_ANDROID) {
                    $.fingerprintDialog.failure();
                } else {
                    alert("Error.");
                }
                console.error('ERROR! Message: ' + e.error);
             } else {
                 if (OS_ANDROID) {
                     $.fingerprintDialog.success();
                 } else {
                    alert("Success!");
                 }
                 console.log('SUCCESS!');
             }
         }
     });

     if (OS_ANDROID) {
         $.fingerprintDialog.show(function() {
             Alloy.Globals.touchfinger.cancelAuthentication();
         }, function() {
             Alloy.Globals.touchfinger.cancelAuthentication();
         });
     }
 };

 $.index.open();
