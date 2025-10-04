System.register(["PosApi/TypeExtensions"], function (exports_1, context_1) {
    "use strict";
    var TypeExtensions_1, CfzGlobalData;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (TypeExtensions_1_1) {
                TypeExtensions_1 = TypeExtensions_1_1;
            }
        ],
        execute: function () {
            CfzGlobalData = (function () {
                function CfzGlobalData() {
                }
                CfzGlobalData.SetdiscountAmount = function (TotalDiscount) {
                    CfzGlobalData.totalDiscount = TotalDiscount;
                };
                CfzGlobalData.prototype.SetCart = function (Cart) {
                    this._selectedCartLines = Cart.CartLines;
                    if (TypeExtensions_1.ArrayExtensions.hasElements(this._selectedCartLines)) {
                        CfzGlobalData.selectedCart = Cart;
                    }
                    else {
                        CfzGlobalData.selectedCart = null;
                    }
                };
                CfzGlobalData.prototype.SetCartPettyExpense = function (Cart) {
                    this._selectedIELines = Cart.IncomeExpenseLines;
                    if (TypeExtensions_1.ArrayExtensions.hasElements(this._selectedIELines)) {
                        CfzGlobalData.selectedCart = Cart;
                    }
                    else {
                        CfzGlobalData.selectedCart = null;
                    }
                };
                CfzGlobalData.SetCardtenderLine = function (TenderLine) {
                    CfzGlobalData.cardtenderLine = TenderLine;
                };
                CfzGlobalData.itemIDs = [];
                return CfzGlobalData;
            }());
            exports_1("default", CfzGlobalData);
        }
    };
});
//# sourceMappingURL=C:/Users/localadmin/Videos/StoreCommerce43/Pos/Extend/CFZTransactionTrigger/CfzGlobalData.js.map