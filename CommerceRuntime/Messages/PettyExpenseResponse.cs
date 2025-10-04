namespace Confiz.CommerceRuntime.Messages
{
    using Microsoft.Dynamics.Commerce.Runtime.Messages;
    using System.Runtime.Serialization;

    [DataContract]
    public class PettyExpenseResponse : Response
    {

        // <summary>
        /// Initializes a new instance of the <see cref="CustDiscountResponse"/> class.
        /// </summary>

        public PettyExpenseResponse(string Result = "")
        {
            this.Result = Result;
        }

        [DataMember]
        public string Result { get; set; }
    }
}
