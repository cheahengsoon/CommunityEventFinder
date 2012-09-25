var bingmapsinfoboxcontroller = {};
var customInfobox;

bingmapsinfoboxcontroller.trimDescription = function(data) {

    var returnDescription = "<div style='overflow-y:scroll; max-height:250px;'>";
    returnDescription += bingmapsinfoboxcontroller.trimdescriptiontext(data) + "<hr />";
    if (data.Address != null) {
        returnDescription += data.Address + "<br />";
    }
    
    if (data.City != null) {
        returnDescription += data.City + " ";
    }
    
    if (data.State != null) {
        returnDescription += data.State + " ";
    }

    if(data.Zip != null) {
        returnDescription += data.Zip;
    }

    returnDescription += "</div>";
    return returnDescription;
};


bingmapsinfoboxcontroller.trimdescriptiontext = function(data) {
    var modeifiedDescription = data.Description;
    var originalDescriptionLength = modeifiedDescription.length;
    var endSlice;
    if (originalDescriptionLength > 500) {
        endSlice = 500;
    } else {
        endSlice = originalDescriptionLength;
    }

    if (data.Zip != null) {

        var originalZipLength = data.Zip.length;

        var addressFilterStart = modeifiedDescription.indexOf(data.Address.slice(0, 5));
        var addressFilterEnd = modeifiedDescription.indexOf(data.Zip);
        if (addressFilterStart != -1 && addressFilterEnd != -1) {
            var front = modeifiedDescription.slice(0, addressFilterStart);
            var back = modeifiedDescription.slice(addressFilterEnd + originalZipLength, originalDescriptionLength);
            modeifiedDescription = front + " " + back;
        }
    }

    modeifiedDescription = modeifiedDescription.replace(",", "").slice(0, endSlice);

    if (originalDescriptionLength > 500) {
        modeifiedDescription += "...";
    }

    return modeifiedDescription;
};

bingMapsController.renderInfobox = function(latlong, title, description) {
    customInfobox = new CustomInfobox(map, { orientation: 1, color: '#ccc', arrowWidth: 20 });
    if (customInfobox != null) {
        //Define the layout contents in the infobox
        var html = ["<div style='padding:10px'>"];

        //Add title
        html.push("<b>", title, "</b><br/>");

        //Add discription
        html.push(description, "<br/>");

        //Add a custom button to zoom to location
        html.push("<a href='javascript:void(0);' onclick='map.setView({zoom : 17, center:new Microsoft.Maps.Location(")
        html.push(latlong.latitude, ",", latlong.longitude, ")});'>Zoom to Location</a>");

        html.push("</div>");

        //Render Infobox
        customInfobox.show(latlong, html.join(''));
    }
};

//bingmapsinfoboxcontroller.showInfobox = function (shape, inCustomInfobox) {
//    for (var i = map.entities.getLength() - 1; i >= 0; i--) {
//        var pushpin = map.entities.get(i);
//        if (pushpin.toString() == '[Infobox]') {
//            map.entities.removeAt(i);
//        };
//    }
//    var infoboxOptions = {
//        width: 400,
//        height: 260,
//        showCloseButton: true,
//        zIndex: 10000,
//        offset: new Microsoft.Maps.Point(10, 0),
//        showPointer: true,
//        title: shape.title,
//        description: shape.description,
//        actions: [{
//            label: 'Event Link', eventHandler: function () {
//                window.location.href = shape.eventurl;

//            }
//        },{
//            label: 'Event Link', eventHandler: function () {
//                window.location.href = shape.eventurl;

//            }
//        }]
//    };
//      var defInfobox = new Microsoft.Maps.Infobox(shape.getLocation(), infoboxOptions);
//      map.entities.push(defInfobox);
//};