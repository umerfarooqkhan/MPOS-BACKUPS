System.register(["PosApi/Entities"], function (exports_1, context_1) {
    "use strict";
    var Entities_1, Entities;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (Entities_1_1) {
                Entities_1 = Entities_1_1;
            }
        ],
        execute: function () {
            exports_1("ProxyEntities", Entities_1.ProxyEntities);
            (function (Entities) {
                var CFZCustomer = (function () {
                    function CFZCustomer(odataObject) {
                        odataObject = odataObject || {};
                        this.UnusualEntityId = (odataObject.UnusualEntityId != null) ? parseInt(odataObject.UnusualEntityId, 10) : undefined;
                        this.ExtensionProperties = undefined;
                        if (odataObject.ExtensionProperties) {
                            this.ExtensionProperties = [];
                            for (var i = 0; i < odataObject.ExtensionProperties.length; i++) {
                                if (odataObject.ExtensionProperties[i] != null) {
                                    if (odataObject.ExtensionProperties[i]['@odata.type'] != null) {
                                        var className = odataObject.ExtensionProperties[i]['@odata.type'];
                                        className = className.substr(className.lastIndexOf('.') + 1).concat("Class");
                                        this.ExtensionProperties[i] = new Entities_1.ProxyEntities[className](odataObject.ExtensionProperties[i]);
                                    }
                                    else {
                                        this.ExtensionProperties[i] = new Entities_1.ProxyEntities.CommercePropertyClass(odataObject.ExtensionProperties[i]);
                                    }
                                }
                                else {
                                    this.ExtensionProperties[i] = undefined;
                                }
                            }
                        }
                    }
                    return CFZCustomer;
                }());
                Entities.CFZCustomer = CFZCustomer;
            })(Entities || (Entities = {}));
            exports_1("Entities", Entities);
        }
    };
});
//# sourceMappingURL=C:/Users/localadmin/Videos/StoreCommerce43/Pos/DataService/DataServiceEntities.g.js.map