var InfoBoxFormatter = {};

InfoBoxFormatter.trimDescription = function (data) {
    "use strict";
    var returnDescription = "<div style='overflow-y:scroll; max-height:250px;'>";

    returnDescription += "<b>" + data.StartDate + "</b> -- ";
    returnDescription += InfoBoxFormatter.trimdescriptiontext(data) + "<hr />";
    if (data.Address !== null) {
        returnDescription += data.Address + "<br />";
    }
    if (data.City !== null) {
        returnDescription += data.City + " ";
    }
    if (data.State !== null) {
        returnDescription += data.State + " ";
    }
    if (data.Zip !== null) {
        returnDescription += data.Zip;
    }

    returnDescription += "</div>";
    return returnDescription;
};


InfoBoxFormatter.trimdescriptiontext = function (data) {
    "use strict";
    var modeifiedDescription = data.Description;
    var originalDescriptionLength = modeifiedDescription.length;
    var endSlice;
    if (originalDescriptionLength > 600) {
        endSlice = 600;
    } else {
        endSlice = originalDescriptionLength;
    }

    if (data.Zip !== null) {

        var originalZipLength = data.Zip.length;

        var addressFilterStart = modeifiedDescription.indexOf(data.Address.slice(0, 5));
        var addressFilterEnd = modeifiedDescription.indexOf(data.Zip);
        if (addressFilterStart !== -1 && addressFilterEnd != -1) {
            var front = modeifiedDescription.slice(0, addressFilterStart);
            var back = modeifiedDescription.slice(addressFilterEnd + originalZipLength, originalDescriptionLength);
            modeifiedDescription = front + " " + back;
        }
    }

    modeifiedDescription = modeifiedDescription.replace(",", "").slice(0, endSlice);

    if (originalDescriptionLength > 600) {
        modeifiedDescription += "...";
    }

    return modeifiedDescription;
};

InfoBoxFormatter.getHeightValue = function(desciption) {
    switch (true) {
        case (desciption.length > 740):
            return 380;
        case (desciption.length > 600):
            return 360;
        case (desciption.length > 500):
            return 350;
        case (desciption.length > 450):
            return 280;
        case (desciption.length > 400):
            return 250;
        case (desciption.length > 300):
            return 240;
        default:
            return 150;
    }
}