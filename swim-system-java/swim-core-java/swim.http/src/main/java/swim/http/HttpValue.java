// Copyright 2015-2019 SWIM.AI inc.
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

public final class HttpValue<T> extends HttpEntity<T> implements Debug {
  final T value;
  final MediaType mediaType;

  HttpValue(T value, MediaType mediaType) {
    this.value = value;
    this.mediaType = mediaType;
  }

  @Override
  public boolean isDefined() {
    return true;
  }

  @Override
  public T get() {
    return this.value;
  }

  @Override
  public long length() {
    return -1L;
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
  public <T2> Encoder<?, HttpMessage<T2>> encodeHttp(HttpMessage<T2> message,
                                                     OutputBuffer<?> output, HttpWriter http) {
    throw new UnsupportedOperationException();
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof HttpValue<?>) {
      final HttpValue<?> that = (HttpValue<?>) other;
      return (this.value == null ? that.value == null : this.value.equals(that.value))
          && (this.mediaType == null ? that.mediaType == null : this.mediaType.equals(that.mediaType));
    }
    return false;
  }

  @Override
  public int hashCode() {
    if (hashSeed == 0) {
      hashSeed = Murmur3.seed(HttpValue.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(hashSeed,
        Murmur3.hash(this.value)), Murmur3.hash(this.mediaType)));
  }

  @Override
  public void debug(Output<?> output) {
    output = output.write("HttpValue").write('.').write("from").write('(').debug(this.value);
    if (this.mediaType != null) {
      output = output.write(", ").debug(this.mediaType);
    }
    output = output.write(')');
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  private static int hashSeed;

  public static <T> HttpValue<T> from(T value, MediaType mediaType) {
    return new HttpValue<T>(value, mediaType);
  }

  public static <T> HttpValue<T> from(T value) {
    return new HttpValue<T>(value, null);
  }
}
