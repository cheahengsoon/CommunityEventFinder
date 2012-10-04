var formattersController = {};

formattersController.shortDate = function(dateTime) {
    var dt = new Windows.Globalization.DateTimeFormatting.DateTimeFormatter("shortdate");
    return dt.format(dateTime);
};

formattersController.shortDateMegaPhone = function (dateTime) {
    var dt = new Windows.Globalization.DateTimeFormatting.DateTimeFormatter("shortdate");
    var dateValue = dt.format(dateTime).split("/");
    var checkDay = dateValue[1];
    if(checkDay.length == 3) {
        checkDay = "0" + dateValue[1];
    }
    
    var checkMonth = dateValue[0];
    if (checkMonth.length == 3) {
        checkMonth = "0" + dateValue[0];
    }

    return dateValue[2] + "-" + checkMonth + "-" + checkDay;
};


formattersController.longDate = function (dateTime) {
    var dt = new Windows.Globalization.DateTimeFormatting.DateTimeFormatter("longdate");
    return dt.format(dateTime);
};

formattersController.shortTime = function (dateTime) {
    var dt = new Windows.Globalization.DateTimeFormatting.DateTimeFormatter("shorttime");
    return dt.format(dateTime);
};

formattersController.longTime = function (dateTime) {
    var dt = new Windows.Globalization.DateTimeFormatting.DateTimeFormatter("longtime");
    return dt.format(dateTime);
};

formattersController.currentLanguage = function() {
    return Windows.Globalization.ApplicationLanguages.languages[0];
};