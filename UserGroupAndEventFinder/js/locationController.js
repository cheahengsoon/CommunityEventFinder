var endUserLoc = {};
endUserLoc.CurrentApplicationData = Windows.Storage.ApplicationData.current;

endUserLoc.checkInternetConnection = function () {
    var addressCheck = "http://www.communitymegaphone.com/ws/CMEventDS.svc/GetEventsByDistance?Lat='26.275929944300522'&Lon='-81.73840463161469'&Dist=250&$format=json&$orderby=starttime%20asc&$top=25";
    
    WinJS.xhr({
        type: "GET",
        url: addressCheck
    }).then(endUserLoc.processSuccess, endUserLoc.processError);
};

endUserLoc.processSuccess = function () {
    WinJS.log && WinJS.log('Internet connection successful', 'internetCheck', 'internet');
};

endUserLoc.processError = function(error) {
    notificationController.setToastNotification("Could not connect to the internet.  Please check your internet connection and try again");
    WinJS.log && WinJS.log('Error service call', 'internetCheck', 'service');
};


endUserLoc.onStatusChanged = function (args) {
    var newStatus = args.status;
    var settings = Windows.Storage.ApplicationData.current.roamingSettings;
    settings.values["GeoStatus"] = endUserLoc.getStatusString(newStatus);
    //if (settings.values["GeoStatus"] == "Location is available.") {
    //    endUserLoc.GetLocation();
    //}
};

endUserLoc.onPositionChanged = function (args) {
    if (args != null) {
        var pos = args.position.coordinate;
        var settings = Windows.Storage.ApplicationData.current.roamingSettings;
        settings.values["latitude"] = pos.latitude;
        settings.values["longitude"] = pos.longitude;
        settings.values["accuracy"] = pos.accuracy;
    }
};

endUserLoc.GetLocation = function () {
    if (endUserLoc.CurrentLocation == null) {
        endUserLoc.CurrentLocation = new Windows.Devices.Geolocation.Geolocator();
    }
    if (endUserLoc.CurrentLocation != null) {
        try {
           endUserLoc.CurrentLocation.getGeopositionAsync().then(endUserLoc.getPositionHandler, endUserLoc.errorHandler);
        } catch(e) {
            WinJS.log && WinJS.log('GeoLocation is Off', 'geo', 'location');
        } 
        
    }
};

endUserLoc.getPositionHandler = function (pos) {
   // var settings = Windows.Storage.ApplicationData.current.roamingSettings;
    var settings = endUserLoc.CurrentApplicationData.roamingSettings;
    var hasContainer = settings.containers.hasKey("latitude");
    if (!hasContainer) {
       // endUserLoc.GetLocation();
        
    }
    settings.values["GeoStatus"] = endUserLoc.getStatusString(endUserLoc.CurrentLocation.locationStatus);
    settings.values["latitude"] = pos.coordinate.latitude;
    settings.values["longitude"] = pos.coordinate.longitude;
    settings.values["accuracy"] = pos.coordinate.accuracy;
};

endUserLoc.errorHandler = function () {
    var settings = Windows.Storage.ApplicationData.current.roamingSettings;
    settings.values["GeoStatus"] = endUserLoc.getStatusString(endUserLoc.CurrentLocation.locationStatus);
    settings.values["latitude"] =  26.275929944300522;
    settings.values["longitude"] = -81.73840463161469;
    settings.values["accuracy"] = 0;
};

endUserLoc.getStatusString = function(locStatus) {
    switch (locStatus) {
    case Windows.Devices.Geolocation.PositionStatus.ready:
        return "Location is available.";
    case Windows.Devices.Geolocation.PositionStatus.initializing:
       // endUserLoc.ResetUserLocationSettings();
        return "A GPS device is still initializing.";
    case Windows.Devices.Geolocation.PositionStatus.noData:
        return "Data from location services is currently unavailable.";
    case Windows.Devices.Geolocation.PositionStatus.disabled:
       // endUserLoc.ResetUserLocationSettings();
        return "Your location is currently turned off. Change your settings through the Settings charm to turn it back on.";
    case Windows.Devices.Geolocation.PositionStatus.notInitialized:
       // endUserLoc.ResetUserLocationSettings();
        return "Location status is not initialized because the app has not requested location data.";
    case Windows.Devices.Geolocation.PositionStatus.notAvailable:
       // endUserLoc.ResetUserLocationSettings();
        return "You do not have the required location services present on your system.";
        default:
            return "Error checking Geolocation string";
    }
};

endUserLoc.GetUserLocationSettings = function() {
    var settings = Windows.Storage.ApplicationData.current.roamingSettings;
    var latlong = { };
    latlong.status = settings.values["GeoStatus"];
    latlong.latitude = settings.values["latitude"];
    latlong.longitude = settings.values["longitude"];
    latlong.accuracy = settings.values["accuracy"];

    return latlong;
};

endUserLoc.GetLastSaveLocation = function() {
    var settings = Windows.Storage.ApplicationData.current.roamingSettings;
    var lastSettings = {};
    lastSettings.zoom = settings.values["zoom"];
    lastSettings.latitude = settings.values["mapLat"];
    lastSettings.longitude = settings.values["mapLong"];

    return lastSettings;
};

endUserLoc.ResetUserLocationSettings = function () {
    var roamingSettings = Windows.Storage.ApplicationData.current.roamingSettings;
    roamingSettings.values.remove("GeoStatus");
    roamingSettings.values.remove("latitude");
    roamingSettings.values.remove("longitude");
    roamingSettings.values.remove("accuracy");
}