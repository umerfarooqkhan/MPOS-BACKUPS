using Confiz.CommerceRuntime.Messages;
using Microsoft.Dynamics.Commerce.Runtime;
using Microsoft.Dynamics.Commerce.Runtime.Data;
using Microsoft.Dynamics.Commerce.Runtime.Data.Types;
using Microsoft.Dynamics.Commerce.Runtime.Messages;
using System;
using System.Threading.Tasks;

namespace Confiz.StoreCommercePackagingSample.CommerceRuntime.RequestHandlers
{
    public class ProductCategoryService : SingleAsyncRequestHandler<ProductCategoryRequest>
    {
        protected override async Task<Response> Process(ProductCategoryRequest request)
        {
            if (!string.IsNullOrEmpty(request.ItemID))
            {
                var reponse= await getDiscountUsedAsync(request).ConfigureAwait(false);
                return reponse;
            }
            else
            {
                return new ProductCategoryResponse("");
            }
        }

        /// <summary>
        /// getDiscountUsed
        /// </summary>
        /// <param name="request"></param>
        /// <returns></returns>
        private async Task<ProductCategoryResponse> getDiscountUsedAsync(ProductCategoryRequest request)
        {
            try
            {
                if (!string.IsNullOrEmpty(request.ItemID))
                {
                    ParameterSet parameters = new ParameterSet();
                    parameters["@ITEMID"] = request.ItemID;
                    parameters["@DATAAREAID"] = request.RequestContext.GetChannelConfiguration().InventLocationDataAreaId;
                    parameters["@HIERARCHY"] = "Retail Product Category";

                    DataTable table = await ExecuteCustomQuery(productCategoryQuery(), parameters, request.RequestContext).ConfigureAwait(false);

                    if (table.Rows.Count > 0)
                    {
                        var ssss= table.Rows[0]["CATEGORY"].ToString();
                        return new ProductCategoryResponse(table.Rows[0]["CATEGORY"].ToString());
                    }
                }
            }
            catch (Exception ex)
            {
                return new ProductCategoryResponse("");
            }
            return new ProductCategoryResponse("");
        }

        #region DB Repository
        public string productCategoryQuery()
        {
            return @"SELECT ItemID,Hierarchy,CATEGORY,[DATAAREAID] FROM [ext].[CFZPRODUCTCATEGORYVIEW] WHERE ItemID = @ITEMID AND DATAAREAID = @DATAAREAID AND Hierarchy = @HIERARCHY";
        }

        /// <summary>
        /// ExecuteCustomQuery
        /// </summary>
        /// <param name="query"></param>
        /// <param name="parameters"></param>
        /// <param name="request"></param>
        /// <returns></returns>
        public static async Task<DataTable> ExecuteCustomQuery(string query, ParameterSet parameters, RequestContext context)
        {
            try
            {
                using (DatabaseContext sqlServerDatabaseContext = new DatabaseContext(context))
                {
                    DataSet ds = await sqlServerDatabaseContext.ExecuteQueryDataSetAsync(query, parameters).ConfigureAwait(false);

                    if (ds != null)
                    {
                        DataTable table = ds.Tables[0]; // Define and assign table inside the using block

                        // Process the DataTable here...

                        return table; // Return the DataTable from inside the using block
                    }
                }

                return null; // Return null or handle the case where ds is null
            }
            catch (Exception ex)
            {

                throw ex;
            }
        }
        #endregion DB Repository

    }
}
