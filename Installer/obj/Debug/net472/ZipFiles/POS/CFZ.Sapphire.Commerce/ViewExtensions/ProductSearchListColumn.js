System.register(["../DataService/DataServiceRequests.g", "../Extend/CFZTransactionTrigger/CfzGlobalData"], function (exports_1, context_1) {
    "use strict";
    var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
    var __generator = (this && this.__generator) || function (thisArg, body) {
        var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f) throw new TypeError("Generator is already executing.");
            while (_) try {
                if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
                if (y = 0, t) op = [op[0] & 2, t.value];
                switch (op[0]) {
                    case 0: case 1: t = op; break;
                    case 4: _.label++; return { value: op[1], done: false };
                    case 5: _.label++; y = op[1]; op = [0]; continue;
                    case 7: op = _.ops.pop(); _.trys.pop(); continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                        if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                        if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                        if (t[2]) _.ops.pop();
                        _.trys.pop(); continue;
                }
                op = body.call(thisArg, _);
            } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
            if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
        }
    };
    var DataServiceRequests_g_1, CfzGlobalData_1;
    var __moduleName = context_1 && context_1.id;
    function clientFunction(itemid, context) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, updateCustomer(itemid, context)];
                    case 1: return [2, _a.sent()];
                }
            });
        });
    }
    function updateCustomer(itemid, context) {
        return __awaiter(this, void 0, void 0, function () {
            var CustomRequest, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        CustomRequest = new DataServiceRequests_g_1.CFZCustomer.productCategoryDataActionRequest(itemid);
                        return [4, context.runtime.executeAsync(CustomRequest)];
                    case 1:
                        response = _a.sent();
                        CfzGlobalData_1.default.category = response.data.result;
                        return [2, CfzGlobalData_1.default.category];
                }
            });
        });
    }
    return {
        setters: [
            function (DataServiceRequests_g_1_1) {
                DataServiceRequests_g_1 = DataServiceRequests_g_1_1;
            },
            function (CfzGlobalData_1_1) {
                CfzGlobalData_1 = CfzGlobalData_1_1;
            }
        ],
        execute: function () {
            exports_1("default", (function (context) {
                return [
                    {
                        title: "Product Number",
                        computeValue: function (row) {
                            return row.ItemId;
                        },
                        ratio: 15,
                        collapseOrder: 5,
                        minWidth: 60,
                        isRightAligned: false
                    }, {
                        title: "Product Name",
                        computeValue: function (row) {
                            return row.Name;
                        },
                        ratio: 30,
                        collapseOrder: 4,
                        minWidth: 70,
                        isRightAligned: false
                    }, {
                        title: "Price",
                        computeValue: function (row) {
                            return row.Price;
                        },
                        ratio: 15,
                        collapseOrder: 3,
                        minWidth: 40,
                        isRightAligned: false
                    }, {
                        title: "Rating",
                        computeValue: function (row) {
                            if (row.TotalRatings > 0) {
                                return row.AverageRating.toFixed(2) + " (" + row.TotalRatings + ")";
                            }
                            else {
                                return "";
                            }
                        },
                        ratio: 20,
                        collapseOrder: 2,
                        minWidth: 40,
                        isRightAligned: false
                    }, {
                        title: "Category",
                        computeValue: function (row) {
                            if (CfzGlobalData_1.default.itemIDs.some(function (item) { return item.indexOf(row.ItemId) > -1; })) {
                                return CfzGlobalData_1.default.category;
                            }
                            else {
                                clientFunction(row.ItemId, context).then(function (p) {
                                    CfzGlobalData_1.default.category = p;
                                });
                                return CfzGlobalData_1.default.category;
                            }
                        },
                        ratio: 20,
                        collapseOrder: 1,
                        minWidth: 40,
                        isRightAligned: false
                    }
                ];
            }));
        }
    };
});
//# sourceMappingURL=C:/Users/localadmin/Videos/StoreCommerce43/Pos/ViewExtensions/ProductSearchListColumn.js.map