using Confiz.CommerceRuntime.DataUtilities;
using Confiz.CommerceRuntime.Messages;
using Microsoft.Dynamics.Commerce.Runtime;
using Microsoft.Dynamics.Commerce.Runtime.Data.Types;
using Microsoft.Dynamics.Commerce.Runtime.DataModel;
using Microsoft.Dynamics.Commerce.Runtime.DataServices.Messages;
using Microsoft.Dynamics.Commerce.Runtime.Messages;
using Microsoft.Dynamics.Commerce.Runtime.Services.Messages;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace Confiz.StoreCommercePackagingSample.CommerceRuntime.RequestHandlers
{
    public class FBRDataService : SingleAsyncRequestHandler<FBRRequest>
    {
        string PCTCode = string.Empty;

        protected override async Task<Response> Process(FBRRequest request)
        {
            if (request.Status.Contains("PCTCODE"))
            {
                return await getPCTCodeValidationAsync(request).ConfigureAwait(false);
            }
             else
            {
                string AJKStores = String.Empty;

                GetConfigurationParametersDataRequest ChannelReq = new GetConfigurationParametersDataRequest(request.RequestContext.GetChannel().RecordId);

                var configurationResponse = await request.RequestContext.ExecuteAsync<EntityDataServiceResponse<RetailConfigurationParameter>>(ChannelReq).ConfigureAwait(false);

                if (configurationResponse != null)
                {
                    if (configurationResponse.Any())
                    {
                        var config = configurationResponse.PagedEntityCollection.Results.Where(p => p.Name.ToLower().Equals("ajkstores")).FirstOrDefault();

                        if (config != null)
                        {
                            if (!string.IsNullOrEmpty(config.Value))
                            {
                                AJKStores = config.Value.ToString();
                            }
                        }
                    }
                }

                if (!string.IsNullOrEmpty(AJKStores) && AJKStores.Contains(request.RequestContext.GetDeviceConfiguration().StoreNumber))
                {
                    return await AJKGetFBRInvoiceNumberAsync(request).ConfigureAwait(false);
                }
                else
                {
                    if (!"9258ARS35,9258JRS01,9258JRS02".ToLower().Contains(request.RequestContext.GetDeviceConfiguration().StoreNumber.ToLower()))
                    {
                        return await GetFBRInvoiceNumberAsync(request).ConfigureAwait(false);
                    }
                    else
                    {
                        return new FBRResponse("");
                    };
                }
            }
        }
        private async Task<FBRResponse> sendOnlineDataAsync(FBRRequest request, Invoice master)
        {
            FBRResponse response = new FBRResponse();
            var jsonObj = JsonConvert.SerializeObject(master);

            try
            {
                DataTable Table = await FBRQuries.GetFBRAPIURL(request.RequestContext).ConfigureAwait(false);

                if (Table.Rows.Count > 0)
                {
                    string APIURL = Convert.ToString(Table.Rows[0]["CFZFBRAPI"]);
                    string CloudAPI = Convert.ToString(Table.Rows[0]["CFZFBRAPITYPE"]);
                    string Token = Convert.ToString(Table.Rows[0]["CFZFBRAPITOKEN"]);

                    using (var handler = new HttpClientHandler())
                    {
                        handler.ServerCertificateCustomValidationCallback = (sender, certificate, chain, sslPolicyErrors) =>
                        {
                            // Implement your certificate validation logic here
                            // Example: return sslPolicyErrors == SslPolicyErrors.None;
                            return true; // For demonstration purposes, accepting all certificates
                        };

                        using (var client = new HttpClient(handler))
                        {
                            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", Token);
                            using (var content = new StringContent(jsonObj, Encoding.UTF8, "application/json"))
                            {
                                HttpResponseMessage HttpResponse = await client.PostAsync(APIURL, content).ConfigureAwait(false);
                                if (HttpResponse.IsSuccessStatusCode)
                                {
                                    response = JsonConvert.DeserializeObject<FBRResponse>(await HttpResponse.Content.ReadAsStringAsync().ConfigureAwait(false));
                                }
                                else
                                {
                                    response = JsonConvert.DeserializeObject<FBRResponse>(await HttpResponse.Content.ReadAsStringAsync().ConfigureAwait(false));
                                }
                            }
                        }
                    }

                    FBRQuries.InserFBRTransLog(master.USIN, jsonObj, request.RequestContext.GetTerminalId(), Convert.ToString(master.POSID), response.Response, request.RequestContext.GetChannelConfiguration().InventLocationDataAreaId, request.RequestContext);
                    FBRQuries.InserFBRID(master.USIN, response.InvoiceNumber, master.BuyerCNIC, request.RequestContext);
                    return response;
                }
                else
                {
                    FBRQuries.InserFBRTransLog(master.USIN, jsonObj, request.RequestContext.GetTerminalId(), Convert.ToString(master.POSID), "Incomplete Configuration", request.RequestContext.GetChannelConfiguration().InventLocationDataAreaId, request.RequestContext);
                    FBRQuries.InserFBRID(master.USIN, "Incomplete Configuration", master.BuyerCNIC, request.RequestContext);
                    return new FBRResponse("Incomplete Configuration  POSID:" + master.POSID + "PCTCode: " + PCTCode);
                }
            }
            catch (Exception ex)
            {
                FBRQuries.InserFBRTransLog(master.USIN, jsonObj, request.RequestContext.GetTerminalId(), Convert.ToString(master.POSID), ex.InnerException.Message + " " + ex.Message.ToString(), request.RequestContext.GetChannelConfiguration().InventLocationDataAreaId, request.RequestContext);
                return new FBRResponse(ex.Message.ToString());
            }

        }
        private async Task<FBRResponse> sendOfflineDataAsync(FBRRequest request, Invoice master)
        {
            FBRResponse response = new FBRResponse();
            var jsonObj = JsonConvert.SerializeObject(master);
            string APIURL = "http://localhost:8524/api/IMSFiscal/GetInvoiceNumberByModel";

            try
            {
                using (var Client = new HttpClient())
                {
                    StringContent content = new StringContent(jsonObj, Encoding.UTF8, "application/json");
                    HttpResponseMessage HttpResponse = await Client.PostAsync(APIURL, content).ConfigureAwait(false);
                    if (HttpResponse.IsSuccessStatusCode)
                    {
                        response = JsonConvert.DeserializeObject<FBRResponse>(await HttpResponse.Content.ReadAsStringAsync().ConfigureAwait(false));
                    }
                    else
                    {
                        response = JsonConvert.DeserializeObject<FBRResponse>(await HttpResponse.Content.ReadAsStringAsync().ConfigureAwait(false));
                    }

                    // Call Dispose on StringContent here
                    content.Dispose();
                }
                FBRQuries.InserFBRTransLog(master.USIN, jsonObj, request.RequestContext.GetTerminalId(), Convert.ToString(master.POSID), response.Response, request.RequestContext.GetChannelConfiguration().InventLocationDataAreaId, request.RequestContext);
                FBRQuries.InserFBRID(master.USIN, response.InvoiceNumber, master.BuyerCNIC, request.RequestContext);
            }
            catch (Exception ex)
            {
                FBRQuries.InserFBRTransLog(master.USIN, jsonObj, request.RequestContext.GetTerminalId(), Convert.ToString(master.POSID), ex.Message.ToString(), request.RequestContext.GetChannelConfiguration().InventLocationDataAreaId, request.RequestContext);
                return new FBRResponse(ex.Message.ToString());
            }
            return response;
        }
        private async Task<FBRResponse> GetFBRInvoiceNumberAsync(FBRRequest request)
        {
            try
            {

                if (string.IsNullOrEmpty(await FBRQuries.GetFBRId(request.Cart.Id, request.RequestContext).ConfigureAwait(false))
                    && string.IsNullOrEmpty(await FBRQuries.GetFBRDataLogs(request.Cart.Id, request.RequestContext).ConfigureAwait(false))
                    )
                {
                    Invoice master = new Invoice();
                    InvoiceItems detail = new InvoiceItems();
                    List<InvoiceItems> details = new List<InvoiceItems>();
                    double HeaderSaleValue = 0;

                    master.BuyerName = string.Empty;
                    master.BuyerPhoneNumber = string.Empty;
                    master.BuyerNTN = string.Empty;
                    master.BuyerCNIC = string.IsNullOrEmpty(request.CNIC) ? string.Empty : request.CNIC;
                    //if(request.Cart.cus)
                    DateTimeOffset transdate = (DateTimeOffset)DateTime.Now;
                    master.DateTime = transdate.DateTime;
                    master.Discount = Math.Abs(Convert.ToDouble(Convert.ToDouble(request.Cart.DiscountAmount)));
                    master.TotalBillAmount = Convert.ToDouble(Math.Abs(request.Cart.TotalAmount) - Math.Abs(request.Cart.ChargeAmount));
                    master.TotalQuantity = Math.Abs(Convert.ToDouble(request.Cart.TotalItems));                                                 //10;
                    master.TotalTaxCharged = Math.Abs(Convert.ToDouble(request.Cart.TaxAmount)); ;
                    master.USIN = request.Cart.Id;
                    master.POSID = await FBRQuries.GetFBRPOSID(request.Cart.TerminalId, request.RequestContext).ConfigureAwait(false);
                    master.RefUSIN = request.Cart.CartLines[0].ReturnTransactionId;
                    if (request.Cart.TotalAmount >= 0)
                    {
                        master.InvoiceType = 1;
                    }
                    else
                    {
                        master.InvoiceType = 3;
                    }

                    master.PaymentMode = int.Parse(FBRQuries.GetPaymentMode(request.Cart.TenderLines.ToList()));


                    foreach (CartLine item in request.Cart.CartLines)
                    {
                        if (item.IsVoided == false)
                        {
                            detail = new InvoiceItems();

                            detail.ItemName = item.Description;
                            detail.PCTCode = await FBRQuries.GetItemPCTCode(item.ItemId, request.RequestContext).ConfigureAwait(false);
                            PCTCode = detail.PCTCode;
                            detail.ItemCode = item.ItemId;
                            detail.Quantity = Math.Abs(Convert.ToDouble(item.Quantity));
                            detail.Discount = Math.Abs(Convert.ToDouble(Convert.ToDouble(item.DiscountAmount)));
                            detail.TotalAmount = Math.Abs(Convert.ToDouble(item.TotalAmount));
                            detail.TaxRate = (float)item.TaxRatePercent;                        //10;
                            detail.TaxCharged = Math.Abs((double)item.TaxAmount);       //10;
                            detail.SaleValue = Math.Abs(Convert.ToDouble(Convert.ToInt32(item.NetAmountWithoutTax)));       //90;
                            HeaderSaleValue = HeaderSaleValue + detail.SaleValue;
                            if (item.TotalAmount > 0)
                            {
                                detail.InvoiceType = 1;
                            }
                            else
                            {
                                detail.InvoiceType = 3;
                            }

                            details.Add(detail);
                        }
                    }     //90;


                    master.TotalSaleValue = Math.Abs(HeaderSaleValue);
                    master.Items = details.ToArray();

                    if (request.Status.Equals("Online"))
                    {
                        return await sendOnlineDataAsync(request, master).ConfigureAwait(false);
                    }
                    else
                    {
                        return await sendOfflineDataAsync(request, master).ConfigureAwait(false);
                    }
                }
                else
                {
                    return new FBRResponse("FBR Number is Already Generated");
                }
            }
            catch (Exception ex)
            {
                return new FBRResponse(ex.Message.ToString());
            }

        }
        private async Task<FBRResponse> getPCTCodeValidationAsync(FBRRequest request)
        {
            FBRResponse response = new FBRResponse("true");
            try
            {
                foreach (var item in request.Cart.CartLines)
                {
                    if (string.IsNullOrEmpty(await FBRQuries.GetItemPCTCode(item.ItemId, request.RequestContext).ConfigureAwait(false)) && !item.IsVoided)
                    {
                        response.Response = "false";
                        break;
                    }
                }
            }
            catch (Exception ex)
            {
                response.Response = "false";
            }
            return response;
        }

        private async Task<FBRResponse> AJKSendOnlineDataAsync(FBRRequest request, InvoiceAJK master)
        {
            string APIURL = string.Empty;
            string Token = string.Empty;
            string CloudAPI = string.Empty;
            FBRResponse response = new FBRResponse();
            FBRResponseAJK responseAJK = new FBRResponseAJK();
            var settings = new JsonSerializerSettings
            {
                DateFormatString = "yyyy-MM-dd HH:mm:ss"
            };

            var jsonObj = JsonConvert.SerializeObject(master, settings);

            try
            {
                string ResponseFromAJK = string.Empty;
                //  DataTable Table = await FBRQuries.GetAJKFBRAPIURLAsync(request.RequestContext).ConfigureAwait(false);

                //if (Table.Rows.Count > 0)
                //{

                GetConfigurationParametersDataRequest ChannelReq = new GetConfigurationParametersDataRequest(request.RequestContext.GetChannel().RecordId);

                var configurationResponse = await request.RequestContext.ExecuteAsync<EntityDataServiceResponse<RetailConfigurationParameter>>(ChannelReq).ConfigureAwait(false);

                if (configurationResponse != null)
                {
                    if (configurationResponse.Any())
                    {
                        var config = configurationResponse.PagedEntityCollection.Results.Where(p => p.Name.ToLower().Equals("ajkfbrapi")).FirstOrDefault();

                        var Tokenconfig = configurationResponse.PagedEntityCollection.Results.Where(p => p.Name.ToLower().Equals("ajkfbrtoken")).FirstOrDefault();

                        var AJKFBRAPITYPE = configurationResponse.PagedEntityCollection.Results.Where(p => p.Name.ToLower().Equals("ajkfbrapitype")).FirstOrDefault();

                        if (config != null)
                        {
                            if (!string.IsNullOrEmpty(config.Value))
                            {
                                APIURL = config.Value.ToString();
                            }
                        }

                        if (Tokenconfig != null)
                        {
                            if (!string.IsNullOrEmpty(config.Value))
                            {
                                Token = Tokenconfig.Value.ToString();
                            }
                        }

                        if (AJKFBRAPITYPE != null)
                        {
                            if (!string.IsNullOrEmpty(config.Value))
                            {
                                CloudAPI = AJKFBRAPITYPE.Value.ToString();
                            }
                        }
                    }
                }
                //APIURL = Convert.ToString(Table.Rows[0]["CFZAJKFBRAPI"]);
                //CloudAPI = Convert.ToString(Table.Rows[0]["CFZAJKFBRAPITYPE"]);
                //Token = Convert.ToString(Table.Rows[0]["CFZAJKFBRAPITOKEN"]);

                //string CloudAPI = Convert.ToString(Table.Rows[0]["CFZAJKFBRAPITYPE"]);
                //string Token = Convert.ToString(Table.Rows[0]["CFZAJKFBRAPITOKEN"]);
                using (var handler = new HttpClientHandler())
                {
                    handler.ServerCertificateCustomValidationCallback = (sender, certificate, chain, sslPolicyErrors) =>
                    {
                        return true;
                    };

                    using (var client = new HttpClient(handler))
                    {
                        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", Token);

                        using (var content = new StringContent(jsonObj, Encoding.UTF8, "application/json"))
                        {

                            HttpResponseMessage httpResponse = await client.PostAsync(APIURL, content).ConfigureAwait(false);
                            string responseString = await httpResponse.Content.ReadAsStringAsync().ConfigureAwait(false);
                            if (httpResponse.IsSuccessStatusCode)
                            {
                                // Deserialize as Success Response
                                if (responseString.Contains("\"invoiceNumber\""))
                                {
                                    responseAJK = JsonConvert.DeserializeObject<FBRResponseAJK>(responseString);
                                }
                                else
                                {
                                    if (responseString.Contains("\"error\""))
                                    {
                                        JObject jsonObject = JObject.Parse(responseString);
                                        JToken messageKey = jsonObject["validationResponse"]?["message"];
                                        string messageJson = messageKey != null ? messageKey.ToString() : "";
                                        await FBRQuries.InserAJKFBRTransLogAsync(master.USIN, jsonObj, request.RequestContext.GetTerminalId(), Convert.ToString(master.POSID), messageJson, request.RequestContext.GetChannelConfiguration().InventLocationDataAreaId, request.RequestContext).ConfigureAwait(false);
                                        return new FBRResponse("FBR Invoice isn't generated. \nPlease try again");
                                    }
                                }
                            }
                            else
                            {
                                await FBRQuries.InserAJKFBRTransLogAsync(master.USIN, jsonObj, request.RequestContext.GetTerminalId(), Convert.ToString(master.POSID), responseString, request.RequestContext.GetChannelConfiguration().InventLocationDataAreaId, request.RequestContext).ConfigureAwait(false);
                                return new FBRResponse("FBR Invoice isn't generated. \nPlease try again");
                            }
                        }
                    }
                }

                if (responseAJK.ValidationResponse != null && responseAJK.ValidationResponse.ResponseCode.Equals("100"))
                {
                    await FBRQuries.InserAJKFBRTransLogAsync(master.USIN, jsonObj, request.RequestContext.GetTerminalId(), Convert.ToString(master.POSID), JsonConvert.SerializeObject(responseAJK?.ValidationResponse?.Message), request.RequestContext.GetChannelConfiguration().InventLocationDataAreaId, request.RequestContext).ConfigureAwait(false);
                    await FBRQuries.InserAJKFBRIDAsync(master.USIN, responseAJK.InvoiceNumber, master.BuyerCNIC, request.RequestContext).ConfigureAwait(false);
                    return new FBRResponse("");
                }
                else
                {
                    if (responseAJK != null)
                    {
                        await FBRQuries.InserAJKFBRTransLogAsync(master.USIN, jsonObj, request.RequestContext.GetTerminalId(), Convert.ToString(master.POSID), JsonConvert.SerializeObject(responseAJK.ValidationResponse.Message), request.RequestContext.GetChannelConfiguration().InventLocationDataAreaId, request.RequestContext).ConfigureAwait(false);
                    }
                    else
                    {
                        await FBRQuries.InserAJKFBRTransLogAsync(master.USIN, jsonObj, request.RequestContext.GetTerminalId(), Convert.ToString(master.POSID), ResponseFromAJK, request.RequestContext.GetChannelConfiguration().InventLocationDataAreaId, request.RequestContext).ConfigureAwait(false);
                    }

                    return new FBRResponse("FBR Invoice isn't generated. \nPlease try again");
                }
            }
            catch (Exception ex)
            {
                if (ex.InnerException != null)
                {
                    if (ex.InnerException.InnerException != null)
                    {
                        await FBRQuries.InserAJKFBRTransLogAsync(master.USIN, jsonObj, request.RequestContext.GetTerminalId(), Convert.ToString(master.POSID), ex?.InnerException?.InnerException?.Message, request.RequestContext.GetChannelConfiguration().InventLocationDataAreaId, request.RequestContext).ConfigureAwait(false);
                        return new FBRResponse("Error in Transaction. \nPlease try again");
                    }
                    else
                    {
                        await FBRQuries.InserAJKFBRTransLogAsync(master.USIN, jsonObj, request.RequestContext.GetTerminalId(), Convert.ToString(master.POSID), "Exception Case Two" + " - " + ex.InnerException.Message, request.RequestContext.GetChannelConfiguration().InventLocationDataAreaId, request.RequestContext).ConfigureAwait(false);
                        return new FBRResponse("Error in Transaction. \nPlease try again");
                    }
                }
                else
                {
                    await FBRQuries.InserAJKFBRTransLogAsync(master.USIN, jsonObj, request.RequestContext.GetTerminalId(), Convert.ToString(master.POSID), ex?.Message, request.RequestContext.GetChannelConfiguration().InventLocationDataAreaId, request.RequestContext).ConfigureAwait(false);
                   // FBRQuries.InserFBRTransLog(master.USIN, jsonObj, request.RequestContext.GetTerminalId(), Convert.ToString(master.POSID), ex.Message, request.RequestContext.GetChannelConfiguration().InventLocationDataAreaId, request.RequestContext);
                    return new FBRResponse(ex.Message.ToString());
                }
            }

        }
        private async Task<FBRResponse> AJKSendfflineDataAsync(FBRRequest request, InvoiceAJK master)
        {
            FBRResponse response = new FBRResponse();
            var jsonObj = JsonConvert.SerializeObject(master);
            string APIURL = "http://localhost:8524/api/IMSFiscal/GetInvoiceNumberByModel";

            try
            {
                await FBRQuries.InserAJKFBRTransLogAsync(master.USIN, jsonObj, request.RequestContext.GetTerminalId(), Convert.ToString(master.POSID), "Offline not configured yet", request.RequestContext.GetChannelConfiguration().InventLocationDataAreaId, request.RequestContext).ConfigureAwait(false);
                response = new FBRResponse("");
            }
            catch (Exception ex)
            {
                return new FBRResponse("Error in Transaction. \nPlease try again");
            }
            return response;
        }


        private async Task<FBRResponse> AJKGetFBRInvoiceNumberAsync(FBRRequest request)
        {
            try
            {
                if (string.IsNullOrEmpty(await FBRQuries.GetAJKINVOICEIdAsync(request.Cart.Id, request.RequestContext).ConfigureAwait(false)))
                {
                    InvoiceAJK master = new InvoiceAJK();
                    InvoiceItems detail = new InvoiceItems();
                    List<InvoiceItems> details = new List<InvoiceItems>();
                    var (name, phone) = request.Cart.CustomerId != null ? await GetCustomerDetails(request.Cart.CustomerId, request.RequestContext).ConfigureAwait(false) : (null, null);
                    master.BuyerName = string.Empty;

                    if (string.IsNullOrEmpty(name))
                    {
                        master.BuyerName = name;
                    }
                    //master.BuyerName = !string.IsNullOrWhiteSpace(request.custName) ? request.custName : name;
                    master.BuyerPhoneNumber = !string.IsNullOrWhiteSpace(request.Cart.CustomerId) ? phone : string.Empty;
                    master.BuyerNTN = string.Empty;
                    master.BuyerCNIC = string.IsNullOrEmpty(request.CNIC) ? string.Empty : request.CNIC;
                    DateTimeOffset transdate = (DateTimeOffset)request.Cart.BeginDateTime;
                    master.DateTime = transdate.DateTime;
                    master.Discount = Math.Abs(Convert.ToDouble(Convert.ToDouble(request.Cart.DiscountAmount)));
                    master.TotalBillAmount = Convert.ToDouble(Math.Abs(request.Cart.TotalAmount) - Math.Abs(request.Cart.ChargeAmount));
                    master.TotalQuantity = Math.Abs(Convert.ToDouble(request.Cart.TotalItems));                                                 //10;
                    master.TotalSaleValue = Math.Abs(Convert.ToDouble(request.Cart.SubtotalAmountWithoutTax));
                    master.TotalTaxCharged = Math.Abs(Convert.ToDouble(request.Cart.TaxAmount));
                    master.USIN = request.Cart.Id;
                    int POSID = await FBRQuries.GetFBRPOSID(request.Cart.TerminalId, request.RequestContext).ConfigureAwait(false);
                    master.POSID = POSID.ToString();
                    master.RefUSIN = request.Cart.CartLines[0].ReturnTransactionId;

                    if (request.Cart.TotalAmount >= 0)
                    {
                        master.InvoiceType = 1;
                    }
                    else
                    {
                        master.InvoiceType = 3;
                    }

                    master.PaymentMode = int.Parse(FBRQuries.GetPaymentMode(request.Cart.TenderLines.ToList()));


                    foreach (CartLine item in request.Cart.CartLines)
                    {
                        if (item.IsVoided == false)
                        {
                            detail = new InvoiceItems();

                            detail.ItemName = item.Description;
                            detail.PCTCode = await FBRQuries.GetItemPCTCode(item.ItemId, request.RequestContext).ConfigureAwait(false);
                            PCTCode = detail.PCTCode;
                            detail.ItemCode = item.ItemId;
                            detail.Quantity = Math.Abs(Convert.ToDouble(item.Quantity));
                            detail.Discount = Math.Abs(Convert.ToDouble(item.DiscountAmount));
                            detail.TotalAmount = Math.Abs(Convert.ToDouble(item.TotalAmount));
                            detail.TaxRate = (float)item.TaxRatePercent;                        //10;
                            detail.TaxCharged = Math.Abs(Convert.ToDouble(item.TaxAmount));       //10;
                            detail.SaleValue = Math.Abs(Convert.ToDouble(item.NetAmountWithoutTax));       //90;
                            if (item.TotalAmount > 0)
                            {
                                detail.InvoiceType = 1;
                            }
                            else
                            {
                                detail.InvoiceType = 3;
                            }

                            string refusin = "";
                            if (detail.InvoiceType == 3)
                            {
                                refusin = item.ReturnTransactionId;
                            }
                            detail.RefUSIN = refusin;

                            details.Add(detail);
                        }
                    }     //90;

                    master.Items = details.ToArray();

                    if (request.Status.Equals("Online"))
                    {
                        return await AJKSendOnlineDataAsync(request, master).ConfigureAwait(false);
                    }
                    else
                    {
                        return await AJKSendfflineDataAsync(request, master).ConfigureAwait(false);
                    }
                }
                else
                {
                    return new FBRResponse("");
                }
            }
            catch (Exception ex)
            {
                return new FBRResponse("Error in Transaction. \nPlease try again");
            }

        }

        public async Task<(string Name, string Phone)> GetCustomerDetails(string id, RequestContext context)
        {
            try
            {
                GetCustomersServiceRequest getCustomersServiceRequest = new GetCustomersServiceRequest(QueryResultSettings.SingleRecord, id);
                GetCustomersServiceResponse getCustomersServiceResponse = await context.ExecuteAsync<GetCustomersServiceResponse>(getCustomersServiceRequest).ConfigureAwait(false);

                Customer customer = getCustomersServiceResponse.Customers.SingleOrDefault();
                if (customer != null)
                {
                    return (customer.Name, customer.Phone);
                }
                else
                {
                    return (null, null);
                }
            }
            catch (Exception ex)
            {
                return (null, null);
            }

        }

    }
}

public class ValidationResponse
{
    [JsonPropertyName("statusCode")]
    public int StatusCode { get; set; }

    [JsonPropertyName("responseCode")]
    public string ResponseCode { get; set; }

    [JsonPropertyName("message")]
    public string Message { get; set; }
}
public class ClientRequest
{
    [JsonProperty("BuyerCNIC")]
    public string BuyerCNIC { get; set; }

    [JsonProperty("BuyerNTN")]
    public string BuyerNTN { get; set; }

    [JsonProperty("BuyerName")]
    public string BuyerName { get; set; }

    [JsonProperty("BuyerPhoneNumber")]
    public string BuyerPhoneNumber { get; set; }

    [JsonProperty("DateTime")]
    public string DateTime { get; set; }

    [JsonProperty("Discount")]
    public double Discount { get; set; }

    [JsonProperty("FurtherTax")]
    public double FurtherTax { get; set; }

    [JsonProperty("InvoiceNumber")]
    public string InvoiceNumber { get; set; }

    [JsonProperty("InvoiceType")]
    public int InvoiceType { get; set; }

    [JsonProperty("Items")]
    public List<Item> Items { get; set; }

    [JsonProperty("POSID")]
    public string POSID { get; set; }

    [JsonProperty("PaymentMode")]
    public int PaymentMode { get; set; }

    [JsonProperty("RefUSIN")]
    public string RefUSIN { get; set; }

    [JsonProperty("TotalBillAmount")]
    public double TotalBillAmount { get; set; }

    [JsonProperty("TotalQuantity")]
    public double TotalQuantity { get; set; }

    [JsonProperty("TotalSaleValue")]
    public double TotalSaleValue { get; set; }

    [JsonProperty("TotalTaxCharged")]
    public double TotalTaxCharged { get; set; }

    [JsonProperty("USIN")]
    public string USIN { get; set; }
}
public partial class InvoiceAJK
    {

        private string BuyerCNICField;

        private string BuyerNTNField;

        private string BuyerNameField;

        private string BuyerPhoneNumberField;

        private System.DateTime DateTimeField;

        private double DiscountField;

        private double FurtherTaxField;

        private string InvoiceNumberField;

        private int InvoiceTypeField;

        private InvoiceItems[] ItemsField;

        private string POSIDField;

        private int PaymentModeField;

        private string RefUSINField;

        private double TotalBillAmountField;

        private double TotalQuantityField;

        private double TotalSaleValueField;

        private double TotalTaxChargedField;

        private string USINField;

        [System.Runtime.Serialization.DataMemberAttribute()]
        public string BuyerCNIC
        {
            get
            {
                return this.BuyerCNICField;
            }
            set
            {
                this.BuyerCNICField = value;
            }
        }

        [System.Runtime.Serialization.DataMemberAttribute()]
        public string BuyerNTN
        {
            get
            {
                return this.BuyerNTNField;
            }
            set
            {
                this.BuyerNTNField = value;
            }
        }

        [System.Runtime.Serialization.DataMemberAttribute()]
        public string BuyerName
        {
            get
            {
                return this.BuyerNameField;
            }
            set
            {
                this.BuyerNameField = value;
            }
        }

        [System.Runtime.Serialization.DataMemberAttribute()]
        public string BuyerPhoneNumber
        {
            get
            {
                return this.BuyerPhoneNumberField;
            }
            set
            {
                this.BuyerPhoneNumberField = value;
            }
        }

        [System.Runtime.Serialization.DataMemberAttribute()]
        public System.DateTime DateTime
        {
            get
            {
                return this.DateTimeField;
            }
            set
            {
                this.DateTimeField = value;
            }
        }

        [System.Runtime.Serialization.DataMemberAttribute()]
        public double Discount
        {
            get
            {
                return this.DiscountField;
            }
            set
            {
                this.DiscountField = value;
            }
        }

        [System.Runtime.Serialization.DataMemberAttribute()]
        public double FurtherTax
        {
            get
            {
                return this.FurtherTaxField;
            }
            set
            {
                this.FurtherTaxField = value;
            }
        }

        [System.Runtime.Serialization.DataMemberAttribute()]
        public string InvoiceNumber
        {
            get
            {
                return this.InvoiceNumberField;
            }
            set
            {
                this.InvoiceNumberField = value;
            }
        }

        [System.Runtime.Serialization.DataMemberAttribute()]
        public int InvoiceType
        {
            get
            {
                return this.InvoiceTypeField;
            }
            set
            {
                this.InvoiceTypeField = value;
            }
        }

        [System.Runtime.Serialization.DataMemberAttribute()]
        public InvoiceItems[] Items
        {
            get
            {
                return this.ItemsField;
            }
            set
            {
                this.ItemsField = value;
            }
        }

        [System.Runtime.Serialization.DataMemberAttribute()]
        public string POSID
        {
            get
            {
                return this.POSIDField;
            }
            set
            {
                this.POSIDField = value;
            }
        }

        [System.Runtime.Serialization.DataMemberAttribute()]
        public int PaymentMode
        {
            get
            {
                return this.PaymentModeField;
            }
            set
            {
                this.PaymentModeField = value;
            }
        }

        [System.Runtime.Serialization.DataMemberAttribute()]
        public string RefUSIN
        {
            get
            {
                return this.RefUSINField;
            }
            set
            {
                this.RefUSINField = value;
            }
        }

        [System.Runtime.Serialization.DataMemberAttribute()]
        public double TotalBillAmount
        {
            get
            {
                return this.TotalBillAmountField;
            }
            set
            {
                this.TotalBillAmountField = value;
            }
        }

        [System.Runtime.Serialization.DataMemberAttribute()]
        public double TotalQuantity
        {
            get
            {
                return this.TotalQuantityField;
            }
            set
            {
                this.TotalQuantityField = value;
            }
        }

        [System.Runtime.Serialization.DataMemberAttribute()]
        public double TotalSaleValue
        {
            get
            {
                return this.TotalSaleValueField;
            }
            set
            {
                this.TotalSaleValueField = value;
            }
        }

        [System.Runtime.Serialization.DataMemberAttribute()]
        public double TotalTaxCharged
        {
            get
            {
                return this.TotalTaxChargedField;
            }
            set
            {
                this.TotalTaxChargedField = value;
            }
        }

        [System.Runtime.Serialization.DataMemberAttribute()]
        public string USIN
        {
            get
            {
                return this.USINField;
            }
            set
            {
                this.USINField = value;
            }
        }
    }
public class FBRResponseAJK
{
        [JsonProperty("invoiceNumber")]
        public string InvoiceNumber { get; set; }

        [JsonProperty("dated")]
        public string Dated { get; set; }

        [JsonProperty("validationResponse")]
        public ValidationResponse ValidationResponse { get; set; }

        [JsonProperty("clientRequest")]
        public ClientRequest ClientRequest { get; set; }
}
public partial class Invoice
{

        private string BuyerCNICField;

        private string BuyerNTNField;

        private string BuyerNameField;

        private string BuyerPhoneNumberField;

        private System.DateTime DateTimeField;

        private double DiscountField;

        private double FurtherTaxField;

        private string InvoiceNumberField;

        private int InvoiceTypeField;

        private InvoiceItems[] ItemsField;

        private int POSIDField;

        private int PaymentModeField;

        private string RefUSINField;

        private double TotalBillAmountField;

        private double TotalQuantityField;

        private double TotalSaleValueField;

        private double TotalTaxChargedField;

        private string USINField;

        [System.Runtime.Serialization.DataMemberAttribute()]
        public string BuyerCNIC
        {
            get
            {
                return this.BuyerCNICField;
            }
            set
            {
                this.BuyerCNICField = value;
            }
        }

        [System.Runtime.Serialization.DataMemberAttribute()]
        public string BuyerNTN
        {
            get
            {
                return this.BuyerNTNField;
            }
            set
            {
                this.BuyerNTNField = value;
            }
        }

        [System.Runtime.Serialization.DataMemberAttribute()]
        public string BuyerName
        {
            get
            {
                return this.BuyerNameField;
            }
            set
            {
                this.BuyerNameField = value;
            }
        }

        [System.Runtime.Serialization.DataMemberAttribute()]
        public string BuyerPhoneNumber
        {
            get
            {
                return this.BuyerPhoneNumberField;
            }
            set
            {
                this.BuyerPhoneNumberField = value;
            }
        }

        [System.Runtime.Serialization.DataMemberAttribute()]
        public System.DateTime DateTime
        {
            get
            {
                return this.DateTimeField;
            }
            set
            {
                this.DateTimeField = value;
            }
        }

        [System.Runtime.Serialization.DataMemberAttribute()]
        public double Discount
        {
            get
            {
                return this.DiscountField;
            }
            set
            {
                this.DiscountField = value;
            }
        }

        [System.Runtime.Serialization.DataMemberAttribute()]
        public double FurtherTax
        {
            get
            {
                return this.FurtherTaxField;
            }
            set
            {
                this.FurtherTaxField = value;
            }
        }

        [System.Runtime.Serialization.DataMemberAttribute()]
        public string InvoiceNumber
        {
            get
            {
                return this.InvoiceNumberField;
            }
            set
            {
                this.InvoiceNumberField = value;
            }
        }

        [System.Runtime.Serialization.DataMemberAttribute()]
        public int InvoiceType
        {
            get
            {
                return this.InvoiceTypeField;
            }
            set
            {
                this.InvoiceTypeField = value;
            }
        }

        [System.Runtime.Serialization.DataMemberAttribute()]
        public InvoiceItems[] Items
        {
            get
            {
                return this.ItemsField;
            }
            set
            {
                this.ItemsField = value;
            }
        }

        [System.Runtime.Serialization.DataMemberAttribute()]
        public int POSID
        {
            get
            {
                return this.POSIDField;
            }
            set
            {
                this.POSIDField = value;
            }
        }

        [System.Runtime.Serialization.DataMemberAttribute()]
        public int PaymentMode
        {
            get
            {
                return this.PaymentModeField;
            }
            set
            {
                this.PaymentModeField = value;
            }
        }

        [System.Runtime.Serialization.DataMemberAttribute()]
        public string RefUSIN
        {
            get
            {
                return this.RefUSINField;
            }
            set
            {
                this.RefUSINField = value;
            }
        }

        [System.Runtime.Serialization.DataMemberAttribute()]
        public double TotalBillAmount
        {
            get
            {
                return this.TotalBillAmountField;
            }
            set
            {
                this.TotalBillAmountField = value;
            }
        }

        [System.Runtime.Serialization.DataMemberAttribute()]
        public double TotalQuantity
        {
            get
            {
                return this.TotalQuantityField;
            }
            set
            {
                this.TotalQuantityField = value;
            }
        }

        [System.Runtime.Serialization.DataMemberAttribute()]
        public double TotalSaleValue
        {
            get
            {
                return this.TotalSaleValueField;
            }
            set
            {
                this.TotalSaleValueField = value;
            }
        }

        [System.Runtime.Serialization.DataMemberAttribute()]
        public double TotalTaxCharged
        {
            get
            {
                return this.TotalTaxChargedField;
            }
            set
            {
                this.TotalTaxChargedField = value;
            }
        }

        [System.Runtime.Serialization.DataMemberAttribute()]
        public string USIN
        {
            get
            {
                return this.USINField;
            }
            set
            {
                this.USINField = value;
            }
        }
}
public partial class InvoiceItems
{

        private double DiscountField;

        private double FurtherTaxField;

        private int InvoiceTypeField;

        private string ItemCodeField;

        private string ItemNameField;

        private string PCTCodeField;

        private double QuantityField;

        private string RefUSINField;

        private double SaleValueField;

        private double TaxChargedField;

        private float TaxRateField;

        private double TotalAmountField;

        [System.Runtime.Serialization.DataMemberAttribute()]
        public double Discount
        {
            get
            {
                return this.DiscountField;
            }
            set
            {
                this.DiscountField = value;
            }
        }

        [System.Runtime.Serialization.DataMemberAttribute()]
        public double FurtherTax
        {
            get
            {
                return this.FurtherTaxField;
            }
            set
            {
                this.FurtherTaxField = value;
            }
        }

        [System.Runtime.Serialization.DataMemberAttribute()]
        public int InvoiceType
        {
            get
            {
                return this.InvoiceTypeField;
            }
            set
            {
                this.InvoiceTypeField = value;
            }
        }

        [System.Runtime.Serialization.DataMemberAttribute()]
        public string ItemCode
        {
            get
            {
                return this.ItemCodeField;
            }
            set
            {
                this.ItemCodeField = value;
            }
        }

        [System.Runtime.Serialization.DataMemberAttribute()]
        public string ItemName
        {
            get
            {
                return this.ItemNameField;
            }
            set
            {
                this.ItemNameField = value;
            }
        }

        [System.Runtime.Serialization.DataMemberAttribute()]
        public string PCTCode
        {
            get
            {
                return this.PCTCodeField;
            }
            set
            {
                this.PCTCodeField = value;
            }
        }

        [System.Runtime.Serialization.DataMemberAttribute()]
        public double Quantity
        {
            get
            {
                return this.QuantityField;
            }
            set
            {
                this.QuantityField = value;
            }
        }

        [System.Runtime.Serialization.DataMemberAttribute()]
        public string RefUSIN
        {
            get
            {
                return this.RefUSINField;
            }
            set
            {
                this.RefUSINField = value;
            }
        }

        [System.Runtime.Serialization.DataMemberAttribute()]
        public double SaleValue
        {
            get
            {
                return this.SaleValueField;
            }
            set
            {
                this.SaleValueField = value;
            }
        }

        [System.Runtime.Serialization.DataMemberAttribute()]
        public double TaxCharged
        {
            get
            {
                return this.TaxChargedField;
            }
            set
            {
                this.TaxChargedField = value;
            }
        }

        [System.Runtime.Serialization.DataMemberAttribute()]
        public float TaxRate
        {
            get
            {
                return this.TaxRateField;
            }
            set
            {
                this.TaxRateField = value;
            }
        }

        [System.Runtime.Serialization.DataMemberAttribute()]
        public double TotalAmount
        {
            get
            {
                return this.TotalAmountField;
            }
            set
            {
                this.TotalAmountField = value;
            }
        } 
}

