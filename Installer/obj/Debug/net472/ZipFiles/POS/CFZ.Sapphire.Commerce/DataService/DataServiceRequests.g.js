System.register(["PosApi/Entities", "./DataServiceEntities.g", "PosApi/Consume/DataService"], function (exports_1, context_1) {
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
    var Entities_1, DataServiceEntities_g_1, DataService_1, CFZCustomer;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (Entities_1_1) {
                Entities_1 = Entities_1_1;
            },
            function (DataServiceEntities_g_1_1) {
                DataServiceEntities_g_1 = DataServiceEntities_g_1_1;
            },
            function (DataService_1_1) {
                DataService_1 = DataService_1_1;
            }
        ],
        execute: function () {
            exports_1("ProxyEntities", Entities_1.ProxyEntities);
            exports_1("Entities", DataServiceEntities_g_1.Entities);
            (function (CFZCustomer) {
                var sendSMSDataActionResponse = (function (_super) {
                    __extends(sendSMSDataActionResponse, _super);
                    function sendSMSDataActionResponse() {
                        return _super !== null && _super.apply(this, arguments) || this;
                    }
                    return sendSMSDataActionResponse;
                }(DataService_1.DataServiceResponse));
                CFZCustomer.sendSMSDataActionResponse = sendSMSDataActionResponse;
                var sendSMSDataActionRequest = (function (_super) {
                    __extends(sendSMSDataActionRequest, _super);
                    function sendSMSDataActionRequest(Cart, ConStatus) {
                        var _this = _super.call(this) || this;
                        _this._entitySet = "CFZCustomer";
                        _this._entityType = "CFZCustomer";
                        _this._method = "sendSMSDataAction";
                        _this._parameters = { Cart: Cart, ConStatus: ConStatus };
                        _this._isAction = true;
                        _this._returnType = null;
                        _this._isReturnTypeCollection = false;
                        return _this;
                    }
                    return sendSMSDataActionRequest;
                }(DataService_1.DataServiceRequest));
                CFZCustomer.sendSMSDataActionRequest = sendSMSDataActionRequest;
                var getTransactionDataActionResponse = (function (_super) {
                    __extends(getTransactionDataActionResponse, _super);
                    function getTransactionDataActionResponse() {
                        return _super !== null && _super.apply(this, arguments) || this;
                    }
                    return getTransactionDataActionResponse;
                }(DataService_1.DataServiceResponse));
                CFZCustomer.getTransactionDataActionResponse = getTransactionDataActionResponse;
                var getTransactionDataActionRequest = (function (_super) {
                    __extends(getTransactionDataActionRequest, _super);
                    function getTransactionDataActionRequest(Cart, ConStatus, CustCNIC) {
                        var _this = _super.call(this) || this;
                        _this._entitySet = "CFZCustomer";
                        _this._entityType = "CFZCustomer";
                        _this._method = "getTransactionDataAction";
                        _this._parameters = { Cart: Cart, ConStatus: ConStatus, CustCNIC: CustCNIC };
                        _this._isAction = true;
                        _this._returnType = null;
                        _this._isReturnTypeCollection = false;
                        return _this;
                    }
                    return getTransactionDataActionRequest;
                }(DataService_1.DataServiceRequest));
                CFZCustomer.getTransactionDataActionRequest = getTransactionDataActionRequest;
                var GetCustDiscountLimitInfoResponse = (function (_super) {
                    __extends(GetCustDiscountLimitInfoResponse, _super);
                    function GetCustDiscountLimitInfoResponse() {
                        return _super !== null && _super.apply(this, arguments) || this;
                    }
                    return GetCustDiscountLimitInfoResponse;
                }(DataService_1.DataServiceResponse));
                CFZCustomer.GetCustDiscountLimitInfoResponse = GetCustDiscountLimitInfoResponse;
                var GetCustDiscountLimitInfoRequest = (function (_super) {
                    __extends(GetCustDiscountLimitInfoRequest, _super);
                    function GetCustDiscountLimitInfoRequest(CustAccount, CheckBalance) {
                        var _this = _super.call(this) || this;
                        _this._entitySet = "CFZCustomer";
                        _this._entityType = "CFZCustomer";
                        _this._method = "GetCustDiscountLimitInfo";
                        _this._parameters = { CustAccount: CustAccount, CheckBalance: CheckBalance };
                        _this._isAction = true;
                        _this._returnType = null;
                        _this._isReturnTypeCollection = false;
                        return _this;
                    }
                    return GetCustDiscountLimitInfoRequest;
                }(DataService_1.DataServiceRequest));
                CFZCustomer.GetCustDiscountLimitInfoRequest = GetCustDiscountLimitInfoRequest;
                var GetCustDiscountUsedResponse = (function (_super) {
                    __extends(GetCustDiscountUsedResponse, _super);
                    function GetCustDiscountUsedResponse() {
                        return _super !== null && _super.apply(this, arguments) || this;
                    }
                    return GetCustDiscountUsedResponse;
                }(DataService_1.DataServiceResponse));
                CFZCustomer.GetCustDiscountUsedResponse = GetCustDiscountUsedResponse;
                var GetCustDiscountUsedRequest = (function (_super) {
                    __extends(GetCustDiscountUsedRequest, _super);
                    function GetCustDiscountUsedRequest(CustAccount, LimitType, ValidationType, CheckBalance) {
                        var _this = _super.call(this) || this;
                        _this._entitySet = "CFZCustomer";
                        _this._entityType = "CFZCustomer";
                        _this._method = "GetCustDiscountUsed";
                        _this._parameters = { CustAccount: CustAccount, LimitType: LimitType, ValidationType: ValidationType, CheckBalance: CheckBalance };
                        _this._isAction = true;
                        _this._returnType = null;
                        _this._isReturnTypeCollection = false;
                        return _this;
                    }
                    return GetCustDiscountUsedRequest;
                }(DataService_1.DataServiceRequest));
                CFZCustomer.GetCustDiscountUsedRequest = GetCustDiscountUsedRequest;
                var GetPettyExpenseLimitInfoResponse = (function (_super) {
                    __extends(GetPettyExpenseLimitInfoResponse, _super);
                    function GetPettyExpenseLimitInfoResponse() {
                        return _super !== null && _super.apply(this, arguments) || this;
                    }
                    return GetPettyExpenseLimitInfoResponse;
                }(DataService_1.DataServiceResponse));
                CFZCustomer.GetPettyExpenseLimitInfoResponse = GetPettyExpenseLimitInfoResponse;
                var GetPettyExpenseLimitInfoRequest = (function (_super) {
                    __extends(GetPettyExpenseLimitInfoRequest, _super);
                    function GetPettyExpenseLimitInfoRequest(Cart, CheckBalance) {
                        var _this = _super.call(this) || this;
                        _this._entitySet = "CFZCustomer";
                        _this._entityType = "CFZCustomer";
                        _this._method = "GetPettyExpenseLimitInfo";
                        _this._parameters = { Cart: Cart, CheckBalance: CheckBalance };
                        _this._isAction = true;
                        _this._returnType = null;
                        _this._isReturnTypeCollection = false;
                        return _this;
                    }
                    return GetPettyExpenseLimitInfoRequest;
                }(DataService_1.DataServiceRequest));
                CFZCustomer.GetPettyExpenseLimitInfoRequest = GetPettyExpenseLimitInfoRequest;
                var GetPettyExpenseUpdateResponse = (function (_super) {
                    __extends(GetPettyExpenseUpdateResponse, _super);
                    function GetPettyExpenseUpdateResponse() {
                        return _super !== null && _super.apply(this, arguments) || this;
                    }
                    return GetPettyExpenseUpdateResponse;
                }(DataService_1.DataServiceResponse));
                CFZCustomer.GetPettyExpenseUpdateResponse = GetPettyExpenseUpdateResponse;
                var GetPettyExpenseUpdateRequest = (function (_super) {
                    __extends(GetPettyExpenseUpdateRequest, _super);
                    function GetPettyExpenseUpdateRequest(Cart, CheckBalance) {
                        var _this = _super.call(this) || this;
                        _this._entitySet = "CFZCustomer";
                        _this._entityType = "CFZCustomer";
                        _this._method = "GetPettyExpenseUpdate";
                        _this._parameters = { Cart: Cart, CheckBalance: CheckBalance };
                        _this._isAction = true;
                        _this._returnType = null;
                        _this._isReturnTypeCollection = false;
                        return _this;
                    }
                    return GetPettyExpenseUpdateRequest;
                }(DataService_1.DataServiceRequest));
                CFZCustomer.GetPettyExpenseUpdateRequest = GetPettyExpenseUpdateRequest;
                var productCategoryDataActionResponse = (function (_super) {
                    __extends(productCategoryDataActionResponse, _super);
                    function productCategoryDataActionResponse() {
                        return _super !== null && _super.apply(this, arguments) || this;
                    }
                    return productCategoryDataActionResponse;
                }(DataService_1.DataServiceResponse));
                CFZCustomer.productCategoryDataActionResponse = productCategoryDataActionResponse;
                var productCategoryDataActionRequest = (function (_super) {
                    __extends(productCategoryDataActionRequest, _super);
                    function productCategoryDataActionRequest(ItemID) {
                        var _this = _super.call(this) || this;
                        _this._entitySet = "CFZCustomer";
                        _this._entityType = "CFZCustomer";
                        _this._method = "productCategoryDataAction";
                        _this._parameters = { ItemID: ItemID };
                        _this._isAction = true;
                        _this._returnType = null;
                        _this._isReturnTypeCollection = false;
                        return _this;
                    }
                    return productCategoryDataActionRequest;
                }(DataService_1.DataServiceRequest));
                CFZCustomer.productCategoryDataActionRequest = productCategoryDataActionRequest;
            })(CFZCustomer || (CFZCustomer = {}));
            exports_1("CFZCustomer", CFZCustomer);
        }
    };
});
//# sourceMappingURL=C:/Users/localadmin/Videos/StoreCommerce43/Pos/DataService/DataServiceRequests.g.js.map