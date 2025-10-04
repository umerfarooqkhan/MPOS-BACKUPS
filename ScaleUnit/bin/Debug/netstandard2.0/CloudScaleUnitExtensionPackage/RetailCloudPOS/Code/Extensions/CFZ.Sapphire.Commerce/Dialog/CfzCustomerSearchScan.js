System.register(["knockout", "PosApi/Create/Dialogs", "PosApi/TypeExtensions"], function (exports_1, context_1) {
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
    var knockout_1, Dialogs, TypeExtensions_1, CfzCustomerSearchScan;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (knockout_1_1) {
                knockout_1 = knockout_1_1;
            },
            function (Dialogs_1) {
                Dialogs = Dialogs_1;
            },
            function (TypeExtensions_1_1) {
                TypeExtensions_1 = TypeExtensions_1_1;
            }
        ],
        execute: function () {
            CfzCustomerSearchScan = (function (_super) {
                __extends(CfzCustomerSearchScan, _super);
                function CfzCustomerSearchScan() {
                    var _this = _super.call(this) || this;
                    _this.number = knockout_1.default.observable("");
                    _this.onBarcodeScanned = function (data) {
                        _this._automatedEntryInProgress = true;
                        _this.number(data);
                        _this._automatedEntryInProgress = false;
                    };
                    return _this;
                }
                CfzCustomerSearchScan.prototype.onReady = function (element) {
                    knockout_1.default.applyBindings(this, element);
                };
                CfzCustomerSearchScan.prototype.open = function (cardNumber) {
                    var _this = this;
                    this.number(cardNumber);
                    var promise = new Promise(function (resolve, reject) {
                        _this.resolve = resolve;
                        var option = {
                            title: "Add privilege card",
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
                CfzCustomerSearchScan.prototype.closeDialogClicked = function () {
                    this.closeDialog();
                    this.resolvePromise("Closed");
                };
                CfzCustomerSearchScan.prototype.onCloseX = function () {
                    this.resolvePromise("Closed");
                    return true;
                };
                CfzCustomerSearchScan.prototype.button1ClickHandler = function () {
                    this.resolvePromise(this.number());
                    return true;
                };
                CfzCustomerSearchScan.prototype.button2ClickHandler = function () {
                    this.resolvePromise("Canceled");
                    return true;
                };
                CfzCustomerSearchScan.prototype.resolvePromise = function (result) {
                    if (TypeExtensions_1.ObjectExtensions.isFunction(this.resolve)) {
                        this.resolve({
                            selectedValue: result
                        });
                        this.resolve = null;
                    }
                };
                return CfzCustomerSearchScan;
            }(Dialogs.ExtensionTemplatedDialogBase));
            exports_1("default", CfzCustomerSearchScan);
        }
    };
});
//# sourceMappingURL=C:/Users/localadmin/Videos/StoreCommerce43/Pos/Dialog/CfzCustomerSearchScan.js.map