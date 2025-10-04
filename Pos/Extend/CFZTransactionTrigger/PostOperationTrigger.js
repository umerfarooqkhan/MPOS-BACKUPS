System.register(["PosApi/Extend/Triggers/OperationTriggers", "PosApi/Entities", "../../DataService/DataServiceRequests.g", "PosApi/TypeExtensions", "PosApi/Consume/Device", "PosApi/Consume/Cart", "./CfzGlobalData"], function (exports_1, context_1) {
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
    var Triggers, Entities_1, DataServiceRequests_g_1, TypeExtensions_1, Device_1, Cart_1, CfzGlobalData_1, PostOperationTrigger;
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
            function (TypeExtensions_1_1) {
                TypeExtensions_1 = TypeExtensions_1_1;
            },
            function (Device_1_1) {
                Device_1 = Device_1_1;
            },
            function (Cart_1_1) {
                Cart_1 = Cart_1_1;
            },
            function (CfzGlobalData_1_1) {
                CfzGlobalData_1 = CfzGlobalData_1_1;
            }
        ],
        execute: function () {
            PostOperationTrigger = (function (_super) {
                __extends(PostOperationTrigger, _super);
                function PostOperationTrigger() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                PostOperationTrigger.prototype.execute = function (options) {
                    var _this = this;
                    var cart;
                    if (options.operationRequest.operationId === 311) {
                        var isOnline_1 = false;
                        var getConnectionStatusClientRequest = new Device_1.GetConnectionStatusClientRequest(this.context.logger.getNewCorrelationId());
                        return this.context.runtime.executeAsync(getConnectionStatusClientRequest)
                            .then(function (connectionStatus) {
                            isOnline_1 = connectionStatus.data.result == Entities_1.ClientEntities.ConnectionStatusType.Online ? true : false;
                            return _this.context.runtime.executeAsync(new Cart_1.GetCurrentCartClientRequest())
                                .then(function (cartresp) {
                                var cart = cartresp.data.result;
                                if (!TypeExtensions_1.StringExtensions.isNullOrWhitespace(cart.CustomerId) && isOnline_1 && cart.TotalManualDiscountAmount == 0) {
                                    var CustDiscountInfoRequest = new DataServiceRequests_g_1.CFZCustomer.GetCustDiscountLimitInfoRequest(cart.CustomerId, true);
                                    return _this.context.runtime.executeAsync(CustDiscountInfoRequest)
                                        .then(function (response) {
                                        var discountAmount = CfzGlobalData_1.default.totalDiscount;
                                        var discountLimit = response.data.result;
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
                                            var CustDiscountUsedRequest = new DataServiceRequests_g_1.CFZCustomer.GetCustDiscountUsedRequest(cart.CustomerId, limitType, validationType, false);
                                            return _this.context.runtime.executeAsync(CustDiscountUsedRequest)
                                                .then(function (response) {
                                                var result = response.data.result;
                                                discAmt = (Math.abs(TotalBalance) - Math.abs(result));
                                                if (discountAmount > discAmt) {
                                                    if (discAmt > 0) {
                                                        var lineDiscRequest = new Commerce.TotalDiscountAmountOperationRequest(cart, _this.context.logger.getNewCorrelationId(), discAmt);
                                                        return _this.context.runtime.executeAsync(lineDiscRequest)
                                                            .then(function (result) {
                                                            return Promise.resolve();
                                                        });
                                                    }
                                                    else {
                                                        return Promise.resolve();
                                                    }
                                                }
                                                else {
                                                    return Promise.resolve();
                                                }
                                            })
                                                .catch(function (reason) {
                                                return Promise.reject(reason);
                                            });
                                        }
                                        return Promise.resolve();
                                    }).catch(function (reason) {
                                        return Promise.reject(reason);
                                    });
                                }
                                return Promise.resolve();
                            });
                        });
                    }
                    return Promise.resolve();
                };
                return PostOperationTrigger;
            }(Triggers.PostOperationTrigger));
            exports_1("default", PostOperationTrigger);
        }
    };
});
//# sourceMappingURL=C:/Users/localadmin/Videos/StoreCommerce43/Pos/Extend/CFZTransactionTrigger/PostOperationTrigger.js.map