namespace Confiz.CommerceRuntime.Messages
{
    using Microsoft.Dynamics.Commerce.Runtime.Messages;
    using System.Runtime.Serialization;

    [DataContract]
    public class ProductCategoryRequest : Request
    {
        /// <summary>
        /// CustDiscountRequest
        /// </summary>
        /// <param name="cart"></param>
        /// <param name="Check"></param>
        public ProductCategoryRequest(string ItemID)
        {
            this.ItemID = ItemID;
        }

        /// <summary>
        /// Gets the Transaction ID.
        /// </summary>
        [DataMember]
        public string ItemID { get; set; }

    }

}
