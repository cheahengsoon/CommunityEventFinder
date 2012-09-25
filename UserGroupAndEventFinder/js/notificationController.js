var notificationController = {};

notificationController.setToastNotification = function(message) {
    var content;
    var notifications = Windows.UI.Notifications;
    var notificationManager = notifications.ToastNotificationManager;
    var toastContent = NotificationsExtensions.ToastContent;
    content = toastContent.ToastContentFactory.createToastText01();
    content.textBodyWrap.text = message;

    // Create a toast, then create a ToastNotifier object to send the toast.
    var toast = content.createNotification();

    notificationManager.createToastNotifier().show(toast);
};