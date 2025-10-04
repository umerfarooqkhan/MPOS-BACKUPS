System.register(["./CfzCustomerSearchOperationRequest"], function (exports_1, context_1) {
    "use strict";
    var CfzCustomerSearchOperationRequest_1, getOperationRequest;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (CfzCustomerSearchOperationRequest_1_1) {
                CfzCustomerSearchOperationRequest_1 = CfzCustomerSearchOperationRequest_1_1;
            }
        ],
        execute: function () {
            getOperationRequest = function (context, operationId, actionParameters, correlationId) {
                var operationRequest = new CfzCustomerSearchOperationRequest_1.default(correlationId);
                return Promise.resolve({
                    canceled: false,
                    data: operationRequest
                });
            };
            exports_1("default", getOperationRequest);
        }
    };
});
//# sourceMappingURL=C:/Users/localadmin/Videos/StoreCommerce43/Pos/Operations/CfzCustomerSearchOperationRequestFactory.js.map