
// Copyright 2015-2022 Swim.inc
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

import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.codec.Binary;
import swim.codec.Codec;
import swim.codec.Decode;
import swim.codec.Encode;
import swim.codec.InputBuffer;
import swim.codec.OutputBuffer;
import swim.util.Assume;
import swim.util.Notation;
import swim.util.ToSource;

@Public
@Since("5.0")
public final class HttpEmpty<T> extends HttpPayload<T> implements ToSource {

  private HttpEmpty() {
    // singleton
  }

  @Override
  public boolean isCloseDelimited() {
    return false;
  }

  @Override
  public @Nullable T get() {
    return null;
  }

  @Override
  public Codec<T> codec() {
    return Binary.blankCodec();
  }

  @Override
  public HttpHeaders injectHeaders(HttpHeaders headers) {
    return headers;
  }

  @Override
  public HttpHeaders trailers() {
    return HttpHeaders.empty();
  }

  @Override
  public Encode<HttpEmpty<T>> encode(OutputBuffer<?> output) {
    return Assume.conforms(ENCODE_PAYLOAD);
  }

  @Override
  public Encode<HttpEmpty<T>> encode() {
    return Assume.conforms(ENCODE_PAYLOAD);
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("HttpEmpty", "payload").endInvoke();
  }

  @Override
  public String toString() {
    return this.toSource();
  }

  static final HttpEmpty<?> PAYLOAD = new HttpEmpty<Object>();

  static final Decode<HttpEmpty<?>> DECODE_PAYLOAD = Decode.done(PAYLOAD);

  static final Encode<HttpEmpty<?>> ENCODE_PAYLOAD = Encode.done(PAYLOAD);

  public static <T> HttpEmpty<T> payload() {
    return Assume.conforms(PAYLOAD);
  }

  public static <T> Decode<HttpEmpty<T>> decode(InputBuffer input) {
    return Assume.conforms(DECODE_PAYLOAD);
  }

  public static <T> Decode<HttpEmpty<T>> decode() {
    return Assume.conforms(DECODE_PAYLOAD);
  }

}
