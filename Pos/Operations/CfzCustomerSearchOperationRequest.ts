import { ExtensionOperationRequestBase } from "PosApi/Create/Operations";
import CfzCustomerSearchOperationResponse from "./CfzCustomerSearchOperationResponse";

/**
 * Operation request for skipping fiscalization.
 */
export default class CfzCustomerSearchOperationRequest<TResponse extends CfzCustomerSearchOperationResponse> extends ExtensionOperationRequestBase<TResponse> {
    // The operation identifier.
    private static readonly OPERATION_ID: number = 9000;

    constructor(correlationId: string) {
        super(CfzCustomerSearchOperationRequest.OPERATION_ID, correlationId);
    }
}