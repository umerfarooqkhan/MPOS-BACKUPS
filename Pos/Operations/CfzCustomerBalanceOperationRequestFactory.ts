import CfzCustomerBalanceOperationRequest from "./CfzCustomerBalanceOperationRequest";
import CfzCustomerBalanceOperationResponse from "./CfzCustomerBalanceOperationResponse";
import { ExtensionOperationRequestFactoryFunctionType, IOperationContext } from "PosApi/Create/Operations";
import { ClientEntities } from "PosApi/Entities";

let getOperationRequest: ExtensionOperationRequestFactoryFunctionType<CfzCustomerBalanceOperationResponse> =
    /**
     * Gets an instance of SkipFiscalizationOperationRequest.
     * @param {IOperationContext} context The operation constext.
     * @param {number} operationId The operation Id.
     * @param {string[]} actionParameters The action parameters.
     * @param {string} correlationId A telemetry correlation ID, used to group events logged from this request together with the calling context.
     * @return {SkipFiscalizationOperationRequest<TResponse>} Instance of SkipFiscalizationOperationRequest.
     */
    function (
        context: IOperationContext,
        operationId: number,
        actionParameters: string[],
        correlationId: string
    ): Promise<ClientEntities.ICancelableDataResult<CfzCustomerBalanceOperationRequest<CfzCustomerBalanceOperationResponse>>> {

        let operationRequest: CfzCustomerBalanceOperationRequest<CfzCustomerBalanceOperationResponse> =
            new CfzCustomerBalanceOperationRequest<CfzCustomerBalanceOperationResponse>(correlationId);

        return Promise.resolve(<ClientEntities.ICancelableDataResult<CfzCustomerBalanceOperationRequest<CfzCustomerBalanceOperationResponse>>>{
            canceled: false,
            data: operationRequest
        });
    };

export default getOperationRequest;