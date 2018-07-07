using System.Collections.Generic;
using DSerfozo.RpcBindings.Contract;
using DSerfozo.RpcBindings.Contract.Marshaling;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace DSerfozo.RpcBindings.Json
{
    public class JsonBinder : IPlatformBinder<JToken>
    {
        private readonly JsonSerializer serializer;

        public JsonBinder(JsonSerializer serializer)
        {
            this.serializer = serializer;
        }

        public JToken BindToWire(object obj)
        {
            return JToken.FromObject(obj, serializer);
        }

        public object BindToNet(Binding<JToken> binding)
        {
            object result = null;
            var val = binding.Value;

            if (binding.TargetType != null)
            {
                result = val?.ToObject(binding.TargetType, serializer);
            }
            else
            {
                if(val?.Type == JTokenType.Object)
                {
                    result = val.ToObject<IDictionary<string, object>>(serializer);
                }
                else
                {
                    result = val?.ToObject<object>(serializer);
                }
            }

            return result;
        }
    }
}
