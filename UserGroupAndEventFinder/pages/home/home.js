var map;
var geolocator;

var DataModel = function (name, address, city, state, zip, description, latlong, latitude, longitude, eventurl) {
    this.Name = name;
    this.Address = address;
    this.City = city;
    this.State = state;
    this.Zip = zip;
    this.Description = description;
    this.LatLong = latlong;
    this.Latitude = latitude;
    this.Longitude = longitude;
    this.EventUrl = eventurl;
};

(function () {
    "use strict";
    
    WinJS.UI.Pages.define("/pages/home/home.html", {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            var app = WinJS.Application;
            var activation = Windows.ApplicationModel.Activation;
            WinJS.strictProcessing();
            geolocator = new Windows.Devices.Geolocation.Geolocator();
            
            Microsoft.Maps.loadModule('Microsoft.Maps.Map', { callback: checkUserLocation });

            // Add Event Listeners
            WinJS.log && WinJS.log("Adding Event Handlers...", "CommunityEventFinder", "status");
            window.addEventListener("resize", mapResize, false);
            document.querySelector('#changeMapType').addEventListener('click', changeMapType, false);
            geolocator.addEventListener("positionchanged", endUserLoc.onPositionChanged);
            geolocator.addEventListener("statuschanged", endUserLoc.onStatusChanged);

            app.onactivated = function (args) {
                if (args.detail.kind === activation.ActivationKind.launch) {
                    if (args.detail.previousExecutionState !== activation.ApplicationExecutionState.terminated) {

                    } else {
                    }
                    args.setPromise(WinJS.UI.processAll().then(function () {
                        Microsoft.Maps.loadModule('Microsoft.Maps.Map', { callback: checkUserLocation });
                    }));
                }
            };
        }, // end Ready
        unload: function () {
            // Remove Event Listeners
            window.removeEventListener("resize", mapResize, false);
            document.querySelector('#changeMapType').removeEventListener('click', changeMapType, false);
            geolocator.removeEventListener("positionchanged", endUserLoc.onPositionChanged);
            geolocator.removeEventListener("statuschanged", endUserLoc.onStatusChanged);
        }
    });

    function checkUserLocation() {
        endUserLoc.checkInternetConnection();
        var homeLocation = endUserLoc.GetUserLocationSettings();
        initMap(homeLocation);
    }

    function initMap(latlong) {
        try {
            var loadLatitude = 26.275929944300522;
            var loadLongitude = -81.73840463161469;

            if (latlong.status == "Location is available.") {
                loadLatitude = latlong.latitude;
                loadLongitude = latlong.longitude;
            } else {
                if (latlong.status == "Your location settings is currently turned off. If you would like to turn on this setting please look at the permissions charm.") {
                    setToastNotification(latlong.status);
                }
            }

            var mapOptions =
            {
                credentials: "AvOW5Fz4QTsubTTdmaVnseeZnAQ0JYwbx_6zdMdgHk6iF-pnoTE7vojUFJ1kXFTP",
                mapTypeId: Microsoft.Maps.MapTypeId.birdseye,
                center: new Microsoft.Maps.Location(loadLatitude, loadLongitude),
                zoom: 13
            };

            var mapDiv = document.querySelector("#mapdiv");
            map = new Microsoft.Maps.Map(mapDiv, mapOptions);
            Microsoft.Maps.Events.addHandler(map, 'viewchangeend', bingViewChanged);
            mapResize();
        }
        catch (e) {
            setToastNotification("An error occurred loading, please close and try again");
        }
    }

    function mapResize(e) {
        var currentViewState = Windows.UI.ViewManagement.ApplicationView.value;
        var snapped = Windows.UI.ViewManagement.ApplicationViewState.snapped;
        var windowHeight = window.outerHeight;
        var windowWidth = window.outerWidth;

        if (currentViewState === snapped) {
            var mapDivElement = document.getElementById('mapdiv');
            mapDivElement.style.width = 90 + "%";
            mapDivElement.style.height = 70 + "%";
            var titleHeader = document.getElementById('titleHeader');
            titleHeader.style.marginLeft = 20 + "px";
        } else {
            resetMapDiv(windowHeight, windowWidth);
            var titleHeader1 = document.getElementById('titleHeader');
            titleHeader1.style.marginLeft = 110 + "px";
        }
    }

    function resetMapDiv(windowHeight1, windowWidth1) {
        var minusWidth = 250;
        var minusHeight = 200;

        if (windowWidth1 == 1024) {
            minusWidth = 200;
            minusHeight = 200;
        }

        if (windowWidth1 > 1024 && windowWidth1 < 1920) {
            minusWidth = 250;
            minusHeight = 200;
        }
        
        if (windowWidth1 > 1919) {
            minusWidth = 250;
            minusHeight = 250;
        }

        var mapDivElement1 = document.getElementById('mapdiv');
        mapDivElement1.style.width = windowWidth1 - minusWidth + "px";
        mapDivElement1.style.height = windowHeight1 - minusHeight + "px";
    }

    function setToastNotification(message) {
        var content;
        var notifications = Windows.UI.Notifications;
        var notificationManager = notifications.ToastNotificationManager;
        var toastContent = NotificationsExtensions.ToastContent;
        content = toastContent.ToastContentFactory.createToastText01();
        content.textBodyWrap.text = message;

        // Display the XML of the toast.
        WinJS.log && WinJS.log(content.getContent(), "CommunityFinder", "status");

        // Create a toast, then create a ToastNotifier object to send the toast.
        var toast = content.createNotification();

        notificationManager.createToastNotifier().show(toast);
    }

  function bingViewChanged() {
        var mapCenter = map.getCenter();
        var zoomLevel = map.getZoom();
        var eventsByDistance = bingMapsController.distanceByZoomLevel(zoomLevel);

        var urlAddress = "http://www.communitymegaphone.com/ws/CMEventDS.svc/GetEventsByDistance?Lat='" + mapCenter.latitude + "'&Lon='" + mapCenter.longitude + "'&Dist=" + eventsByDistance + "&$format=json&$orderby=starttime%20asc";

        WinJS.xhr({
            type: "GET",
            url: urlAddress
        }).then(processSuccess, processError);
    }

    function processSuccess(result) {
        var cleansed = result.responseText.replace(/\\'/g, "'");
        var response = JSON.parse(cleansed, dateReviver).d;
        map.entities.clear();
        var model = convertModel(response);
        if (model != null && model.length > 1) {
            try {
                var greenLayer = new ClusteredEntityCollection(map,
                    {
                        singlePinCallback: createPin,
                        clusteredPinCallback: createClusteredpin
                    });
                greenLayer.SetData(model);
            } catch(e) {
               setToastNotification("No Pins are available for this area. Try zooming out ");
                WinJS.log && WinJS.log('Error Setting pushpins', 'pins', 'status');
            } 
        }else {
            setToastNotification("Pins are may not be available for this area. Try zooming out ");
        }
    }

    function processError(error) {
        setToastNotification("Error gathering event data.  Please check your internet connection and try again");
        WinJS.log && WinJS.log('Error service call', 'service', 'service');
    }

    function convertModel(response) {
        var data = [];
        var lat = 47;
        var longit = -140;

        response.forEach(function (r) {
            var eventLocation;
            var descript = r.description;
            var latlong = r.latlong;
            if (r.latlong != null) {
                eventLocation = r.latlong.split(",");
            } else {
                lat = lat - 5;
                latlong = lat + "," + longit;
                eventLocation = latlong.split(",");
                descript = "**Online Event** " + r.description;
            }

            data.push(new DataModel(r.title, r.address, r.city, r.state, r.zip, descript, latlong, eventLocation[0], eventLocation[1], r.eventUrl));
        });

        return data;
    }

    function createPin(data) {
        var pin = new Microsoft.Maps.Pushpin(data._LatLong, {
            icon: '/images/HomePushPin.png',
            anchor: new Microsoft.Maps.Point(8, 8)
        });

        var trimedDescription = bingmapsinfoboxcontroller.trimDescription(data);

        pin.title = data.Name;
        pin.description = trimedDescription;
        pin.eventurl = data.EventUrl;

        Microsoft.Maps.Events.addHandler(pin, 'click', displayInfo);
        return pin;
    }

    function createClusteredpin(cluster, latlong) {
        var pin = new Microsoft.Maps.Pushpin(latlong, {
            icon: '/images/clusteredpin.png',
            anchor: new Microsoft.Maps.Point(8, 8)
        });
        pin.title = 'Multiple Events';
        pin.description = 'Number of pins : ' + cluster.length + '<br /> Zoom in to view';
        Microsoft.Maps.Events.addHandler(pin, 'click', displayInfo);
        return pin;
    }

    function displayInfo(e) {
        if (e.targetType == "pushpin") {
            bingmapsinfoboxcontroller.showInfobox(e.target);
        }
    }

    function dateReviver(key, value) {
        var a;
        if (typeof value === 'string') {
            a = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)(Z|([+\-])(\d{2}):(\d{2}))$/.exec(value);
            if (a) {
                return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
                                +a[5], +a[6]));
            }
        }
        return value;
    };

    function changeMapType() {
        var type = map.getMapTypeId();
        switch (type) {
            case Microsoft.Maps.MapTypeId.aerial:
                type = Microsoft.Maps.MapTypeId.road;
                break;
            case Microsoft.Maps.MapTypeId.road:
                type = Microsoft.Maps.MapTypeId.birdseye;
                break;
            default:
                type = Microsoft.Maps.MapTypeId.aerial;
                break;
        }
        map.setView({ center: map.getCenter(), mapTypeId: type });
    }
})();
