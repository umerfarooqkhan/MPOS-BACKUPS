System.register(["PosApi/Create/RequestHandlers"], function (exports_1, context_1) {
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
    var RequestHandlers_1, CfzCustomerSearchOperationResponse;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (RequestHandlers_1_1) {
                RequestHandlers_1 = RequestHandlers_1_1;
            }
        ],
        execute: function () {
            CfzCustomerSearchOperationResponse = (function (_super) {
                __extends(CfzCustomerSearchOperationResponse, _super);
                function CfzCustomerSearchOperationResponse(customerId) {
                    var _this = _super.call(this) || this;
                    _this.customerId = customerId;
                    return _this;
                }
                return CfzCustomerSearchOperationResponse;
            }(RequestHandlers_1.Response));
            exports_1("default", CfzCustomerSearchOperationResponse);
        }
    };
});
//# sourceMappingURL=C:/Users/localadmin/Videos/StoreCommerce43/Pos/Operations/CfzCustomerSearchOperationResponse.js.map