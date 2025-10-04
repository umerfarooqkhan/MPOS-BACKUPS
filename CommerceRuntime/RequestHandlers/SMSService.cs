using Microsoft.Dynamics.Commerce.Runtime;
using Microsoft.Dynamics.Commerce.Runtime.DataModel;
using Microsoft.Dynamics.Commerce.Runtime.Messages;
using Microsoft.Dynamics.Commerce.Runtime.Services.Messages;
using System;
using Confiz.CommerceRuntime.Messages;
using System.Threading.Tasks;
using Confiz.CommerceRuntime.DataUtilities;

namespace Confiz.StoreCommercePackagingSample.CommerceRuntime.RequestHandlers
{
    public class SMSService : SingleAsyncRequestHandler<SMSRequest>
    {
        protected override async Task<Response> Process(SMSRequest request)
        {
            if (request == null)
            {
                throw new ArgumentNullException("request");
            }

            if (request.Status.Equals("1"))
            {
                var smsResponse = await GenerateSaleSMSAsync(request).ConfigureAwait(false);
                return smsResponse; // This is already of type Response (SMSResponse derives from Response)
            }
            else
            {
                return new SMSResponse(""); // Returning SMSResponse, which is a type of Response
            }
        }


        private async Task<SMSResponse> GenerateSaleSMSAsync(SMSRequest request)
        {
            string response = string.Empty;
            SMSHelper helper = new SMSHelper(request.RequestContext);

            try
            {
                SalesOrder salesOrder =  await getSalesOrderAsync(request).ConfigureAwait(false);
                string ReceiptId = string.Empty;
                string custName = string.Empty;

                // Step No. #1
                response = salesOrder.Id.ToString();

                if (salesOrder.ReasonCodeLines.Count > 0)
                {
                    // Step No. #2
                    response = salesOrder.ReasonCodeLines.ToString();

                    int type = 0;
                    ReceiptId = salesOrder.ReceiptId;
                    string phone = helper.getPhoneNumber(salesOrder);

                    // Step No. #3
                    response = string.IsNullOrEmpty(phone) ? response : string.Concat(phone,":", ReceiptId);

                    custName = helper.getCustName(salesOrder);
                    custName = string.IsNullOrEmpty(custName) ? "WALK IN CUSTOMER" : custName;

                    if (!string.IsNullOrEmpty(phone) && !string.IsNullOrEmpty(ReceiptId))
                    {
                        helper.salesOrder = salesOrder;
                        helper.Phone = phone;
                        helper.getSMSSettings(request.RequestContext);
                        helper.getMessage(request.RequestContext, type);
                        helper.setSalesMessage(custName, salesOrder.ReceiptId, salesOrder.TotalAmount.ToString("00.00"));
                        string url = helper.setUrl();

                        // Step No. #4
                        response = string.IsNullOrEmpty(url) ? response : url;

                        try
                        {
                            response = helper.CfzSendSMS(true);
                            if (response.Equals("OK"))
                            {
                                helper.updateStatusAsync(salesOrder.Id, response, type);
                            }
                            else
                            {
                                helper.updateStatusAsync(salesOrder.Id, response, type);
                            }
                        }
                        catch (Exception ex)
                        {
                            // Step No. #5
                            response = ex.Message.ToString();
                            helper.updateStatusAsync(salesOrder.Id, "Error: " + ex.Message, type);
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                // Step No. #6
                response = ex.Message.ToString();
                helper.updateStatusExceptionAsync(request.Cart.Id, "Error: " + ex.Message, 0, request);
            }

            return new SMSResponse(response);
        }

        private async Task<SalesOrder> getSalesOrderAsync(SMSRequest request)
        {
            SalesOrder SalesOrder = null;
            try
            { 
                var getReceiptRequest = new GetSalesOrderDetailsByTransactionIdServiceRequest(request.Cart.Id, SearchLocation.Local);
                var getReceiptResponse = request.RequestContext.ExecuteAsync<GetSalesOrderDetailsServiceResponse>(getReceiptRequest);
                GetSalesOrderDetailsServiceResponse getSalesOrderDetailsServiceResponse = await getReceiptResponse.ConfigureAwait(false);
                SalesOrder = getSalesOrderDetailsServiceResponse.SalesOrder;
            }
            catch(Exception ex)
            {
                SalesOrder =null;
            }

            return SalesOrder;
        }
    }
}
