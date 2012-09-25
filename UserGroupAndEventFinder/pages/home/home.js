/// <reference path="../../js/BingMapsModules/PointBasedClustering.js" />
/// <reference path="../../js/BingMapsModules/PointBasedClustering.js" />
var map, greenLayer,infobox, customInfobox, geolocator, pinData, clusterData, yesterday = new Object, today = new Object;

var DataModel = function (name, address, city, state, zip, description, latlong, latitude, longitude, eventurl) {
    this.Name = name;
    this.Address = address;
    this.City = city;
    this.State = state;
    this.Zip = zip;
    this.Description = description;
    this.LatLong = latlong;
    this.latitude = latitude;
    this.longitude = longitude;
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
            initializeLocation();
            Microsoft.Maps.loadModule('Microsoft.Maps.Map', { callback: initalizeApplication });
           
            // Add Event Listeners
            window.addEventListener("resize", mapResize, false);
            geolocator.addEventListener("positionchanged", endUserLoc.onPositionChanged);
            geolocator.addEventListener("statuschanged", endUserLoc.onStatusChanged);

            app.onactivated = function (args) {
                if (args.detail.kind === activation.ActivationKind.launch) {
                    if (args.detail.previousExecutionState !== activation.ApplicationExecutionState.terminated) {

                    } else {
                    }
                    args.setPromise(WinJS.UI.processAll().then(function () {
                        initializeLocation();
                        window.Microsoft.Maps.loadModule('Microsoft.Maps.Map', { callback: initalizeApplication });

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

    function initalizeApplication() {
        endUserLoc.checkInternetConnection();
        var homeLocation = initializeLocation();

        initalizeGetDateTime();
        initMap(homeLocation);
    }

    function initializeLocation() {
        var messageCheck = "Your location is currently turned off. Change your settings through the Settings charm to turn it back on.";
        var message = "Your location is currently turned off. Change your settings through the Settings charm for additional enhancements.";
        var loc = endUserLoc.GetUserLocationSettings();
        if (loc.status == messageCheck) {
            notificationController.setToastNotification(message);
        }
        return loc;
    }
    
    function initalizeGetDateTime() {
        try {
            var newdate = new Date();
            var dayagodate = new Date(newdate.setDate(newdate.getDate() - 1));
            today.date = formattersController.longDate(newdate);
            today.time = formattersController.shortTime(newdate);

            yesterday.date = formattersController.longDate(dayagodate);
            yesterday.time = formattersController.shortTime(dayagodate);
        } catch(e) {
            notificationController.setToastNotification("Error Initialization DateTime");
        } 
    }

    function initMap(latlong) {
        try {

            var  lastSettings = endUserLoc.GetLastSaveLocation();
            var loadLatitude = 26.275929944300522;
            var loadLongitude = -81.73840463161469;
            var zoomLevel = 4;

            if (lastSettings.zoom > 0) {
                if (!isNaN(lastSettings.latitude)) {
                    loadLatitude = lastSettings.latitude;
                }
                if (!isNaN(lastSettings.longitude)) {
                    loadLongitude = lastSettings.longitude;
                }
                zoomLevel = lastSettings.zoom;
            } else {
                if (latlong.status == "Location is available.") {
                    loadLatitude = latlong.latitude;
                    loadLongitude = latlong.longitude;
                }
            }
            var mapOptions =
            {
                credentials: "AvOW5Fz4QTsubTTdmaVnseeZnAQ0JYwbx_6zdMdgHk6iF-pnoTE7vojUFJ1kXFTP",
                mapTypeId: Microsoft.Maps.MapTypeId.birdseye,
                center: new Microsoft.Maps.Location(loadLatitude, loadLongitude),
                zoom: zoomLevel
            };

            var mapDiv = document.querySelector("#mapdiv");
            map = new Microsoft.Maps.Map(mapDiv, mapOptions);

            Microsoft.Maps.Events.addHandler(map, 'viewchangeend', bingViewChanged);
            
            greenLayer = new PointBasedClusteredEntityCollection(map, {
                singlePinCallback: createPin,
                clusteredPinCallback: createClusteredpin
            });

            //Add infobox layer that is above the clustered layers.
            var infoboxLayer = new window.Microsoft.Maps.EntityCollection();
            infobox = new window.Microsoft.Maps.Infobox(new window.Microsoft.Maps.Location(0, 0), { visible: false, offset: new window.Microsoft.Maps.Point(0, 15) });
            infoboxLayer.push(infobox);
            map.entities.push(infoboxLayer);
            mapResize();
        }
        catch (e) {
            notificationController.setToastNotification("Error Initialization map");
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

 function bingViewChanged() {
        var mapCenter = map.getCenter();
        var zoomLevel = map.getZoom();
       // var pos = map.tryPixelToLocation(new Microsoft.Maps.Point(location.clientX, location.clientY), Microsoft.Maps.PixelReference.control);
        var settings = Windows.Storage.ApplicationData.current.roamingSettings;
        settings.values["zoom"] = zoomLevel;
        settings.values["mapLat"] = mapCenter.latitude;
        settings.values["mapLong"] = mapCenter.longitude;

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
       // map.entities.clear();
        var model = convertModel(response);
        if (model != null && model.length > 1) {
            try {
               greenLayer.SetData(model);
            } catch(e) {
                notificationController.setToastNotification("No Pins are available for this area. Try zooming out ");
            } 
        }else {
            notificationController.setToastNotification("Pins are may not be available for this area. Try zooming out ");
        }
    }

    function processError(error) {
        notificationController.setToastNotification("Error gathering event data.  Please check your internet connection and try again");
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

        pinData = data;
        return data;
    }

    function createPin(data, pingInfo) {
        var pin = new Microsoft.Maps.Pushpin(pingInfo.center, {
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

    //function createClusteredpin(cluster, latlong) {
    function createClusteredpin(data, clusterInfo) {
        var pin = new Microsoft.Maps.Pushpin(clusterInfo.center, {
            icon: '/images/clusteredpin.png',
            anchor: new Microsoft.Maps.Point(8, 8)
        });
        pin.title = 'Multiple Events at this location';
        pin.clusterData = clusterInfo.dataIndices;
        pin.description = 'Number of Events at this location : ' + clusterInfo.dataIndices.length + '<br /> Zoom in to view';
        Microsoft.Maps.Events.addHandler(pin, 'click', displayInfocluster);
        return pin;
    }

    function displayInfo(e) {
        if (e.targetType == "pushpin") {
            showInfobox(e.target, customInfobox);
        }
    }
    
    function displayInfocluster(e) {
        if (e.targetType == "pushpin") {
            showInfoboxCluster(e.target, customInfobox);
        }
    }

    function showInfoboxCluster(shape) {
        var returnDescription = "<div style='overflow-y:scroll; max-height:250px;'>";
        var multiplePinId = shape.clusterData;
        multiplePinId.forEach(function (r) {
            var thisData = pinData[r];

            
            returnDescription += bingmapsinfoboxcontroller.trimdescriptiontext(thisData) + "<hr />";
            if (thisData.Address != null) {
                returnDescription += thisData.Address + "<br />";
            }

            if (thisData.City != null) {
                returnDescription += thisData.City + " ";
            }

            if (thisData.State != null) {
                returnDescription += thisData.State + " ";
            }

            if (thisData.Zip != null) {
                returnDescription += thisData.Zip;
            }

            returnDescription += "<br />";

            returnDescription += "<a href='" + thisData.EventUrl + "'>Event Data</a><hr />";
        });
        returnDescription += "</div>";
        shape.description = returnDescription;


        var infoboxOptions = {
            width: 500,
            height: 300,
            showCloseButton: true,
            offset: new Microsoft.Maps.Point(10, 0),
            showPointer: true,
            visible: true,
            title: shape.title,
            description: shape.description,
            
        };
        infobox.setLocation(shape.getLocation());
        infobox.setOptions(infoboxOptions);
    }


    function showInfobox (shape) {
        var infoboxOptions = {
            width: 400,
            height: 300,
            showCloseButton: true,
            offset: new Microsoft.Maps.Point(10, 0),
            showPointer: true,
            visible: true,
            title: shape.title,
            description: shape.description,
            actions: [{
                label: 'Event Link', eventHandler: function () {
                    window.location.href = shape.eventurl;

                }
            }, {
                label: 'Zoom to location', eventHandler: function () {
                    zoomInToPushPin(shape);

                }
            }]
        };
        
        infobox.setLocation(shape.getLocation());
        infobox.setOptions(infoboxOptions);

    };

    function zoomInToPushPin(shape)
    {
        infobox.setOptions({
            visible: false
        });
        map.setView({ zoom: 15, center:new Microsoft.Maps.Location(shape._location.latitude, shape._location.longitude)});
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
