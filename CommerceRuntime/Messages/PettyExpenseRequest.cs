namespace Confiz.CommerceRuntime.Messages
{
    using Microsoft.Dynamics.Commerce.Runtime.Messages;
    using System.Runtime.Serialization;
    using Microsoft.Dynamics.Commerce.Runtime.DataModel;

    [DataContract]
    public class PettyExpenseRequest : Request
    {
        /// <summary>
        /// PettyExpenseRequest
        /// </summary>
        /// <param name="CustAccount"></param>
        /// <param name="Check"></param>
        public PettyExpenseRequest(Cart Cart, int Check)
        {
            this.Cart = Cart;
            this.CheckGetUpdate = Check;
        }
        /// <summary>
        /// PettyExpenseRequest
        /// </summary>
        /// <param name="CustAccount"></param>
        /// <param name="Check"></param>
        public PettyExpenseRequest(Cart Cart, int ValidationType, int LimitType, int Check)
        {
            this.Cart = Cart;
            this.ValidationType = ValidationType;
            this.LimitType = LimitType;
            this.CheckGetUpdate = Check;
        }
        /// <summary>
        /// CustDiscountRequest
        /// </summary>
        /// <param name="cart"></param>
        /// <param name="Check"></param>
        public PettyExpenseRequest(Cart Cart)
        {
            this.Cart = Cart;
        }

        [DataMember]
        public int ValidationType { get; set; }

        [DataMember]
        public int LimitType { get; set; }

        [DataMember]
        public int CheckGetUpdate { get; set; }

        [DataMember]
        public Cart Cart { get; set; }

    }

}
