System.register(["PosApi/Extend/Triggers/TransactionTriggers", "PosApi/TypeExtensions", "PosApi/Entities", "PosApi/Consume/Cart", "PosApi/Consume/Dialogs", "PosApi/Consume/Device", "../../DataService/DataServiceRequests.g", "./CFZGlobalData"], function (exports_1, context_1) {
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
    var Triggers, TypeExtensions_1, Entities_1, Cart_1, Dialogs_1, Device_1, DataServiceRequests_g_1, CFZGlobalData_1, PreEndTransactionTrigger;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (Triggers_1) {
                Triggers = Triggers_1;
            },
            function (TypeExtensions_1_1) {
                TypeExtensions_1 = TypeExtensions_1_1;
            },
            function (Entities_1_1) {
                Entities_1 = Entities_1_1;
            },
            function (Cart_1_1) {
                Cart_1 = Cart_1_1;
            },
            function (Dialogs_1_1) {
                Dialogs_1 = Dialogs_1_1;
            },
            function (Device_1_1) {
                Device_1 = Device_1_1;
            },
            function (DataServiceRequests_g_1_1) {
                DataServiceRequests_g_1 = DataServiceRequests_g_1_1;
            },
            function (CFZGlobalData_1_1) {
                CFZGlobalData_1 = CFZGlobalData_1_1;
            }
        ],
        execute: function () {
            PreEndTransactionTrigger = (function (_super) {
                __extends(PreEndTransactionTrigger, _super);
                function PreEndTransactionTrigger() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                PreEndTransactionTrigger.prototype.execute = function (options) {
                    var _this = this;
                    var cartLocal;
                    cartLocal = options.cart;
                    var cfz = new CFZGlobalData_1.default();
                    var conStatus = "";
                    if (TypeExtensions_1.ArrayExtensions.hasElements(cartLocal.CartLines) &&
                        cartLocal.CartTypeValue != Entities_1.ProxyEntities.CartType.IncomeExpense &&
                        cartLocal.CartTypeValue != Entities_1.ProxyEntities.CartType.AccountDeposit &&
                        cartLocal.CartStatusValue != Entities_1.ProxyEntities.CartStatus.Voided &&
                        cartLocal.CartStatusValue != Entities_1.ProxyEntities.CartStatus.Suspended) {
                        return this.context.runtime.executeAsync(new Cart_1.GetCurrentCartClientRequest())
                            .then(function (cartresp) {
                            cartLocal = cartresp.data.result;
                            cfz.SetCart(cartresp.data.result);
                            var getConnectionStatusClientRequest = new Device_1.GetConnectionStatusClientRequest(_this.context.logger.getNewCorrelationId());
                            return _this.context.runtime.executeAsync(getConnectionStatusClientRequest)
                                .then(function (connectionStatus) {
                                if (connectionStatus.data.result == Entities_1.ClientEntities.ConnectionStatusType.Online) {
                                    return _this.context.runtime.executeAsync(new Cart_1.GetCurrentCartClientRequest())
                                        .then(function (getCurrentCartClientResponse) {
                                        cartLocal = getCurrentCartClientResponse.data.result;
                                        if (cartLocal.DiscountAmount > 0
                                            && (!TypeExtensions_1.StringExtensions.isNullOrWhitespace(cartLocal.CustomerId))
                                            && cartLocal.AffiliationLines.length > 0) {
                                            return _this.CustomerdiscountAmount(cartLocal);
                                        }
                                        return Promise.resolve({ canceled: false });
                                    });
                                }
                                return Promise.resolve({ canceled: false });
                            })
                                .then(function () {
                                return _this.context.runtime.executeAsync(new Device_1.GetDeviceConfigurationClientRequest())
                                    .then(function (deviceConfig) {
                                    if (!Commerce.StringExtensions.isNullOrWhitespace(deviceConfig.data.result.Placement)) {
                                        if (_this.calTax(cartLocal.CartLines)) {
                                            var CustomRequest = new DataServiceRequests_g_1.CFZCustomer.getTransactionDataActionRequest(cartLocal, "PCTCODE", "");
                                            return _this.context.runtime.executeAsync(CustomRequest)
                                                .then(function (response) {
                                                if (response.data.result == "true") {
                                                    return _this.context.runtime.executeAsync(new Device_1.GetConnectionStatusClientRequest())
                                                        .then(function (connectionStatus) {
                                                        if (connectionStatus.data.result == Entities_1.ClientEntities.ConnectionStatusType.Online) {
                                                            conStatus = "Online";
                                                            return _this.callFBRFUNC(conStatus, cartLocal.TotalSalesAmount);
                                                        }
                                                        else {
                                                            if (cartLocal.ExtensionProperties.length == 0) {
                                                                conStatus = "Offline";
                                                                return _this.callFBRFUNC(conStatus, cartLocal.TotalSalesAmount);
                                                            }
                                                            else {
                                                                return Promise.resolve({ canceled: false });
                                                            }
                                                        }
                                                    });
                                                }
                                                else {
                                                    var error = new Dialogs_1.ShowTextInputDialogError("FBR PCTCODE is Missing on item", "");
                                                    return Promise.reject(error);
                                                }
                                            }).catch(function (reason) {
                                                _this.context.logger.logError("CFZ FBR PCTCODE " + JSON.stringify(reason));
                                                return Promise.reject(reason);
                                            });
                                        }
                                        else {
                                            var error = new Dialogs_1.ShowTextInputDialogError("FBR Tax is Missing on item", "");
                                            return Promise.reject(error);
                                        }
                                    }
                                    else {
                                        return Promise.resolve({ canceled: false });
                                    }
                                });
                            });
                        });
                    }
                    else if ((cartLocal.CartTypeValue == Entities_1.ProxyEntities.CartType.IncomeExpense) &&
                        (cartLocal.IncomeExpenseLines[0].AccountTypeValue == Entities_1.ProxyEntities.IncomeExpenseAccountType.Expense)) {
                        return this.context.runtime.executeAsync(new Cart_1.GetCurrentCartClientRequest())
                            .then(function (cartresp) {
                            cartLocal = cartresp.data.result;
                            cfz.SetCartPettyExpense(cartresp.data.result);
                            return _this.context.runtime.executeAsync(new Cart_1.GetCurrentCartClientRequest())
                                .then(function (getCurrentCartClientResponse) {
                                cartLocal = getCurrentCartClientResponse.data.result;
                                return _this.PettyExpenseAmount(cartLocal);
                            });
                        });
                    }
                    else {
                        return Promise.resolve({ canceled: false });
                    }
                };
                PreEndTransactionTrigger.prototype.callFBRFUNC = function (connectionStatus, totalAmount) {
                    var _this = this;
                    return this.context.runtime.executeAsync(new Commerce.GetChannelConfigurationClientRequest())
                        .then(function (DataAreaId) {
                        if (totalAmount >= 100000) {
                            return _this.sendTransactiontoFBRWithCNIC(connectionStatus);
                        }
                        else {
                            return _this.sendTransactiontoFBRWithoutCNIC(connectionStatus);
                        }
                    });
                };
                PreEndTransactionTrigger.prototype.sendTransactiontoFBRWithCNIC = function (connectionStatus) {
                    var _this = this;
                    var custCNIC;
                    custCNIC = "";
                    var cartLocalFBR;
                    return this.context.runtime.executeAsync(new Cart_1.GetCurrentCartClientRequest())
                        .then(function (getCurrentCartClientResponse) {
                        cartLocalFBR = getCurrentCartClientResponse.data.result;
                        if (!TypeExtensions_1.ObjectExtensions.isNullOrUndefined(cartLocalFBR)) {
                            var textInputDialogOptions = {
                                title: "Enter CNIC in this format ",
                                subTitle: "xxxxxxxxxxxxx",
                                label: "",
                                defaultText: "",
                                onBeforeClose: _this.onBeforeClose.bind(_this)
                            };
                            var dialogRequest = new Dialogs_1.ShowTextInputDialogClientRequest(textInputDialogOptions);
                            return _this.context.runtime.executeAsync(dialogRequest)
                                .then(function (result) {
                                if (!result.canceled) {
                                    custCNIC = result.data.result.value.trim();
                                    _this.context.logger.logInformational("Text Entered in Box: " + result.data.result.value);
                                }
                                else {
                                    return Promise.reject("");
                                }
                                var CustomRequest = new DataServiceRequests_g_1.CFZCustomer.getTransactionDataActionRequest(cartLocalFBR, connectionStatus, custCNIC);
                                return _this.context.runtime.executeAsync(CustomRequest)
                                    .then(function (response) {
                                    _this.context.logger.logWarning("Triger  CNIC " + custCNIC + "  " + response.data.result);
                                    if (TypeExtensions_1.StringExtensions.isNullOrWhitespace(response.data.result)) {
                                        var ext = [{
                                                Key: "FBRID",
                                                Value: { StringValue: "true" }
                                            }];
                                        return _this.context.runtime.executeAsync(new Commerce.SaveExtensionPropertiesOnCartClientRequest(ext))
                                            .then(function (response) {
                                            return Promise.resolve({ canceled: false });
                                        });
                                    }
                                    else {
                                        return Promise.resolve({ canceled: false });
                                    }
                                }).catch(function (reason) {
                                    _this.context.logger.logError("CFZ FBR Data.FBR Dialog: " + JSON.stringify(reason));
                                    return Promise.reject(reason);
                                });
                            }).catch(function (reason) {
                                _this.context.logger.logInformational("CNIC Exception" + JSON.stringify(reason));
                                return Promise.reject(reason);
                            });
                        }
                        return Promise.resolve({ canceled: false });
                    });
                };
                PreEndTransactionTrigger.prototype.sendTransactiontoFBRWithoutCNIC = function (connectionStatus) {
                    var _this = this;
                    var custCNIC;
                    custCNIC = "";
                    var cartLocalFBR;
                    return this.context.runtime.executeAsync(new Cart_1.GetCurrentCartClientRequest())
                        .then(function (getCurrentCartClientResponse) {
                        cartLocalFBR = getCurrentCartClientResponse.data.result;
                        if (!TypeExtensions_1.ObjectExtensions.isNullOrUndefined(cartLocalFBR)) {
                            var CustomRequest = new DataServiceRequests_g_1.CFZCustomer.getTransactionDataActionRequest(cartLocalFBR, connectionStatus, custCNIC);
                            return _this.context.runtime.executeAsync(CustomRequest)
                                .then(function (response) {
                                if (!TypeExtensions_1.StringExtensions.isNullOrWhitespace(response.data.result)) {
                                    var ext = [{
                                            Key: "FBRID",
                                            Value: { StringValue: "true" }
                                        }];
                                    return _this.context.runtime.executeAsync(new Commerce.SaveExtensionPropertiesOnCartClientRequest(ext))
                                        .then(function (response) {
                                        return Promise.resolve({ canceled: false });
                                    });
                                }
                                else {
                                    return Promise.resolve({ canceled: false });
                                }
                            }).catch(function (reason) {
                                _this.context.logger.logError("CFZ FBR Data.FBR Dialog: " + JSON.stringify(reason));
                                return Promise.reject(reason);
                            }).catch(function (reason) {
                                _this.context.logger.logError("FBR Error" + JSON.stringify(reason));
                                return Promise.reject(reason);
                            });
                        }
                        return Promise.resolve({ canceled: false });
                    });
                };
                PreEndTransactionTrigger.prototype.onBeforeClose = function (result) {
                    if (!result.canceled) {
                        if (!TypeExtensions_1.ObjectExtensions.isNullOrUndefined(result.data)) {
                            if (result.data.value === "") {
                                var error = new Dialogs_1.ShowTextInputDialogError("CNIC is Required", "");
                                return Promise.reject(error);
                            }
                            else {
                                if (result.data.value.trim().length == 13) {
                                    return Promise.resolve();
                                }
                                else {
                                    var error = new Dialogs_1.ShowTextInputDialogError("Invalid CNIC: " + result.data.value + " Please Enter Valid CNIC and try again ", "");
                                    return Promise.reject(error);
                                }
                            }
                        }
                        else {
                            return Promise.reject("");
                        }
                    }
                    else {
                        return Promise.resolve();
                    }
                };
                PreEndTransactionTrigger.prototype.calTax = function (salesline) {
                    var checkTax = true;
                    return checkTax;
                };
                PreEndTransactionTrigger.prototype.CustomerdiscountAmount = function (cartLocal) {
                    var _this = this;
                    var errorOccurred = false;
                    var limitType = 0;
                    var i = 0;
                    var validationType = 0;
                    var remainingBalance = 0;
                    var TotalBalance = 0;
                    var error = "";
                    var msg = "";
                    var employeeDiscountAmount = 0;
                    var CustDiscountInfoRequest = new DataServiceRequests_g_1.CFZCustomer.GetCustDiscountLimitInfoRequest(cartLocal.CustomerId, true);
                    return this.context.runtime.executeAsync(CustDiscountInfoRequest)
                        .then(function (response) {
                        var splitted;
                        var result = response.data.result.toString();
                        result = result.replace(/,/g, '');
                        splitted = result.split(";");
                        cartLocal.CartLines.forEach(function (line) {
                            line.DiscountLines.forEach(function (Disline) {
                                if (Disline.OfferName == "Employee Discount") {
                                    employeeDiscountAmount = employeeDiscountAmount + Disline.EffectiveAmount;
                                }
                            });
                        });
                        if (splitted) {
                            msg = splitted[0];
                            limitType = parseInt(splitted[1]);
                            validationType = parseInt(splitted[2]);
                            remainingBalance = parseFloat(splitted[3]);
                            TotalBalance = parseFloat(splitted[4]);
                            if (remainingBalance == 0 && employeeDiscountAmount > 0) {
                                errorOccurred = true;
                                error = "Employee discount limit is zero, so discount cannot be given.";
                            }
                            _this.context.logger.logError("Result " + JSON.stringify(remainingBalance));
                        }
                        if (!errorOccurred && remainingBalance > 0) {
                            var CustDiscountUsedRequest = new DataServiceRequests_g_1.CFZCustomer.GetCustDiscountUsedRequest(cartLocal.CustomerId, limitType, validationType, false);
                            return _this.context.runtime.executeAsync(CustDiscountUsedRequest)
                                .then(function (response) {
                                var result = response.data.result;
                                var totalDiscount = 0;
                                var currDiscount = 0;
                                var DiscAmt = employeeDiscountAmount;
                                if (validationType == 0) {
                                    result = result * -1;
                                    currDiscount = DiscAmt * -1;
                                    totalDiscount = result + currDiscount;
                                }
                                else if (validationType == 1) {
                                    for (i = 0; i < cartLocal.CartLines.length; i++) {
                                        if (!cartLocal.CartLines[i].IsVoided) {
                                            currDiscount += cartLocal.CartLines[i].Quantity;
                                        }
                                    }
                                    currDiscount = currDiscount * -1;
                                    totalDiscount = result + currDiscount;
                                }
                                if (currDiscount < 0) {
                                    if (Math.abs(totalDiscount) > TotalBalance) {
                                        errorOccurred = true;
                                        error += "Employee Discount on this transaction is " + Math.abs((totalDiscount - result)).toString() + ", whereas remaining limit is " + (Math.abs(TotalBalance) - Math.abs(result)).toFixed(2);
                                    }
                                }
                                if (errorOccurred) {
                                    _this.context.logger.logError("Error in trigger.");
                                    var extensionErrorLog = new Entities_1.ClientEntities.ExtensionError(error);
                                    return Promise.reject(extensionErrorLog);
                                }
                                else {
                                    return Promise.resolve({ canceled: false });
                                }
                            })
                                .catch(function (reason) {
                                _this.context.logger.logError("Discount Message: " + JSON.stringify(reason));
                                return Promise.reject(reason);
                            });
                        }
                        else {
                            var extensionErrorLog = new Entities_1.ClientEntities.ExtensionError(error);
                            return Promise.reject(extensionErrorLog);
                        }
                    }).catch(function (reason) {
                        _this.context.logger.logError("Discount Message: " + JSON.stringify(reason));
                        return Promise.reject(reason);
                    });
                };
                PreEndTransactionTrigger.prototype.PettyExpenseAmount = function (cartLocal) {
                    var CustDiscountInfoRequest = new DataServiceRequests_g_1.CFZCustomer.GetPettyExpenseLimitInfoRequest(cartLocal, 1);
                    return this.context.runtime.executeAsync(CustDiscountInfoRequest)
                        .then(function (response) {
                        var result = response.data.result.toString();
                        if (TypeExtensions_1.StringExtensions.isNullOrWhitespace(result)) {
                            return Promise.resolve({ canceled: false });
                        }
                        else {
                            var extensionErrorLog = new Entities_1.ClientEntities.ExtensionError(result);
                            return Promise.reject(extensionErrorLog);
                        }
                    }).catch(function (reason) {
                        return Promise.reject(reason);
                    });
                };
                return PreEndTransactionTrigger;
            }(Triggers.PreEndTransactionTrigger));
            exports_1("default", PreEndTransactionTrigger);
        }
    };
});
//# sourceMappingURL=C:/Users/localadmin/Videos/StoreCommerce43/Pos/Extend/CFZTransactionTrigger/PreEndTransactionTrigger.js.map