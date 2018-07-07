using System;
using System.IO;
using System.Reactive.Concurrency;
using System.Reactive.Subjects;
using System.Text;
using System.Threading.Tasks;
using DSerfozo.RpcBindings.Contract;
using DSerfozo.RpcBindings.Contract.Communication;
using DSerfozo.RpcBindings.Contract.Communication.Model;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace DSerfozo.RpcBindings.Json
{
    public class LineDelimitedJsonConnection : IConnection<JToken>
    {
        private const int StreamBufferSize = 16 * 1024;
        private static readonly Encoding Utf8EncodingWithoutBom = new UTF8Encoding(false);

        private readonly ISubject<RpcResponse<JToken>> rpcResponseSubject =
            Subject.Synchronize(new Subject<RpcResponse<JToken>>(), new EventLoopScheduler());
        private readonly JsonSerializer jsonSerializer;
        private bool failedWrite;
        private Stream inputStream;
        private Stream outputStream;

        public static IConnection<JToken> Create(JsonSerializer jsonSerializer)
        {
            return new LineDelimitedJsonConnection(jsonSerializer);
        }

        public bool IsOpen => outputStream != null && !failedWrite;

        public LineDelimitedJsonConnection(JsonSerializer jsonSerializer)
        {
            this.jsonSerializer = jsonSerializer;
        }

        public void Initialize(Stream inputStream, Stream outputStream)
        {
            this.inputStream = inputStream;
            this.outputStream = outputStream;

            ReadLoop();
        }

        public void Send(RpcRequest<JToken> rpcRequest)
        {
            //the underlying connection can be severed at any moment, even in the disposes of the below created objects
            //for example when this is called from the finalizer thread
            try
            {
                using (var writer = new StreamWriter(outputStream, Utf8EncodingWithoutBom, StreamBufferSize, true))
                using (var stringWriter = new StringWriter())
                using (var jsonWriter = new JsonTextWriter(stringWriter))
                {
                    jsonWriter.CloseOutput = false;

                    jsonSerializer.Serialize(jsonWriter, rpcRequest);

                    writer.WriteLine(stringWriter.ToString());
                }
            }
            catch
            {
                failedWrite = true;
            }
        }

        public IDisposable Subscribe(IObserver<RpcResponse<JToken>> observer)
        {
            return rpcResponseSubject.Subscribe(observer);
        }

        private async void ReadLoop()
        {
            var streamReader = new StreamReader(inputStream);

            while (inputStream.CanRead)
            {
                var line = await streamReader.ReadLineAsync().ConfigureAwait(false);
                if (line == null)
                {
                    break;
                }
                var response = jsonSerializer.Deserialize<RpcResponse<JToken>>(new JsonTextReader(new StringReader(line)));
                rpcResponseSubject.OnNext(response);
            }
        }

        public void Dispose()
        {
        }
    }
}
