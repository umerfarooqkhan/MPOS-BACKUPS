import { IProductSearchColumn } from "PosApi/Extend/Views/SearchView";
import { ICustomColumnsContext } from "PosApi/Extend/Views/CustomListColumns";
import { ClientEntities } from "PosApi/Entities";
import { CFZCustomer } from "../DataService/DataServiceRequests.g";
import { StringExtensions } from "PosApi/TypeExtensions";
import CfzGlobalData from "../Extend/CFZTransactionTrigger/CfzGlobalData";

export default (context: ICustomColumnsContext): IProductSearchColumn[] => {
    return [
        {
            title: "Product Number",
            computeValue: (row: ClientEntities.IProductSearchResultForDisplay): string => {
                return row.ItemId;
            },
            ratio: 15,
            collapseOrder: 5,
            minWidth: 60,
            isRightAligned: false
        }, {
            title: "Product Name",
            computeValue: (row: ClientEntities.IProductSearchResultForDisplay): any => {
                return row.Name;
            },
            ratio: 30,
            collapseOrder: 4,
            minWidth: 70,
            isRightAligned: false
        }, {
            title: "Price",
            computeValue: (row: ClientEntities.IProductSearchResultForDisplay): any => {
                return row.Price;
            },
            ratio: 15,
            collapseOrder: 3,
            minWidth: 40,
            isRightAligned: false
        }, {
            title: "Rating",
            computeValue: (row: ClientEntities.IProductSearchResultForDisplay): string => {
                if (row.TotalRatings > 0) {
                    return row.AverageRating.toFixed(2) + " (" + row.TotalRatings + ")";
                }
                else {
                    return "";
                }
            },
            ratio: 20,
            collapseOrder: 2,
            minWidth: 40,
            isRightAligned: false
        }, {
            title: "Category",
            computeValue: (row: ClientEntities.IProductSearchResultForDisplay): string => {
                if (CfzGlobalData.itemIDs.some(item => item.indexOf(row.ItemId) > -1)) {
                    // Item is already in the list, use the cached category
                    return CfzGlobalData.category;
                } else {
                    

                    clientFunction(row.ItemId, context).then(p => {
                        CfzGlobalData.category = p;
                        // Here you would ideally trigger a re-render or update the UI state
                    });

                    return CfzGlobalData.category;
                }
            },
            ratio: 20,
            collapseOrder: 1,
            minWidth: 40,
            isRightAligned: false
        }
    ];
};

async function clientFunction(itemid: string, context: ICustomColumnsContext): Promise<string> {
    return await updateCustomer(itemid, context);
}

async function updateCustomer(itemid: string, context: ICustomColumnsContext): Promise<string> {
    let CustomRequest: CFZCustomer.productCategoryDataActionRequest<CFZCustomer.productCategoryDataActionResponse> =
        new CFZCustomer.productCategoryDataActionRequest(itemid);

    const response = await context.runtime.executeAsync<CFZCustomer.productCategoryDataActionResponse>(CustomRequest);
    CfzGlobalData.category = response.data.result;
    return CfzGlobalData.category;
}
