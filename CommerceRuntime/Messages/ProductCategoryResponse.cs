namespace Confiz.CommerceRuntime.Messages
{
    using Microsoft.Dynamics.Commerce.Runtime.Messages;
    using System.Runtime.Serialization;

    [DataContract]
    public class ProductCategoryResponse : Response
    {

        // <summary>
        /// Initializes a new instance of the <see cref="ProductCategoryesponse"/> class.
        /// </summary>

        public ProductCategoryResponse(string Response)
        {
            this.Response = Response;
        }

        [DataMember]
        public string Response { get; set; }
    }
}
