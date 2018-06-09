using System;
using System.IO;
using System.Runtime.Serialization;
using DSerfozo.RpcBindings.Contract;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Newtonsoft.Json.Serialization;
using Xunit;

namespace DSerfozo.RpcBindings.Json.Tests
{
    public class ShouldSerializeContractResolverTests
    {
        [DataContract]
        private class TestData
        {
            [DataMember]
            public string Serialized { get; set; }

            [JsonProperty]
            public string SerializedToo { get; set; }

            public string NotSerialized { get; set; }
        }

        [Fact]
        public void CamelCase()
        {
            var resolver = new CamelCasePropertyNamesContractResolver();
            var serializer = new JsonSerializer()
            {
                ContractResolver = resolver
            };


            using (var strWriter = new StringWriter())
            {
                serializer.Serialize(strWriter, new TestData()
                {
                    Serialized = "serialized",
                    NotSerialized = "not-serialized"
                });

                var serialized = strWriter.ToString();

                Assert.Contains("\"serialized\":", serialized);
            }
        }
    }
}
