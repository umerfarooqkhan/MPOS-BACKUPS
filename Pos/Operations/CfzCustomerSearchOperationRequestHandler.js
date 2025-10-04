System.register(["PosApi/TypeExtensions", "PosApi/Consume/Cart", "PosApi/Create/Operations", "./CfzCustomerSearchOperationRequest", "./CfzCustomerSearchOperationResponse", "../Dialog/CfzCustomerSearchScan", "knockout"], function (exports_1, context_1) {
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
    var TypeExtensions_1, Cart_1, Operations_1, CfzCustomerSearchOperationRequest_1, CfzCustomerSearchOperationResponse_1, CfzCustomerSearchScan_1, knockout_1, CfzCustomerSearchOperationRequestHandler;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (TypeExtensions_1_1) {
                TypeExtensions_1 = TypeExtensions_1_1;
            },
            function (Cart_1_1) {
                Cart_1 = Cart_1_1;
            },
            function (Operations_1_1) {
                Operations_1 = Operations_1_1;
            },
            function (CfzCustomerSearchOperationRequest_1_1) {
                CfzCustomerSearchOperationRequest_1 = CfzCustomerSearchOperationRequest_1_1;
            },
            function (CfzCustomerSearchOperationResponse_1_1) {
                CfzCustomerSearchOperationResponse_1 = CfzCustomerSearchOperationResponse_1_1;
            },
            function (CfzCustomerSearchScan_1_1) {
                CfzCustomerSearchScan_1 = CfzCustomerSearchScan_1_1;
            },
            function (knockout_1_1) {
                knockout_1 = knockout_1_1;
            }
        ],
        execute: function () {
            CfzCustomerSearchOperationRequestHandler = (function (_super) {
                __extends(CfzCustomerSearchOperationRequestHandler, _super);
                function CfzCustomerSearchOperationRequestHandler() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                CfzCustomerSearchOperationRequestHandler.prototype.supportedRequestType = function () {
                    return CfzCustomerSearchOperationRequest_1.default;
                };
                CfzCustomerSearchOperationRequestHandler.prototype.executeAsync = function (request) {
                    var _this = this;
                    var customerSearchScanDialog = new CfzCustomerSearchScan_1.default();
                    this.dialogResult = knockout_1.default.observable("");
                    return customerSearchScanDialog.open("").then(function (resultDialog) {
                        if (!TypeExtensions_1.ObjectExtensions.isNullOrUndefined(resultDialog)) {
                            _this.dialogResult(resultDialog.selectedValue);
                            _this.context.logger.logInformational("Text Entered in Box: " + resultDialog.selectedValue);
                            if (resultDialog.selectedValue != 'Canceled') {
                                return _this.context.runtime.executeAsync(new Cart_1.SetCustomerOnCartOperationRequest(request.correlationId, resultDialog.selectedValue))
                                    .then(function (result) {
                                    if (!result.canceled && !TypeExtensions_1.ObjectExtensions.isNullOrUndefined(result)) {
                                        return Promise.resolve({ canceled: false, data: new CfzCustomerSearchOperationResponse_1.default("") });
                                    }
                                    return Promise.resolve({ canceled: false, data: new CfzCustomerSearchOperationResponse_1.default("") });
                                });
                            }
                        }
                        return Promise.resolve({ canceled: false, data: new CfzCustomerSearchOperationResponse_1.default("") });
                    }).catch(function (reason) {
                        _this.context.logger.logError(JSON.stringify(reason));
                        return Promise.resolve({ canceled: false, data: new CfzCustomerSearchOperationResponse_1.default("") });
                    });
                };
                return CfzCustomerSearchOperationRequestHandler;
            }(Operations_1.ExtensionOperationRequestHandlerBase));
            exports_1("default", CfzCustomerSearchOperationRequestHandler);
        }
    };
});
//# sourceMappingURL=C:/Users/localadmin/Videos/StoreCommerce43/Pos/Operations/CfzCustomerSearchOperationRequestHandler.js.map