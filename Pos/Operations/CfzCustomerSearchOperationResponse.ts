import { Response } from "PosApi/Create/RequestHandlers";

/**
 * Operation response of customer search.
 */
export default class CfzCustomerSearchOperationResponse extends Response {

    /**
     * The customer id.
     */
    public customerId: string;

    /**
     * Initializes a new instance of the CfzCustomerSearchOperationResponse class.
     * @param {string} customerId of the customer.
     */
    constructor(customerId: string) {
        super();
        this.customerId = customerId;
    }
}