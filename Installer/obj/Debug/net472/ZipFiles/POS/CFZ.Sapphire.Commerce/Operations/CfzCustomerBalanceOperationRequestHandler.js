System.register(["PosApi/TypeExtensions", "PosApi/Create/Operations", "./CfzCustomerBalanceOperationRequest", "./CfzCustomerBalanceOperationResponse", "PosApi/Entities", "../Dialog/CfzCustomerBalance", "PosApi/Consume/Device", "../DataService/DataServiceRequests.g", "PosApi/Consume/Dialogs", "../Dialog/MessageDialog", "knockout"], function (exports_1, context_1) {
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
    var TypeExtensions_1, Operations_1, CfzCustomerBalanceOperationRequest_1, CfzCustomerBalanceOperationResponse_1, Entities_1, CfzCustomerBalance_1, Device_1, DataServiceRequests_g_1, Dialogs_1, MessageDialog_1, knockout_1, CfzCustomerBalanceOperationRequestHandler;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (TypeExtensions_1_1) {
                TypeExtensions_1 = TypeExtensions_1_1;
            },
            function (Operations_1_1) {
                Operations_1 = Operations_1_1;
            },
            function (CfzCustomerBalanceOperationRequest_1_1) {
                CfzCustomerBalanceOperationRequest_1 = CfzCustomerBalanceOperationRequest_1_1;
            },
            function (CfzCustomerBalanceOperationResponse_1_1) {
                CfzCustomerBalanceOperationResponse_1 = CfzCustomerBalanceOperationResponse_1_1;
            },
            function (Entities_1_1) {
                Entities_1 = Entities_1_1;
            },
            function (CfzCustomerBalance_1_1) {
                CfzCustomerBalance_1 = CfzCustomerBalance_1_1;
            },
            function (Device_1_1) {
                Device_1 = Device_1_1;
            },
            function (DataServiceRequests_g_1_1) {
                DataServiceRequests_g_1 = DataServiceRequests_g_1_1;
            },
            function (Dialogs_1_1) {
                Dialogs_1 = Dialogs_1_1;
            },
            function (MessageDialog_1_1) {
                MessageDialog_1 = MessageDialog_1_1;
            },
            function (knockout_1_1) {
                knockout_1 = knockout_1_1;
            }
        ],
        execute: function () {
            CfzCustomerBalanceOperationRequestHandler = (function (_super) {
                __extends(CfzCustomerBalanceOperationRequestHandler, _super);
                function CfzCustomerBalanceOperationRequestHandler() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                CfzCustomerBalanceOperationRequestHandler.prototype.supportedRequestType = function () {
                    return CfzCustomerBalanceOperationRequest_1.default;
                };
                CfzCustomerBalanceOperationRequestHandler.prototype.executeAsync = function (request) {
                    var _this = this;
                    var customerSearchScanDialog = new CfzCustomerBalance_1.default();
                    this.dialogResult = knockout_1.default.observable("");
                    return customerSearchScanDialog.open("").then(function (resultDialog) {
                        if (!TypeExtensions_1.ObjectExtensions.isNullOrUndefined(resultDialog)) {
                            _this.dialogResult(resultDialog.selectedValue);
                            _this.context.logger.logInformational("Text Entered in Box: " + resultDialog.selectedValue);
                            if (resultDialog.selectedValue != 'Canceled') {
                                var isOnline_1 = false;
                                var getConnectionStatusClientRequest = new Device_1.GetConnectionStatusClientRequest(_this.context.logger.getNewCorrelationId());
                                return _this.context.runtime.executeAsync(getConnectionStatusClientRequest)
                                    .then(function (connectionStatus) {
                                    isOnline_1 = connectionStatus.data.result == Entities_1.ClientEntities.ConnectionStatusType.Online ? true : false;
                                    if (!TypeExtensions_1.StringExtensions.isNullOrWhitespace(resultDialog.selectedValue) && isOnline_1) {
                                        var CustDiscountInfoRequest = new DataServiceRequests_g_1.CFZCustomer.GetCustDiscountLimitInfoRequest(resultDialog.selectedValue, true);
                                        return _this.context.runtime.executeAsync(CustDiscountInfoRequest)
                                            .then(function (response) {
                                            var splitted;
                                            var result = response.data.result.toString();
                                            var TotalBalance = 0;
                                            var discAmt = 0;
                                            var limitType = 0;
                                            var validationType = 0;
                                            result = result.replace(/,/g, '');
                                            splitted = result.split(";");
                                            if (splitted) {
                                                limitType = parseInt(splitted[1]);
                                                validationType = parseInt(splitted[2]);
                                                TotalBalance = parseFloat(splitted[4]);
                                            }
                                            if (TotalBalance != 0) {
                                                var CustDiscountUsedRequest = new DataServiceRequests_g_1.CFZCustomer.GetCustDiscountUsedRequest(resultDialog.selectedValue, limitType, validationType, false);
                                                return _this.context.runtime.executeAsync(CustDiscountUsedRequest)
                                                    .then(function (response) {
                                                    var result = response.data.result;
                                                    discAmt = (Math.abs(TotalBalance) - Math.abs(result));
                                                    var lineDiscRequest = new Commerce.GetCustomerClientRequest(resultDialog.selectedValue, _this.context.logger.getNewCorrelationId());
                                                    return _this.context.runtime.executeAsync(lineDiscRequest)
                                                        .then(function (response) {
                                                        if (!TypeExtensions_1.StringExtensions.isNullOrWhitespace(response.data.result.Name)) {
                                                            MessageDialog_1.default.show(_this.context, TypeExtensions_1.StringExtensions.format("{0} remaining discount limit is {1}.", response.data.result.Name, discAmt), "Discount Limit");
                                                            return Promise.resolve({ canceled: false, data: new CfzCustomerBalanceOperationResponse_1.default("") });
                                                        }
                                                        else {
                                                            MessageDialog_1.default.show(_this.context, TypeExtensions_1.StringExtensions.format("Customer's Remaining discount limit is {0}.", discAmt), "Discount Limit");
                                                            return Promise.resolve({ canceled: false, data: new CfzCustomerBalanceOperationResponse_1.default("") });
                                                        }
                                                    });
                                                })
                                                    .catch(function (reason) {
                                                    var error = new Dialogs_1.ShowTextInputDialogError("Something went wrong while fetching the limit", "");
                                                    return Promise.reject(error);
                                                });
                                            }
                                            return Promise.resolve({ canceled: false, data: new CfzCustomerBalanceOperationResponse_1.default("") });
                                        }).catch(function (reason) {
                                            var error = new Dialogs_1.ShowTextInputDialogError("Something went wrong while fetching the limit", "");
                                            return Promise.reject(error);
                                        });
                                    }
                                    return Promise.resolve({ canceled: false, data: new CfzCustomerBalanceOperationResponse_1.default("") });
                                });
                            }
                        }
                        return Promise.resolve({ canceled: false, data: new CfzCustomerBalanceOperationResponse_1.default("") });
                    }).catch(function (reason) {
                        _this.context.logger.logError(JSON.stringify(reason));
                        return Promise.resolve({ canceled: false, data: new CfzCustomerBalanceOperationResponse_1.default("") });
                    });
                };
                return CfzCustomerBalanceOperationRequestHandler;
            }(Operations_1.ExtensionOperationRequestHandlerBase));
            exports_1("default", CfzCustomerBalanceOperationRequestHandler);
        }
    };
});
//# sourceMappingURL=C:/Users/localadmin/Videos/StoreCommerce43/Pos/Operations/CfzCustomerBalanceOperationRequestHandler.js.map