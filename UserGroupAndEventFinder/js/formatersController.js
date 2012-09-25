var formattersController = {};

formattersController.shortDate = function(dateTime) {
    var dt = new Windows.Globalization.DateTimeFormatting.DateTimeFormatter("shortdate");
    return dt.format(dateTime);
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