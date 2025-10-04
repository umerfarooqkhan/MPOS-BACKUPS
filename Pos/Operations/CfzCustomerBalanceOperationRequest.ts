import { ExtensionOperationRequestBase } from "PosApi/Create/Operations";
import CfzCustomerBalanceOperationResponse from "./CfzCustomerBalanceOperationResponse";

/**
 * Operation request for skipping fiscalization.
 */
export default class CfzCustomerBalanceOperationRequest<TResponse extends CfzCustomerBalanceOperationResponse> extends ExtensionOperationRequestBase<TResponse> {
    // The operation identifier.
    private static readonly OPERATION_ID: number = 9001;

    constructor(correlationId: string) {
        super(CfzCustomerBalanceOperationRequest.OPERATION_ID, correlationId);
    }
}