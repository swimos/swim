// Copyright 2015-2021 Swim Inc.
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

import swim.codec.Encoder;
import swim.codec.OutputBuffer;
import swim.collections.FingerTrieSeq;

public abstract class HttpPayload<T> {

  public abstract boolean isDefined();

  public abstract T get();

  public abstract MediaType mediaType();

  public abstract FingerTrieSeq<TransferCoding> transferCodings();

  public abstract FingerTrieSeq<HttpHeader> headers();

  public abstract <T2> Encoder<?, HttpMessage<T2>> httpEncoder(HttpMessage<T2> message, HttpWriter http);

  public <T2> Encoder<?, HttpMessage<T2>> httpEncoder(HttpMessage<T2> message) {
    return this.httpEncoder(message, Http.standardWriter());
  }

  public abstract <T2> Encoder<?, HttpMessage<T2>> encodeHttp(OutputBuffer<?> output,
                                                              HttpMessage<T2> message, HttpWriter http);

  public <T2> Encoder<?, HttpMessage<T2>> encodeHttp(OutputBuffer<?> output, HttpMessage<T2> message) {
    return this.encodeHttp(output, message, Http.standardWriter());
  }

  private static HttpPayload<Object> empty;

  @SuppressWarnings("unchecked")
  public static <T> HttpPayload<T> empty() {
    if (HttpPayload.empty == null) {
      HttpPayload.empty = new HttpEmpty();
    }
    return (HttpPayload<T>) HttpPayload.empty;
  }

}
