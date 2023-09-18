// Copyright 2015-2023 Nstream, inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package swim.http;

import swim.codec.Debug;
import swim.codec.Encoder;
import swim.codec.Format;
import swim.codec.Output;
import swim.codec.OutputBuffer;
import swim.collections.FingerTrieSeq;

final class HttpEmpty extends HttpPayload<Object> implements Debug {

  @Override
  public boolean isDefined() {
    return false;
  }

  @Override
  public Object get() {
    return null;
  }

  @Override
  public MediaType mediaType() {
    return null;
  }

  @Override
  public FingerTrieSeq<TransferCoding> transferCodings() {
    return FingerTrieSeq.empty();
  }

  @Override
  public FingerTrieSeq<HttpHeader> headers() {
    return FingerTrieSeq.empty();
  }

  @Override
  public <T2> Encoder<?, HttpMessage<T2>> httpEncoder(HttpMessage<T2> message, HttpWriter http) {
    return Encoder.done(message);
  }

  @Override
  public <T2> Encoder<?, HttpMessage<T2>> encodeHttp(OutputBuffer<?> output,
                                                     HttpMessage<T2> message, HttpWriter http) {
    return Encoder.done(message);
  }

  @Override
  public <T> Output<T> debug(Output<T> output) {
    output = output.write("HttpPayload").write('.').write("empty").write('(').write(')');
    return output;
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

}
