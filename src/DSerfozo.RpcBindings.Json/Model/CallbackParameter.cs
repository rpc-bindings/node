using Newtonsoft.Json;

namespace DSerfozo.RpcBindings.Json.Model
{
    public class CallbackParameter
    {
        [JsonProperty("functionId")]
        public long FunctionId { get; set; }
    }
}
