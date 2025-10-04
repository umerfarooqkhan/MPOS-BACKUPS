import * as Triggers from "PosApi/Extend/Triggers/PaymentTriggers";
import { ObjectExtensions } from "PosApi/TypeExtensions";
import { ClientEntities } from "PosApi/Entities";

//import { CustomCustomers } from "../DataService/DataServiceRequests.g";



export default class PrePaymentTrigger extends Triggers.PrePaymentTrigger {
    /**
     * Executes the trigger functionality.
     * @param {Triggers.IPreProductSaleTriggerOptions} options The options provided to the trigger.
     */
    public execute(options: Triggers.IPrePaymentTriggerOptions): Promise<ClientEntities.ICancelable> {
        this.context.logger.logVerbose("Executing PreProductSaleTrigger with options " + JSON.stringify(options) + " at " + new Date().getTime() + ".");
        if (ObjectExtensions.isNullOrUndefined(options)) {
            // options.tenderType.TenderTypeId

            // This will never happen, but is included to demonstrate how to return a rejected promise when validation fails.
            let error: ClientEntities.ExtensionError
                = new ClientEntities.ExtensionError("The options provided to the PreProductSaleTrigger were invalid. Please select a product and try again.");

            return Promise.reject(error);
        } else {
            sessionStorage.setItem("tenderTypeId", options.tenderType.TenderTypeId);
            return Promise.resolve({ canceled: false });
        }
    }
}