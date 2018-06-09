using System;
using System.Reactive.Concurrency;
using DSerfozo.RpcBindings.Contract.Communication;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Newtonsoft.Json.Serialization;

namespace DSerfozo.RpcBindings.Json
{
    public class JsonRpcBindingHost : RpcBindingHost<JToken>
    {
        private static readonly JsonSerializer JsonSerializer = new JsonSerializer
        {
            ContractResolver = new CamelCasePropertyNamesContractResolver()
        };

        public JsonRpcBindingHost(Func<JsonSerializer, IConnection<JToken>> connectionFactory)
            :base(connectionFactory(JsonSerializer), new JsonBinder(JsonSerializer), new EventLoopScheduler())
        {
            
        }
    }
}
