System.register(["PosApi/Extend/RequestHandlers/CartRequestHandlers", "PosApi/Consume/Cart", "PosApi/Entities", "PosApi/TypeExtensions", "../FreedomPayDonationModule"], function (exports_1, context_1) {
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
    var CartRequestHandlers_1, Cart_1, Entities_1, TypeExtensions_1, FreedomPayDonationModule_1, GetKeyedInDonationPriceClientRequestHandlerExt;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (CartRequestHandlers_1_1) {
                CartRequestHandlers_1 = CartRequestHandlers_1_1;
            },
            function (Cart_1_1) {
                Cart_1 = Cart_1_1;
            },
            function (Entities_1_1) {
                Entities_1 = Entities_1_1;
            },
            function (TypeExtensions_1_1) {
                TypeExtensions_1 = TypeExtensions_1_1;
            },
            function (FreedomPayDonationModule_1_1) {
                FreedomPayDonationModule_1 = FreedomPayDonationModule_1_1;
            }
        ],
        execute: function () {
            GetKeyedInDonationPriceClientRequestHandlerExt = (function (_super) {
                __extends(GetKeyedInDonationPriceClientRequestHandlerExt, _super);
                function GetKeyedInDonationPriceClientRequestHandlerExt() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                GetKeyedInDonationPriceClientRequestHandlerExt.prototype.executeAsync = function (request) {
                    var _this = this;
                    this.context.logger.logInformational("Executing GetKeyedInDonationPriceClientRequestHandlerExt  for Donation Item with request " + JSON.stringify(request) + ".");
                    var getCurrentCart = new Cart_1.GetCurrentCartClientRequest(request.correlationId);
                    return this.context.runtime.executeAsync(getCurrentCart)
                        .then(function (cartResponse) {
                        var _a, _b, _c;
                        if (!TypeExtensions_1.ObjectExtensions.isNullOrUndefined(cartResponse)) {
                            if (cartResponse.canceled) {
                                return Promise.resolve({ canceled: true, data: null });
                            }
                            if (!TypeExtensions_1.ObjectExtensions.isNullOrUndefined(cartResponse)
                                && !TypeExtensions_1.ObjectExtensions.isNullOrUndefined(cartResponse.data)
                                && !TypeExtensions_1.ObjectExtensions.isNullOrUndefined(cartResponse.data.result)) {
                                var donationData = new FreedomPayDonationModule_1.default();
                                var tenderLine;
                                if (((_c = (_b = (_a = cartResponse === null || cartResponse === void 0 ? void 0 : cartResponse.data) === null || _a === void 0 ? void 0 : _a.result) === null || _b === void 0 ? void 0 : _b.TenderLines) === null || _c === void 0 ? void 0 : _c.length) > 0) {
                                    tenderLine = cartResponse.data.result.TenderLines[cartResponse.data.result.TenderLines.length - 1];
                                    if (!TypeExtensions_1.ObjectExtensions.isNullOrUndefined(tenderLine) && !TypeExtensions_1.ObjectExtensions.isNullOrUndefined(tenderLine.Authorization)) {
                                        donationData.ParseAuthorizationProperties(tenderLine === null || tenderLine === void 0 ? void 0 : tenderLine.Authorization);
                                        if (!TypeExtensions_1.ObjectExtensions.isNullOrUndefined(donationData) && donationData.ConnectorName == "FreedomPayConnector"
                                            && donationData.IsDonationEnabled && parseFloat(donationData.DonationAmount) > 0) {
                                            if (request.productId == parseFloat(donationData.DonationProductId)) {
                                                _this.context.logger.logInformational("GetKeyedInDonationPriceClientRequestHandlerExt ::Process donation for " + donationData.DonationAmount + "");
                                                var response = new Cart_1.GetKeyedInPriceClientResponse(parseFloat(donationData.DonationAmount));
                                                return Promise.resolve({
                                                    canceled: false,
                                                    data: response
                                                });
                                            }
                                        }
                                    }
                                }
                                return _this.defaultExecuteAsync(request);
                            }
                            _this.context.logger.logInformational("GetKeyedInDonationPriceClientRequestHandlerExt ::Failed to apply Donation.", request.correlationId);
                            return Promise.reject(new Entities_1.ClientEntities.ExtensionError("Failed to apply Donation."));
                        }
                        _this.context.logger.logInformational("GetKeyedInDonationPriceClientRequestHandlerExt ::Failed to apply Donation.", request.correlationId);
                        return Promise.reject(new Entities_1.ClientEntities.ExtensionError("Failed to apply Donation."));
                    });
                };
                return GetKeyedInDonationPriceClientRequestHandlerExt;
            }(CartRequestHandlers_1.GetKeyedInPriceClientRequestHandler));
            exports_1("default", GetKeyedInDonationPriceClientRequestHandlerExt);
        }
    };
});
