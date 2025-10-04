System.register(["PosApi/Extend/Triggers/CustomerTriggers", "PosApi/TypeExtensions"], function (exports_1, context_1) {
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
    var Triggers, TypeExtensions_1, PostCustomerSearchTrigger;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (Triggers_1) {
                Triggers = Triggers_1;
            },
            function (TypeExtensions_1_1) {
                TypeExtensions_1 = TypeExtensions_1_1;
            }
        ],
        execute: function () {
            PostCustomerSearchTrigger = (function (_super) {
                __extends(PostCustomerSearchTrigger, _super);
                function PostCustomerSearchTrigger() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                PostCustomerSearchTrigger.prototype.execute = function (options) {
                    var _this = this;
                    this.indexssToRemoved = [];
                    if (options.customers.length > 0) {
                        return this.updateCustomer(options.customers).then(function () {
                            var newIndex = 0;
                            _this.indexssToRemoved.forEach(function (index) {
                                index = index - newIndex;
                                options.customers.splice(index, 1);
                                newIndex++;
                            });
                            return Promise.resolve();
                        });
                    }
                    else {
                        return Promise.resolve();
                    }
                };
                PostCustomerSearchTrigger.prototype.updateCustomer = function (_list) {
                    return __awaiter(this, void 0, void 0, function () {
                        var i;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    i = 0;
                                    i = 0;
                                    _a.label = 1;
                                case 1:
                                    if (!(i < _list.length)) return [3, 4];
                                    return [4, this.getList(_list[i].AccountNumber, i)];
                                case 2:
                                    _a.sent();
                                    _a.label = 3;
                                case 3:
                                    i++;
                                    return [3, 1];
                                case 4: return [2];
                            }
                        });
                    });
                };
                PostCustomerSearchTrigger.prototype.getList = function (_custAccount, _index) {
                    return __awaiter(this, void 0, void 0, function () {
                        var lineDiscRequest;
                        var _this = this;
                        return __generator(this, function (_a) {
                            lineDiscRequest = new Commerce.GetCustomerClientRequest(_custAccount, this.context.logger.getNewCorrelationId());
                            return [2, this.context.runtime.executeAsync(lineDiscRequest)
                                    .then(function (response) {
                                    if (response.data.result != null) {
                                        var result = response.data.result.CustomerGroup;
                                        if (!TypeExtensions_1.StringExtensions.isNullOrWhitespace(result)) {
                                            if (result.toUpperCase() == "CG008" || result.toUpperCase() == "30") {
                                                _this.indexssToRemoved.push(_index);
                                            }
                                        }
                                    }
                                    return Promise.resolve();
                                })];
                        });
                    });
                };
                return PostCustomerSearchTrigger;
            }(Triggers.PostCustomerSearchTrigger));
            exports_1("default", PostCustomerSearchTrigger);
        }
    };
});
//# sourceMappingURL=C:/Users/localadmin/Videos/StoreCommerce43/Pos/Extend/CFZTransactionTrigger/PostCustomerSearchTrigger.js.map