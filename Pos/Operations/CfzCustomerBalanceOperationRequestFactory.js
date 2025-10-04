System.register(["./CfzCustomerBalanceOperationRequest"], function (exports_1, context_1) {
    "use strict";
    var CfzCustomerBalanceOperationRequest_1, getOperationRequest;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (CfzCustomerBalanceOperationRequest_1_1) {
                CfzCustomerBalanceOperationRequest_1 = CfzCustomerBalanceOperationRequest_1_1;
            }
        ],
        execute: function () {
            getOperationRequest = function (context, operationId, actionParameters, correlationId) {
                var operationRequest = new CfzCustomerBalanceOperationRequest_1.default(correlationId);
                return Promise.resolve({
                    canceled: false,
                    data: operationRequest
                });
            };
            exports_1("default", getOperationRequest);
        }
    };
});
//# sourceMappingURL=C:/Users/localadmin/Videos/StoreCommerce43/Pos/Operations/CfzCustomerBalanceOperationRequestFactory.js.map