import * as Triggers from "PosApi/Extend/Triggers/OperationTriggers";
import { ClientEntities, ProxyEntities } from "PosApi/Entities";
import { GetCurrentCartClientRequest, GetCurrentCartClientResponse } from "PosApi/Consume/Cart";
import CfzGlobalData from "./CfzGlobalData";

export default class PreOperationTrigger extends Triggers.PreOperationTrigger {

    public execute(options: Triggers.IOperationTriggerOptions): Promise<ClientEntities.ICancelable> {

        let cartLocal: ProxyEntities.Cart;

      
        if (options.operationRequest.operationId === 311)
        {
            return this.context.runtime.executeAsync<GetCurrentCartClientResponse>(new GetCurrentCartClientRequest())
                .then((cartresp: ClientEntities.ICancelableDataResult<GetCurrentCartClientResponse>): Promise<ClientEntities.ICancelable> => {

                    cartLocal = cartresp.data.result;

                    //Update Global Class
                    CfzGlobalData.SetdiscountAmount(cartLocal.DiscountAmount);

                    return Promise.resolve({ canceled: false });

                });
        } else
        {
            return Promise.resolve({ canceled: false });
        }
    }
}