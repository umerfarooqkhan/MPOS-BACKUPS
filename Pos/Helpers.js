System.register(["PosApi/Consume/Dialogs", "PosApi/Entities"], function (exports_1, context_1) {
    "use strict";
    var Dialogs_1, Entities_1, ErrorHelper;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (Dialogs_1_1) {
                Dialogs_1 = Dialogs_1_1;
            },
            function (Entities_1_1) {
                Entities_1 = Entities_1_1;
            }
        ],
        execute: function () {
            ErrorHelper = (function () {
                function ErrorHelper() {
                }
                ErrorHelper.displayErrorAsync = function (context, reason) {
                    var messageDialogOptions;
                    if (reason instanceof Entities_1.ClientEntities.ExtensionError) {
                        messageDialogOptions = {
                            message: reason.localizedMessage
                        };
                    }
                    else if (reason instanceof Error) {
                        messageDialogOptions = {
                            message: reason.message
                        };
                    }
                    else if (typeof reason === "string") {
                        messageDialogOptions = {
                            message: reason
                        };
                    }
                    else {
                        messageDialogOptions = {
                            message: "An unexpected error occurred."
                        };
                    }
                    var errorMessageRequest = new Dialogs_1.ShowMessageDialogClientRequest(messageDialogOptions);
                    return context.runtime.executeAsync(errorMessageRequest);
                };
                return ErrorHelper;
            }());
            exports_1("ErrorHelper", ErrorHelper);
        }
    };
});
//# sourceMappingURL=C:/Users/localadmin/Videos/StoreCommerce43/Pos/Helpers.js.map