import CfzCustomerSearchOperationRequest from "./CfzCustomerSearchOperationRequest";
import CfzCustomerSearchOperationResponse from "./CfzCustomerSearchOperationResponse";
import { ExtensionOperationRequestFactoryFunctionType, IOperationContext } from "PosApi/Create/Operations";
import { ClientEntities } from "PosApi/Entities";

let getOperationRequest: ExtensionOperationRequestFactoryFunctionType<CfzCustomerSearchOperationResponse> =
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
    ): Promise<ClientEntities.ICancelableDataResult<CfzCustomerSearchOperationRequest<CfzCustomerSearchOperationResponse>>> {

        let operationRequest: CfzCustomerSearchOperationRequest<CfzCustomerSearchOperationResponse> =
            new CfzCustomerSearchOperationRequest<CfzCustomerSearchOperationResponse>(correlationId);

        return Promise.resolve(<ClientEntities.ICancelableDataResult<CfzCustomerSearchOperationRequest<CfzCustomerSearchOperationResponse>>>{
            canceled: false,
            data: operationRequest
        });
    };

export default getOperationRequest;