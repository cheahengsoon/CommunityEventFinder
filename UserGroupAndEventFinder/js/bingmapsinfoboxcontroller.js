var bingmapsinfoboxcontroller = {};

bingmapsinfoboxcontroller.trimDescription = function(data) {

    var returnDescription = "<div style='overflow:auto; max-height:400px;'>";
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
    if (originalDescriptionLength > 200) {
        endSlice = 200;
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

    if (originalDescriptionLength > 200) {
        modeifiedDescription += "...";
    }

    return modeifiedDescription;
};

bingmapsinfoboxcontroller.showInfobox = function(shape) {
    for (var i = map.entities.getLength() - 1; i >= 0; i--) {
        var pushpin = map.entities.get(i);
        if (pushpin.toString() == '[Infobox]') {
            map.entities.removeAt(i);
        };
    }
    var infoboxOptions = {
        width: 300,
        height: 260,
        showCloseButton: true,
        zIndex: 4000,
        offset: new Microsoft.Maps.Point(10, 0),
        showPointer: true,
        title: shape.title,
        description: shape.description,
        actions: [{
            label: 'Event Link', eventHandler: function () {
                window.location.href = shape.eventurl;

            }
        }]
    };

      var defInfobox = new Microsoft.Maps.Infobox(shape.getLocation(), infoboxOptions);
    map.entities.push(defInfobox);
};