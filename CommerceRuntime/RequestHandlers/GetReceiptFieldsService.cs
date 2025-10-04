using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using Microsoft.Dynamics.Commerce.Runtime;
using Microsoft.Dynamics.Commerce.Runtime.Data;
using Microsoft.Dynamics.Commerce.Runtime.Data.Types;
using Microsoft.Dynamics.Commerce.Runtime.DataModel;
using Microsoft.Dynamics.Commerce.Runtime.DataServices.Messages;
using Microsoft.Dynamics.Commerce.Runtime.Messages;
using Microsoft.Dynamics.Commerce.Runtime.RealtimeServices.Messages;
using Microsoft.Dynamics.Commerce.Runtime.Services.Messages;

namespace CommerceRuntime.RequestHandlers
{
    public class GetReceiptFieldsService : IRequestHandlerAsync
    {
        /// <summary>
        /// Gets the supported request types.
        /// </summary>
        public IEnumerable<Type> SupportedRequestTypes
        {
            get
            {
                return new[]
                {
                        typeof(GetSalesTransactionCustomReceiptFieldServiceRequest),
                    };
            }
        }

        /// <summary>
        /// Executes the requests.
        /// </summary>
        /// <param name="request">The request parameter.</param>
        /// <returns>The GetReceiptServiceResponse that contains the formatted receipts.</returns>
        public async Task<Response> Execute(Request request)
        {
            if (request == null)
            {
                throw new ArgumentNullException("request");
            }

            Type requestedType = request.GetType();

            if (requestedType == typeof(GetSalesTransactionCustomReceiptFieldServiceRequest))
            {
                return await this.GetCustomReceiptFieldForSalesTransactionReceiptsAsync((GetSalesTransactionCustomReceiptFieldServiceRequest)request).ConfigureAwait(false);
            }

            throw new NotSupportedException(string.Format("Request '{0}' is not supported.", request.GetType()));
        }

        /// <summary>
        /// Gets the custom receipt filed for all transaction-based receipts, such as SalesReceipt, CustomerOrderReceipt, PickupReceipt, CreditCardReceipt, and so on.
        /// </summary>
        /// <param name="request">The service request to get custom receipt filed.</param>
        /// <returns>The value of custom receipt filed.</returns>
        private async Task<Response> GetCustomReceiptFieldForSalesTransactionReceiptsAsync(GetSalesTransactionCustomReceiptFieldServiceRequest request)
        {
            string receiptFieldName = request.CustomReceiptField;

            SalesOrder salesOrder = request.SalesOrder;
            SalesLine salesLine = request.SalesLine;
            TenderLine tenderLine = request.TenderLine;

            // Get the store currency.
            string currency = request.RequestContext.GetOrgUnit().Currency;

            string returnValue = null;


            switch (receiptFieldName)
            {
                case "TIPAMOUNT":
                    {
                        // FORMAT THE VALUE
                        decimal tipAmount = salesOrder == null ? 0 : (salesOrder.TotalAmount * 0.18m);
                        returnValue = await this.FormatCurrencyAsync(tipAmount, currency, request.RequestContext).ConfigureAwait(false);
                    }

                    break;

                case "ITEMNUMBER":
                    {
                        returnValue = salesLine == null ? string.Empty : "Custom_" + salesLine.ItemId;
                    }

                    break;

                case "TENDERID":
                    {
                        returnValue = tenderLine == null ? string.Empty : "Custom_" + tenderLine.TenderTypeId;
                    }

                    break;
                case "CFZTAXRATE":
                    {
                        returnValue = salesLine == null ? string.Empty : Convert.ToString(Math.Round(salesLine.TaxLines.Select(p => p.Percentage).FirstOrDefault(), 2) + "%");
                    }

                    break;

                case "CFZFBRID":
                    {
                        string FBRInvoiceId = await getFBRIdsAsync(request.SalesOrder.Id, request.RequestContext, true).ConfigureAwait(false);

                        if (FBRInvoiceId != null || FBRInvoiceId != string.Empty)
                        {
                            returnValue = FBRInvoiceId;
                        }
                        else
                        {
                            returnValue = "";
                        }

                    }
                    break;

                case "CFZTOTALQTY":
                    {
                        // FORMAT THE VALUE
                        decimal TotalItemQty = 0;

                        for (int i = 0; i < salesOrder.SalesLines.Count; i++)
                        {
                            if (salesOrder.SalesLines[i].IsVoided == false)
                            {
                                TotalItemQty = TotalItemQty + Convert.ToDecimal(salesOrder.SalesLines[i].Quantity);
                            }
                        }
                        //TotalItemQty = 1;
                        returnValue = Convert.ToString(Math.Round(TotalItemQty, 1));
                    }

                    break;

                case "CFZFBRCNIC":
                    {
                        string FBRCNIC = await getFBRCNICAsync(request.SalesOrder.Id, request.RequestContext).ConfigureAwait(false);

                        if (FBRCNIC != null || FBRCNIC != string.Empty)
                        {
                            returnValue = FBRCNIC;
                        }
                        else
                        {
                            returnValue = "";
                        }
                    }
                    break;

                case "CFZAJKFBRID":

                    {

                        string FBRInvoiceId = await getAJKFBRInvoiceDataAsync(request.SalesOrder.Id, request.RequestContext).ConfigureAwait(false);

                        if (FBRInvoiceId != null || FBRInvoiceId != string.Empty)

                        {

                            returnValue = FBRInvoiceId;

                        }

                        else

                        {

                            returnValue = "";

                        }

                    }

                    break;

                case "CFZFBRPOSID":
                    {
                        string FBRPosId = await getFBRPosIdAsync(request.RequestContext.GetTerminalId(), request.RequestContext).ConfigureAwait(false);

                        if (FBRPosId != null || FBRPosId != string.Empty)
                        {
                            returnValue = FBRPosId;
                        }
                        else
                        {
                            returnValue = "N/A";
                        }
                    }

                    break;


                case "CFZITEMTAXAMOUNT":
                    {
                        returnValue = salesLine.TaxAmount.ToString("00.00");
                    }
                    break;

                case "CFZCARDNUMBER":
                    {
                        string cardNumber = GetCardNumberFromTender(request.SalesOrder);

                        if (string.IsNullOrWhiteSpace(cardNumber))
                        {
                            cardNumber = "12345";
                        }

                        returnValue = cardNumber;
                    }
                    break;

                case "CFZUNITPRICEEXTAX":
                    {
                        returnValue = (Math.Abs(salesLine.Price) - Math.Abs(salesLine.TaxAmount / salesLine.Quantity)).ToString("00.00");
                    }

                    break;

                case "CFZITEMSALESPRICE":
                    {
                        returnValue = (Math.Abs(salesLine.Price * salesLine.Quantity) - Math.Abs(salesLine.DiscountAmount) - Math.Abs(salesLine.TaxAmount)).ToString("00.00");
                    }

                    break;

                case "CFZTOTALAMOUNT":
                    {
                        decimal cfzTotal = 0;
                        for (int i = 0; i < salesOrder.SalesLines.Count; i++)
                        {
                            if (salesOrder.SalesLines[i].IsVoided == false)
                            {

                                cfzTotal = cfzTotal + Convert.ToDecimal(salesOrder.SalesLines[i].Quantity * (salesOrder.SalesLines[i].OriginalPrice));
                            }
                        }
                        returnValue = await this.FormatCurrencyAsync(cfzTotal, currency, request.RequestContext).ConfigureAwait(false);
                    }

                    break;

                case "CFZCMBARCODE":
                    {
                        var tenderline = salesOrder.ActiveTenderLines.Where(p => !string.IsNullOrEmpty(p.CreditMemoId))?.FirstOrDefault();
                        returnValue = tenderline != null ? "<B: " + tenderline.CreditMemoId + ">" : string.Empty;
                    }

                    break;

            }

            return new GetCustomReceiptFieldServiceResponse(returnValue);
        }

        #region Custom Calling ---

        /// <summary>
        /// Formats the currency to another currency.
        /// </summary>
        /// <param name="value">The digital value of the currency to be formatted.</param>
        /// <param name="currencyCode">The code of the target currency.</param>
        /// <param name="context">The request context.</param>
        /// <returns>The formatted value of the currency.</returns>
        private async Task<string> FormatCurrencyAsync(decimal value, string currencyCode, RequestContext context)
        {
            GetRoundedValueServiceRequest roundingRequest = null;

            string currencySymbol = string.Empty;

            // Get the currency symbol.
            if (!string.IsNullOrWhiteSpace(currencyCode))
            {
                var getCurrenciesDataRequest = new GetCurrenciesDataRequest(currencyCode, QueryResultSettings.SingleRecord);
                var currencyResponse = await context.Runtime.ExecuteAsync<EntityDataServiceResponse<Currency>>(getCurrenciesDataRequest, context).ConfigureAwait(false);
                Currency currency = currencyResponse.PagedEntityCollection.FirstOrDefault();
                currencySymbol = currency.CurrencySymbol;
            }

            roundingRequest = new GetRoundedValueServiceRequest(value, currencyCode, 0, false);

            var roundedValueResponse = await context.ExecuteAsync<GetRoundedValueServiceResponse>(roundingRequest).ConfigureAwait(false);
            decimal roundedValue = roundedValueResponse.RoundedValue;

            var formattingRequest = new GetFormattedCurrencyServiceRequest(roundedValue, currencySymbol);
            var formattedValueResponse = await context.ExecuteAsync<GetFormattedContentServiceResponse>(formattingRequest).ConfigureAwait(false);
            string formattedValue = formattedValueResponse.FormattedValue;
            return formattedValue;
        }

        private string GetCardNumberFromTender(SalesOrder salesOrder)
        {
            string cardNumber = string.Empty;

            if (salesOrder != null && salesOrder.TenderLines != null && salesOrder.TenderLines.Any())
            {
                var tenderLine = salesOrder.TenderLines.FirstOrDefault();
                if (tenderLine != null && !string.IsNullOrWhiteSpace(tenderLine.CardOrAccount))
                {
                    cardNumber = Convert.ToString(tenderLine.CardOrAccount);
                }
            }

            return cardNumber;
        }

        
        private async Task<string> getAJKFBRInvoiceDataAsync(string transactionId, RequestContext context)
        {
            string FbrID = string.Empty;

            try
            {
                ParameterSet parameterSet = new ParameterSet();
                parameterSet["@TRANSACTIONID"] = transactionId;

                string selectQuery = @"select top 1  CFR.INVOICEID , custCNIC from ext.CFZAJKFBRResponse CFR where CFR.TRANSACTIONID = @TRANSACTIONID";
                DataTable dt = await ExecuteCustomQuery(selectQuery, parameterSet, context).ConfigureAwait(false);

                if (dt.Rows.Count > 0)
                {
                    FbrID = Convert.ToString(dt.Rows[0]["INVOICEID"]);
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }

            return FbrID;
        }


        /// <summary>
        /// Formats the Amount to another currency.
        /// </summary>
        /// <param name="value"></param>
        /// <param name="currencyCode"></param>
        /// <param name="context"></param>
        /// <returns></returns>
        public async Task<string> FormatAmountAsync(decimal value, string currencyCode, RequestContext context)
        {
            short NumberOfDecimals = 0;

            // Get the currency symbol.
            if (!string.IsNullOrWhiteSpace(currencyCode))
            {
                var getCurrenciesDataRequest = new GetCurrenciesDataRequest(currencyCode, QueryResultSettings.SingleRecord);
                var currencyResponse = await context.Runtime.ExecuteAsync<EntityDataServiceResponse<Currency>>(getCurrenciesDataRequest, context).ConfigureAwait(false);
                Currency currency = currencyResponse.PagedEntityCollection.FirstOrDefault();
                NumberOfDecimals = currency.NumberOfDecimals;
            }

            GetRoundedValueServiceRequest roundingRequest = new GetRoundedValueServiceRequest(value, currencyCode);
            var roundedValueResponse = await context.ExecuteAsync<GetRoundedValueServiceResponse>(roundingRequest).ConfigureAwait(false);
            decimal roundedValue = roundedValueResponse.RoundedValue;

            var formattingRequest = new GetFormattedCurrencyServiceRequest(roundedValue, "", NumberOfDecimals);
            var formattedValueResponse = await context.ExecuteAsync<GetFormattedContentServiceResponse>(formattingRequest).ConfigureAwait(false);
            string formattedValue = formattedValueResponse.FormattedValue;
            return formattedValue;
        }

        /// <summary>
        /// getFBRId
        /// </summary>
        /// <param name="transactionId"></param>
        /// <param name="context"></param>
        /// <param name="isFBRId"></param>
        /// <returns></returns>
        public async Task<string> getFBRIdsAsync(string transactionId, RequestContext context, bool isFBRId = false)
        {
            string result = string.Empty;

            try
            {
                ParameterSet parameterSet = new ParameterSet();
                parameterSet["@transactionId"] = transactionId;

                string selectQuery = @"SELECT top 1  FBRID , custCNIC FROM ext.CFZFBRResponse  WHERE TRANSACTIONID = @TRANSACTIONID";

                DataTable dt = await ExecuteCustomQuery(selectQuery, parameterSet, context).ConfigureAwait(false);

                if (dt.Rows.Count > 0)
                {
                    if (isFBRId)
                    {
                        result = Convert.ToString(dt.Rows[0]["FBRID"]);
                    }
                    else
                    {
                        result = Convert.ToString(dt.Rows[0]["custCNIC"]);
                    }
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }

            return result;
        }

        public async Task<string> getFBRCNICAsync(string transactionId, RequestContext context)
        {
            string FbrID = string.Empty;

            try
            {
                ParameterSet parameterSet = new ParameterSet();
                parameterSet["@transactionId"] = transactionId;

                string selectQuery = @"select top 1  CFR.FBRID , custCNIC from ext.CFZFBRResponse CFR where CFR.TRANSACTIONID = @TRANSACTIONID";

                DataTable dt = await ExecuteCustomQuery(selectQuery, parameterSet, context).ConfigureAwait(false);

                if (dt.Rows.Count > 0)
                {
                    FbrID = Convert.ToString(dt.Rows[0]["custCNIC"]);
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }

            return FbrID;
        }
        public async Task<string> getFBRPosIdAsync(string TerminalId, RequestContext context)
        {
            string posid = string.Empty;

            try
            {

                ParameterSet parameterSet = new ParameterSet();
                parameterSet["@TerminalId"] = TerminalId;

                string selectQuery = @"select rtt.[LOCATION] from ext.CFZRETAILTERMINALTABLEVIEW rtt where rtt.TERMINALID = @TerminalId";

                DataTable dt = await ExecuteCustomQuery(selectQuery, parameterSet, context).ConfigureAwait(false);

                if (dt.Rows.Count > 0)
                {
                    posid = Convert.ToString(dt.Rows[0]["LOCATION"]);
                }

                return posid;
            }
            catch (Exception ex)
            {
                throw ex;
            }

        }

        /// <summary>
        /// ExecuteCustomQuery
        /// </summary>
        /// <param name="query"></param>
        /// <param name="parameters"></param>
        /// <param name="context"></param>
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
        #endregion Custom Calling ---
    }
}