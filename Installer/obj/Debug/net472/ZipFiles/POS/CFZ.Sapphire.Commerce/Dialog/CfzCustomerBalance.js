System.register(["PosApi/Create/Dialogs", "PosApi/TypeExtensions", "knockout"], function (exports_1, context_1) {
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
    var Dialogs, TypeExtensions_1, knockout_1, CfzCustomerBalance;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (Dialogs_1) {
                Dialogs = Dialogs_1;
            },
            function (TypeExtensions_1_1) {
                TypeExtensions_1 = TypeExtensions_1_1;
            },
            function (knockout_1_1) {
                knockout_1 = knockout_1_1;
            }
        ],
        execute: function () {
            CfzCustomerBalance = (function (_super) {
                __extends(CfzCustomerBalance, _super);
                function CfzCustomerBalance() {
                    var _this = _super.call(this) || this;
                    _this.number = knockout_1.default.observable("");
                    _this.onBarcodeScanned = function (data) {
                        _this._automatedEntryInProgress = true;
                        _this.number(data);
                        _this._automatedEntryInProgress = false;
                    };
                    return _this;
                }
                CfzCustomerBalance.prototype.onReady = function (element) {
                    knockout_1.default.applyBindings(this, element);
                };
                CfzCustomerBalance.prototype.open = function (cardNumber) {
                    var _this = this;
                    this.number(cardNumber);
                    var promise = new Promise(function (resolve, reject) {
                        _this.resolve = resolve;
                        var option = {
                            title: "Check Balance",
                            onCloseX: _this.onCloseX.bind(_this),
                            button1: {
                                id: "Button1",
                                label: "OK",
                                isPrimary: true,
                                onClick: _this.button1ClickHandler.bind(_this)
                            },
                            button2: {
                                id: "Button2",
                                label: "Cancel",
                                onClick: _this.button2ClickHandler.bind(_this)
                            }
                        };
                        _this.openDialog(option);
                    });
                    return promise;
                };
                CfzCustomerBalance.prototype.closeDialogClicked = function () {
                    this.closeDialog();
                    this.resolvePromise("Closed");
                };
                CfzCustomerBalance.prototype.onCloseX = function () {
                    this.resolvePromise("Canceled");
                    return true;
                };
                CfzCustomerBalance.prototype.button1ClickHandler = function () {
                    this.resolvePromise(this.number());
                    return true;
                };
                CfzCustomerBalance.prototype.button2ClickHandler = function () {
                    this.resolvePromise("Canceled");
                    return true;
                };
                CfzCustomerBalance.prototype.resolvePromise = function (result) {
                    if (TypeExtensions_1.ObjectExtensions.isFunction(this.resolve)) {
                        this.resolve({
                            selectedValue: result
                        });
                        this.resolve = null;
                    }
                };
                return CfzCustomerBalance;
            }(Dialogs.ExtensionTemplatedDialogBase));
            exports_1("default", CfzCustomerBalance);
        }
    };
});
//# sourceMappingURL=C:/Users/localadmin/Videos/StoreCommerce43/Pos/Dialog/CfzCustomerBalance.js.map