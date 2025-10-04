
/* tslint:disable */
import { ProxyEntities } from "PosApi/Entities";

import { Entities } from "./DataServiceEntities.g";

import { DataServiceRequest, DataServiceResponse } from "PosApi/Consume/DataService";
export { ProxyEntities };

export { Entities };

export namespace CFZCustomer {
  // Entity Set CFZCustomer
  export class sendSMSDataActionResponse extends DataServiceResponse {
    public result: string;
  }

  export class sendSMSDataActionRequest<TResponse extends sendSMSDataActionResponse> extends DataServiceRequest<TResponse> {
    /**
     * Constructor
     */
      public constructor(Cart: ProxyEntities.Cart, ConStatus: string) {
        super();

        this._entitySet = "CFZCustomer";
        this._entityType = "CFZCustomer";
        this._method = "sendSMSDataAction";
        this._parameters = { Cart: Cart, ConStatus: ConStatus };
        this._isAction = true;
        this._returnType = null;
        this._isReturnTypeCollection = false;
        
      }
  }

  export class getTransactionDataActionResponse extends DataServiceResponse {
    public result: string;
  }

  export class getTransactionDataActionRequest<TResponse extends getTransactionDataActionResponse> extends DataServiceRequest<TResponse> {
    /**
     * Constructor
     */
      public constructor(Cart: ProxyEntities.Cart, ConStatus: string, CustCNIC: string) {
        super();

        this._entitySet = "CFZCustomer";
        this._entityType = "CFZCustomer";
        this._method = "getTransactionDataAction";
        this._parameters = { Cart: Cart, ConStatus: ConStatus, CustCNIC: CustCNIC };
        this._isAction = true;
        this._returnType = null;
        this._isReturnTypeCollection = false;
        
      }
  }

  export class GetCustDiscountLimitInfoResponse extends DataServiceResponse {
    public result: string;
  }

  export class GetCustDiscountLimitInfoRequest<TResponse extends GetCustDiscountLimitInfoResponse> extends DataServiceRequest<TResponse> {
    /**
     * Constructor
     */
      public constructor(CustAccount: string, CheckBalance: boolean) {
        super();

        this._entitySet = "CFZCustomer";
        this._entityType = "CFZCustomer";
        this._method = "GetCustDiscountLimitInfo";
        this._parameters = { CustAccount: CustAccount, CheckBalance: CheckBalance };
        this._isAction = true;
        this._returnType = null;
        this._isReturnTypeCollection = false;
        
      }
  }

  export class GetCustDiscountUsedResponse extends DataServiceResponse {
    public result: number;
  }

  export class GetCustDiscountUsedRequest<TResponse extends GetCustDiscountUsedResponse> extends DataServiceRequest<TResponse> {
    /**
     * Constructor
     */
      public constructor(CustAccount: string, LimitType: number, ValidationType: number, CheckBalance: boolean) {
        super();

        this._entitySet = "CFZCustomer";
        this._entityType = "CFZCustomer";
        this._method = "GetCustDiscountUsed";
        this._parameters = { CustAccount: CustAccount, LimitType: LimitType, ValidationType: ValidationType, CheckBalance: CheckBalance };
        this._isAction = true;
        this._returnType = null;
        this._isReturnTypeCollection = false;
        
      }
  }

  export class GetPettyExpenseLimitInfoResponse extends DataServiceResponse {
    public result: string;
  }

  export class GetPettyExpenseLimitInfoRequest<TResponse extends GetPettyExpenseLimitInfoResponse> extends DataServiceRequest<TResponse> {
    /**
     * Constructor
     */
      public constructor(Cart: ProxyEntities.Cart, CheckBalance: number) {
        super();

        this._entitySet = "CFZCustomer";
        this._entityType = "CFZCustomer";
        this._method = "GetPettyExpenseLimitInfo";
        this._parameters = { Cart: Cart, CheckBalance: CheckBalance };
        this._isAction = true;
        this._returnType = null;
        this._isReturnTypeCollection = false;
        
      }
  }

  export class GetPettyExpenseUpdateResponse extends DataServiceResponse {
    public result: string;
  }

  export class GetPettyExpenseUpdateRequest<TResponse extends GetPettyExpenseUpdateResponse> extends DataServiceRequest<TResponse> {
    /**
     * Constructor
     */
      public constructor(Cart: ProxyEntities.Cart, CheckBalance: number) {
        super();

        this._entitySet = "CFZCustomer";
        this._entityType = "CFZCustomer";
        this._method = "GetPettyExpenseUpdate";
        this._parameters = { Cart: Cart, CheckBalance: CheckBalance };
        this._isAction = true;
        this._returnType = null;
        this._isReturnTypeCollection = false;
        
      }
  }

  export class productCategoryDataActionResponse extends DataServiceResponse {
    public result: string;
  }

  export class productCategoryDataActionRequest<TResponse extends productCategoryDataActionResponse> extends DataServiceRequest<TResponse> {
    /**
     * Constructor
     */
      public constructor(ItemID: string) {
        super();

        this._entitySet = "CFZCustomer";
        this._entityType = "CFZCustomer";
        this._method = "productCategoryDataAction";
        this._parameters = { ItemID: ItemID };
        this._isAction = true;
        this._returnType = null;
        this._isReturnTypeCollection = false;
        
      }
  }

}
