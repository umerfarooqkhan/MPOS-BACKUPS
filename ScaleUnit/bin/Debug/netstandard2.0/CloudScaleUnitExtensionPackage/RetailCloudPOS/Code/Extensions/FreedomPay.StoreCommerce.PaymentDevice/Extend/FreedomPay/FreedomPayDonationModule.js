System.register(["PosApi/TypeExtensions"], function (exports_1, context_1) {
    "use strict";
    var TypeExtensions_1, FreedomPayDonationModule;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (TypeExtensions_1_1) {
                TypeExtensions_1 = TypeExtensions_1_1;
            }
        ],
        execute: function () {
            FreedomPayDonationModule = (function () {
                function FreedomPayDonationModule() {
                    this.resetFields();
                }
                FreedomPayDonationModule.prototype.resetFields = function () {
                    this.IsDonationEnabled = '';
                    this.DonationAmount = '';
                    this.DonationProductId = '';
                    this.DonationItemId = '';
                    this.ConnectorName = '';
                };
                FreedomPayDonationModule.prototype.ParseAuthorizationProperties = function (authorizationXml) {
                    var startIdx = authorizationXml.indexOf('[<') + 1;
                    var endIdx = authorizationXml.lastIndexOf(']');
                    var xmlContent = authorizationXml.substring(startIdx, endIdx);
                    if (TypeExtensions_1.ObjectExtensions.isNullOrUndefined(authorizationXml)) {
                        return this;
                    }
                    this.resetFields();
                    var parser = new DOMParser();
                    var xmlDoc = parser.parseFromString(xmlContent, 'application/xml');
                    var paymentProperties = Array.from(xmlDoc.getElementsByTagName('PaymentProperty'));
                    for (var _i = 0, paymentProperties_1 = paymentProperties; _i < paymentProperties_1.length; _i++) {
                        var paymentProperty = paymentProperties_1[_i];
                        var nameElement = paymentProperty.getElementsByTagName('Name')[0];
                        var storedStringValueElement = paymentProperty.getElementsByTagName('StoredStringValue')[0];
                        if (nameElement && storedStringValueElement) {
                            var name_1 = nameElement.textContent;
                            var storedStringValue = storedStringValueElement.textContent;
                            switch (name_1) {
                                case 'DonationAmount':
                                    this.DonationAmount = storedStringValue;
                                    break;
                                case 'IsDonationEnabled':
                                    this.IsDonationEnabled = storedStringValue;
                                    break;
                                case 'DonationProductId':
                                    this.DonationProductId = storedStringValue;
                                    break;
                                case 'DonationItemId':
                                    this.DonationItemId = storedStringValue;
                                    break;
                                case 'ConnectorName':
                                    this.ConnectorName = storedStringValue;
                                    break;
                                default:
                            }
                        }
                    }
                    return this;
                };
                return FreedomPayDonationModule;
            }());
            exports_1("default", FreedomPayDonationModule);
        }
    };
});
