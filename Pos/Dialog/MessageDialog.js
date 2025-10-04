System.register(["PosApi/Consume/Dialogs"], function (exports_1, context_1) {
    "use strict";
    var Dialogs_1, MessageDialog;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (Dialogs_1_1) {
                Dialogs_1 = Dialogs_1_1;
            }
        ],
        execute: function () {
            MessageDialog = (function () {
                function MessageDialog() {
                }
                MessageDialog.show = function (context, message, title) {
                    if (title === void 0) { title = "Extension Message Dialog"; }
                    var promise = new Promise(function (resolve, reject) {
                        var messageDialogOptions = {
                            title: title,
                            message: message,
                            showCloseX: true,
                            button1: {
                                id: "button1OK",
                                label: "OK",
                                result: "OKResult"
                            },
                            button2: {
                                id: "Button2Cancel",
                                label: "Cancel",
                                result: "CancelResult"
                            }
                        };
                        var dialogRequest = new Dialogs_1.ShowMessageDialogClientRequest(messageDialogOptions);
                        context.runtime.executeAsync(dialogRequest).then(function (result) {
                            if (!result.canceled) {
                                context.logger.logInformational("MessageDialog result: " + result.data.result.dialogResult);
                                resolve(result.data.result.dialogResult);
                            }
                            else {
                                context.logger.logInformational("Request for MessageDialog is canceled.");
                                resolve(null);
                            }
                        }).catch(function (reason) {
                            context.logger.logError(JSON.stringify(reason));
                            reject(reason);
                        });
                    });
                    return promise;
                };
                return MessageDialog;
            }());
            exports_1("default", MessageDialog);
        }
    };
});
//# sourceMappingURL=C:/Users/localadmin/Videos/StoreCommerce43/Pos/Dialog/MessageDialog.js.map