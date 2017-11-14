# Axway Appcelerator Titanium Alloy Application Boilerplate for Apple Touch ID and Google Fingerprint implementation

This is a boilerplate for Apple Touch ID and Google Fingerprint implementation in your Ti Alloy application.

The idea is to have this as a sample and a boilerplate for building applications using those technologies.

## Dependancies (all included)

* [Ti.Identity](https://github.com/appcelerator-modules/titanium-identity)
* [ti.androidfingerprintalertdialog](https://github.com/adamtarmstrong/ti.androidfingerprintalertdialog) for Android Dialog

## Requrements

* Ti SDK 6.3.0.GA+

## Usage

Once cloned, you can run `appc new --import --no-service` to initialise your `tiapp.xml` file with a valid app GUID.

Don't forget to add the following to your `tiapp.xml`:

For Android Fingerprint:

```xml
<android ...>
    <manifest ...>
        ...
        <!-- Fingerprint Permissions -->
        <uses-permission android:name="android.permission.USE_FINGERPRINT"/>
        ...
    </manifest>
</android>
```

For iOS Touch ID, at the root of the file:

```xml
<property name="touchid.team_id" type="string">YOU_TEAM_ID</property>
```

`YOUR_TEAM_ID` can be found [here](https://developer.apple.com/account/#/membership) once logged in.

For both:

```xml
<modules>
    <module platform="android" version="1.0.0">ti.identity</module>
    <module platform="iphone" version="1.0.1">ti.identity</module>
</modules>
```
### Setup `touchfinger.js`

The TouchFinger CommonJS library `lib/touchfinger.js` is a wrapper to give you easy to use functions to call.

It also supports authentication capabilities if you're planning to use Touch ID or Fingerprint with a login functionality.

Initialise it in your `app/alloy.js`:

```js
// Init the library
var TouchFinger = require("touchfinger");
Alloy.Globals.TouchFinger = new TouchFinger();
// Extra functionality to the library when used for login (optional)
Alloy.Globals.canLoginWithFingerprint = function() {
    return Alloy.Globals.touchfinger.isSupported() && Alloy.Globals.touchfinger.isLoginEnabled();
};
```



## Resources

* [Ti.Identity](http://docs.appcelerator.com/platform/latest/#!/api/Modules.Identity)
* [Ti.Identity sources](https://github.com/appcelerator-modules/titanium-identity)
* [Ti.Identity.KeychainItem](http://docs.appcelerator.com/platform/latest/#!/api/Modules.Identity.KeychainItem)
* [Android Implentation Guide](https://medium.com/adamtarmstrong/https-medium-com-adamtarmstrong-android-fingerprint-authentication-using-axway-titanium-2c73a6c35df1)
* [Alloy Widget for Android Fingerprint UI](https://github.com/adamtarmstrong/ti.androidfingerprintalertdialog)
