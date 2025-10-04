System.register(["PosApi/Extend/Triggers/TransactionTriggers", "PosApi/Entities", "../../DataService/DataServiceRequests.g", "PosApi/Consume/Device", "./CFZGlobalData"], function (exports_1, context_1) {
    "use strict";
    var __extends = (this && this.__extends) || (function () {
        var extendStatics = function (d, b) {
            extendStatics = Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
                function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
            return extendStatics(d, b);
        };
        return function (d, b) {
            if (typeof b !== "function" && b !== null)
                throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();
    var Triggers, Entities_1, DataServiceRequests_g_1, Device_1, CFZGlobalData_1, PostEndTransactionTrigger;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (Triggers_1) {
                Triggers = Triggers_1;
            },
            function (Entities_1_1) {
                Entities_1 = Entities_1_1;
            },
            function (DataServiceRequests_g_1_1) {
                DataServiceRequests_g_1 = DataServiceRequests_g_1_1;
            },
            function (Device_1_1) {
                Device_1 = Device_1_1;
            },
            function (CFZGlobalData_1_1) {
                CFZGlobalData_1 = CFZGlobalData_1_1;
            }
        ],
        execute: function () {
            PostEndTransactionTrigger = (function (_super) {
                __extends(PostEndTransactionTrigger, _super);
                function PostEndTransactionTrigger() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                PostEndTransactionTrigger.prototype.execute = function (options) {
                    var _this = this;
                    var cart = CFZGlobalData_1.default.selectedCart;
                    var isOnline = false;
                    var getConnectionStatusClientRequest = new Device_1.GetConnectionStatusClientRequest(this.context.logger.getNewCorrelationId());
                    return this.context.runtime.executeAsync(getConnectionStatusClientRequest)
                        .then(function (connectionStatus) {
                        isOnline = connectionStatus.data.result == Entities_1.ClientEntities.ConnectionStatusType.Online ? true : false;
                        if (cart != null) {
                            if (cart.CartTypeValue == Entities_1.ProxyEntities.CartType.IncomeExpense) {
                                var CustomRequest = new DataServiceRequests_g_1.CFZCustomer.GetPettyExpenseUpdateRequest(cart, 2);
                                return _this.context.runtime.executeAsync(CustomRequest)
                                    .then(function (response) {
                                    return Promise.resolve();
                                });
                            }
                            else {
                                return Promise.resolve();
                            }
                        }
                        return Promise.resolve();
                    })
                        .then(function () {
                        if (isOnline) {
                            cart = CFZGlobalData_1.default.selectedCart;
                            if (cart != null) {
                                if (cart.ReceiptTransactionTypeValue == Entities_1.ProxyEntities.ReceiptTransactionType.Sale) {
                                    var Customer = new DataServiceRequests_g_1.CFZCustomer.sendSMSDataActionRequest(cart, "1");
                                    _this.context.runtime.executeAsync(Customer)
                                        .then(function (Results) {
                                        var error = "";
                                        error = JSON.stringify(Results.data.result);
                                        var extensionErrorLog = new Entities_1.ClientEntities.ExtensionError(error);
                                        return Promise.reject(extensionErrorLog);
                                    }).
                                        catch(function (reason) {
                                        var error = "";
                                        error = JSON.stringify(reason);
                                        var extensionErrorLog = new Entities_1.ClientEntities.ExtensionError(error);
                                        return Promise.reject(extensionErrorLog);
                                    });
                                }
                            }
                            return Promise.resolve();
                        }
                        return Promise.resolve();
                    });
                };
                return PostEndTransactionTrigger;
            }(Triggers.PostEndTransactionTrigger));
            exports_1("default", PostEndTransactionTrigger);
        }
    };
});
//# sourceMappingURL=C:/Users/localadmin/Videos/StoreCommerce43/Pos/Extend/CFZTransactionTrigger/PostEndTransactionTrigger.js.map