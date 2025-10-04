namespace Confiz.CommerceRuntime.Messages
{
    using Microsoft.Dynamics.Commerce.Runtime.Messages;
    using System.Runtime.Serialization;
    using Microsoft.Dynamics.Commerce.Runtime.DataModel;

    [DataContract]
    public class CustDiscountRequest : Request
    {
        /// <summary>
        /// CustDiscountRequest
        /// </summary>
        /// <param name="CustAccount"></param>
        /// <param name="Check"></param>
        public CustDiscountRequest(string CustAccount, bool Check)
        {
            this.CustAccount = CustAccount;
            this.CheckDiscBalance = Check;
        }
        /// <summary>
        /// CustDiscountRequest
        /// </summary>
        /// <param name="CustAccount"></param>
        /// <param name="Check"></param>
        public CustDiscountRequest(string CustAccount, int ValidationType, int LimitType, bool Check)
        {
            this.CustAccount = CustAccount;
            this.ValidationType = ValidationType;
            this.LimitType = LimitType;
            this.CheckDiscBalance = Check;
        }
        /// <summary>
        /// CustDiscountRequest
        /// </summary>
        /// <param name="cart"></param>
        /// <param name="Check"></param>
        public CustDiscountRequest(Cart Cart)
        {
            this.Cart = Cart;
        }

        /// <summary>
        /// Gets the Transaction ID.
        /// </summary>
        [DataMember]
        public string CustAccount { get; set; }

        [DataMember]
        public int ValidationType { get; set; }

        [DataMember]
        public int LimitType { get; set; }

        [DataMember]
        public bool CheckDiscBalance { get; set; }

        [DataMember]
        public Cart Cart { get; set; }

    }

}
