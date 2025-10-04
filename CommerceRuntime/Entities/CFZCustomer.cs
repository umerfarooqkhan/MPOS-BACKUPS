using Microsoft.Dynamics.Commerce.Runtime.ComponentModel.DataAnnotations;
using Microsoft.Dynamics.Commerce.Runtime.DataModel;
using System.Runtime.Serialization;
using SystemAnnotations = System.ComponentModel.DataAnnotations;

namespace Confiz.CommerceRuntime.Entities.DataModel
{
    public class CFZCustomer : CommerceEntity
    {
        private const string IdColumn = "Id";
        public CFZCustomer() : base("CFZCustomer")
        { }

        [SystemAnnotations.Key]
        [DataMember]
        [Column(IdColumn)]
        public long UnusualEntityId
        {
            get { return (long)this[IdColumn]; }
            set { this[IdColumn] = value; }
        }
    }
}
