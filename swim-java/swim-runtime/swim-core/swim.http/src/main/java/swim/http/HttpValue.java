// Copyright 2015-2023 Swim.inc
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
import swim.util.Murmur3;

public final class HttpValue<T> extends HttpPayload<T> implements Debug {

  final T payloadValue;
  final MediaType mediaType;

  HttpValue(T payloadValue, MediaType mediaType) {
    this.payloadValue = payloadValue;
    this.mediaType = mediaType;
  }

  @Override
  public boolean isDefined() {
    return true;
  }

  @Override
  public T get() {
    return this.payloadValue;
  }

  @Override
  public MediaType mediaType() {
    return this.mediaType;
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
    throw new UnsupportedOperationException();
  }

  @Override
  public <T2> Encoder<?, HttpMessage<T2>> encodeHttp(OutputBuffer<?> output,
                                                     HttpMessage<T2> message, HttpWriter http) {
    throw new UnsupportedOperationException();
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof HttpValue<?>) {
      final HttpValue<?> that = (HttpValue<?>) other;
      return (this.payloadValue == null ? that.payloadValue == null : this.payloadValue.equals(that.payloadValue))
          && (this.mediaType == null ? that.mediaType == null : this.mediaType.equals(that.mediaType));
    }
    return false;
  }

  private static int hashSeed;

  @Override
  public int hashCode() {
    if (HttpValue.hashSeed == 0) {
      HttpValue.hashSeed = Murmur3.seed(HttpValue.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(HttpValue.hashSeed,
        Murmur3.hash(this.payloadValue)), Murmur3.hash(this.mediaType)));
  }

  @Override
  public <T> Output<T> debug(Output<T> output) {
    output = output.write("HttpValue").write('.').write("create").write('(').debug(this.payloadValue);
    if (this.mediaType != null) {
      output = output.write(", ").debug(this.mediaType);
    }
    output = output.write(')');
    return output;
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  public static <T> HttpValue<T> create(T payloadValue, MediaType mediaType) {
    return new HttpValue<T>(payloadValue, mediaType);
  }

  public static <T> HttpValue<T> create(T payloadValue) {
    return new HttpValue<T>(payloadValue, null);
  }

}
