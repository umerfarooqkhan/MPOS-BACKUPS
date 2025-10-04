
  /* tslint:disable */
  import { ProxyEntities } from "PosApi/Entities";
  // @ts-ignore
  import { DateExtensions } from "PosApi/TypeExtensions";
  export { ProxyEntities };

  export namespace Entities {
  
  /**
   * CFZCustomer entity class.
   */
  export class CFZCustomer {
      public UnusualEntityId: number;
	  public ExtensionProperties: ProxyEntities.CommerceProperty[];
	  
      // Navigation properties names
      
      /**
       * Construct an object from odata response.
       * @param {any} odataObject The odata result object.
       */
      constructor(odataObject?: any) {
          odataObject = odataObject || {};
          
            this.UnusualEntityId = (odataObject.UnusualEntityId != null) ? parseInt(odataObject.UnusualEntityId, 10) : undefined;
              
        this.ExtensionProperties = undefined;
        if (odataObject.ExtensionProperties) {
        this.ExtensionProperties = [];
        for (var i = 0; i < odataObject.ExtensionProperties.length; i++) {
        if (odataObject.ExtensionProperties[i] != null) {
        if (odataObject.ExtensionProperties[i]['@odata.type'] != null) {
        var className: string = odataObject.ExtensionProperties[i]['@odata.type'];
        className = className.substr(className.lastIndexOf('.') + 1).concat("Class");
        // @ts-ignore
        this.ExtensionProperties[i] = new ProxyEntities[className](odataObject.ExtensionProperties[i])
        } else {
        this.ExtensionProperties[i] = new ProxyEntities.CommercePropertyClass(odataObject.ExtensionProperties[i]);
        }
                    } else {
        this.ExtensionProperties[i] = undefined;
        }
        }
        }
      
      }
  }

}
