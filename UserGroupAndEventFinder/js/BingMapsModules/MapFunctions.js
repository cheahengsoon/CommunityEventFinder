var MapFunctions = {};


MapFunctions.distanceByZoomLevel = function(zoomLevel) {
    switch (true) {
    case ((zoomLevel >= 1) && (zoomLevel <= 2)):
        return 15000;
    case (zoomLevel == 3):
        return 10000;
    case (zoomLevel == 4):
        return 5500;
    case ((zoomLevel >= 5) && (zoomLevel <= 6)):
        return 3000;
    case ((zoomLevel >= 7) && (zoomLevel <= 10)):
        return 1000;
    case (zoomLevel > 10):
        return 300;
    default:
        return 10000;
    }
};