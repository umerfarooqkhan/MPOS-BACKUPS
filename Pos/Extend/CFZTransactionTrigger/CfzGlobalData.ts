/**
 * SAMPLE CODE NOTICE
 * 
 * THIS SAMPLE CODE IS MADE AVAILABLE AS IS.  MICROSOFT MAKES NO WARRANTIES, WHETHER EXPRESS OR IMPLIED,
 * OF FITNESS FOR A PARTICULAR PURPOSE, OF ACCURACY OR COMPLETENESS OF RESPONSES, OF RESULTS, OR CONDITIONS OF MERCHANTABILITY.
 * THE ENTIRE RISK OF THE USE OR THE RESULTS FROM THE USE OF THIS SAMPLE CODE REMAINS WITH THE USER.
 * NO TECHNICAL SUPPORT IS PROVIDED.  YOU MAY NOT DISTRIBUTE THIS CODE UNLESS YOU HAVE A LICENSE AGREEMENT WITH MICROSOFT THAT ALLOWS YOU TO DO SO.
 */

import { ProxyEntities } from "PosApi/Entities";
import { ArrayExtensions } from "PosApi/TypeExtensions";


export default class CfzGlobalData {

    public static selectedCart: ProxyEntities.Cart;

    public _selectedCartLines: ProxyEntities.CartLine[];

    public _selectedIELines: ProxyEntities.IncomeExpenseLine[];

    public static cardtenderLine: ProxyEntities.TenderType;

    public static category: string;

    public static totalDiscount: number;

    public static itemIDs: string[][] = [];

    /**
     * Creates a new instance of the CartViewController class.
     * @param {IExtensionCartViewControllerContext} context The events Handler context.
     * @remarks The events handler context contains APIs through which a handler can communicate with POS.
     */
    constructor() {
    }

    public static SetdiscountAmount(TotalDiscount: number): void {
        CfzGlobalData.totalDiscount = TotalDiscount;
    }

    public SetCart(Cart: ProxyEntities.Cart): void {
        this._selectedCartLines = Cart.CartLines;
        if (ArrayExtensions.hasElements(this._selectedCartLines)) {
            CfzGlobalData.selectedCart = Cart;
        }
        else {
            CfzGlobalData.selectedCart = null;
        }
    }

    public SetCartPettyExpense(Cart: ProxyEntities.Cart): void {
        this._selectedIELines = Cart.IncomeExpenseLines;
        if (ArrayExtensions.hasElements(this._selectedIELines)) {
            CfzGlobalData.selectedCart = Cart;
        }
        else {
            CfzGlobalData.selectedCart = null;
        }
    }

    public static SetCardtenderLine(TenderLine: ProxyEntities.TenderType): void {
        CfzGlobalData.cardtenderLine = TenderLine;
    }
}