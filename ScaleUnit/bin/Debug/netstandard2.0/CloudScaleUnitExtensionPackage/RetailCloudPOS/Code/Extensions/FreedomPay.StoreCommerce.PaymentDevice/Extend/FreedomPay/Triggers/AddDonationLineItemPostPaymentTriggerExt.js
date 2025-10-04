System.register(["PosApi/Extend/Triggers/PaymentTriggers", "PosApi/Consume/Cart", "../FreedomPayDonationModule", "PosApi/TypeExtensions"], function (exports_1, context_1) {
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
    var Triggers, Cart_1, FreedomPayDonationModule_1, TypeExtensions_1, AddDonationLineItemPostPaymentTriggerExt;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (Triggers_1) {
                Triggers = Triggers_1;
            },
            function (Cart_1_1) {
                Cart_1 = Cart_1_1;
            },
            function (FreedomPayDonationModule_1_1) {
                FreedomPayDonationModule_1 = FreedomPayDonationModule_1_1;
            },
            function (TypeExtensions_1_1) {
                TypeExtensions_1 = TypeExtensions_1_1;
            }
        ],
        execute: function () {
            AddDonationLineItemPostPaymentTriggerExt = (function (_super) {
                __extends(AddDonationLineItemPostPaymentTriggerExt, _super);
                function AddDonationLineItemPostPaymentTriggerExt() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                AddDonationLineItemPostPaymentTriggerExt.prototype.execute = function (options) {
                    var _this = this;
                    var _a, _b;
                    this.context.logger.logInformational("Executing AddDonationLineItemPostPaymentTriggerExt with options " + JSON.stringify(options) + ".");
                    var correlationId = this.context.logger.getNewCorrelationId();
                    try {
                        var donationData = new FreedomPayDonationModule_1.default();
                        var tenderLine;
                        if (((_b = (_a = options.cart) === null || _a === void 0 ? void 0 : _a.TenderLines) === null || _b === void 0 ? void 0 : _b.length) > 0) {
                            tenderLine = options.cart.TenderLines[options.cart.TenderLines.length - 1];
                            if (!TypeExtensions_1.ObjectExtensions.isNullOrUndefined(tenderLine) && !TypeExtensions_1.ObjectExtensions.isNullOrUndefined(tenderLine.Authorization)) {
                                donationData.ParseAuthorizationProperties(tenderLine === null || tenderLine === void 0 ? void 0 : tenderLine.Authorization);
                                if (!TypeExtensions_1.ObjectExtensions.isNullOrUndefined(donationData) && donationData.ConnectorName == "FreedomPayConnector"
                                    && donationData.IsDonationEnabled && parseFloat(donationData.DonationAmount) > 0) {
                                    var donationAmount = parseFloat(donationData.DonationAmount);
                                    var productId = parseFloat(donationData.DonationProductId);
                                    var productItemId = donationData.DonationItemId;
                                    var proBeh = {
                                        IsNegativeQuantityAllowed: false,
                                        HasSerialNumber: false,
                                        IsDiscountAllowed: false,
                                        IsManualDiscountAllowed: false,
                                        IsKitDisassemblyAllowed: false,
                                        IsReturnAllowed: false,
                                        IsSaleAtPhysicalStoresAllowed: false,
                                        IsZeroSalePriceAllowed: true,
                                        KeyInPriceValue: donationAmount,
                                        KeyInQuantityValue: 1,
                                        MustKeyInComment: false,
                                        MustPrintIndividualShelfLabelsForVariants: false,
                                        MustPromptForSerialNumberOnlyAtSale: false,
                                        MustWeighProductAtSale: false,
                                        ValidFromDateForSaleAtPhysicalStores: undefined,
                                        ValidToDateForSaleAtPhysicalStores: undefined,
                                        IsStorageDimensionGroupLocationActive: false,
                                        IsStorageDimensionGroupLocationAllowBlankReceiptEnabled: false,
                                        AllowNegativePhysicalInventory: false,
                                        IsStockedProduct: false
                                    };
                                    var pro = [{
                                            productId: productId,
                                            product: {
                                                RecordId: productId,
                                                ItemId: productItemId,
                                                ProductTypeValue: 4,
                                                BasePrice: donationAmount,
                                                AdjustedPrice: donationAmount,
                                                Price: donationAmount,
                                                Name: "Donation",
                                                Behavior: proBeh
                                            },
                                            quantity: 1,
                                        }];
                                    this.context.logger.logInformational("Executing AddDonationLineItemPostPaymentTriggerExt for ProductId: " + productId + " and ProductItemId." + productItemId + " and DonationAmount: " + donationAmount + " ");
                                    var addCartLineRequest = new Cart_1.AddItemToCartOperationRequest(pro, correlationId);
                                    this.context.runtime.executeAsync(addCartLineRequest).then(function (result) {
                                        return Promise.resolve();
                                    }).catch(function (reason) {
                                        _this.context.logger.logError("AddDonationLineItemPostPaymentTriggerExt: Adding item to cart failed. Error: " + JSON.stringify(reason));
                                    });
                                }
                            }
                        }
                    }
                    catch (error) {
                        this.context.logger.logInformational("Error Executing AddDonationLineItemPostPaymentTriggerExt with error " + error + ".");
                        return Promise.resolve();
                    }
                    return Promise.resolve();
                };
                return AddDonationLineItemPostPaymentTriggerExt;
            }(Triggers.PostPaymentTrigger));
            exports_1("default", AddDonationLineItemPostPaymentTriggerExt);
        }
    };
});
