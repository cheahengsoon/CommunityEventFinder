var InfoBoxFormatter = {};

InfoBoxFormatter.trimDescription = function(data) {

    var returnDescription = "<div style='overflow-y:scroll; max-height:250px;'>";
    returnDescription += InfoBoxFormatter.trimdescriptiontext(data) + "<hr />";
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


InfoBoxFormatter.trimdescriptiontext = function(data) {
    var modeifiedDescription = data.Description;
    var originalDescriptionLength = modeifiedDescription.length;
    var endSlice;
    if (originalDescriptionLength > 600) {
        endSlice = 600;
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

    if (originalDescriptionLength > 600) {
        modeifiedDescription += "...";
    }

    return modeifiedDescription;
};