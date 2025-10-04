System.register(["PosApi/Extend/Triggers/OperationTriggers", "PosApi/Consume/Cart", "./CfzGlobalData"], function (exports_1, context_1) {
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
    var Triggers, Cart_1, CfzGlobalData_1, PreOperationTrigger;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (Triggers_1) {
                Triggers = Triggers_1;
            },
            function (Cart_1_1) {
                Cart_1 = Cart_1_1;
            },
            function (CfzGlobalData_1_1) {
                CfzGlobalData_1 = CfzGlobalData_1_1;
            }
        ],
        execute: function () {
            PreOperationTrigger = (function (_super) {
                __extends(PreOperationTrigger, _super);
                function PreOperationTrigger() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                PreOperationTrigger.prototype.execute = function (options) {
                    var cartLocal;
                    if (options.operationRequest.operationId === 311) {
                        return this.context.runtime.executeAsync(new Cart_1.GetCurrentCartClientRequest())
                            .then(function (cartresp) {
                            cartLocal = cartresp.data.result;
                            CfzGlobalData_1.default.SetdiscountAmount(cartLocal.DiscountAmount);
                            return Promise.resolve({ canceled: false });
                        });
                    }
                    else {
                        return Promise.resolve({ canceled: false });
                    }
                };
                return PreOperationTrigger;
            }(Triggers.PreOperationTrigger));
            exports_1("default", PreOperationTrigger);
        }
    };
});
//# sourceMappingURL=C:/Users/localadmin/Videos/StoreCommerce43/Pos/Extend/CFZTransactionTrigger/PreOperationTrigger.js.map