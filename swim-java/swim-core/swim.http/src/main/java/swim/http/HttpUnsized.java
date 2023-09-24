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

import java.util.Objects;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.codec.Codec;
import swim.codec.Decode;
import swim.codec.Encode;
import swim.codec.EncodeException;
import swim.codec.InputBuffer;
import swim.codec.OutputBuffer;
import swim.http.header.ContentTypeHeader;
import swim.util.Murmur3;
import swim.util.Notation;
import swim.util.WriteSource;

@Public
@Since("5.0")
public final class HttpUnsized<T> extends HttpPayload<T> implements WriteSource {

  final @Nullable T value;
  final Codec<T> codec;

  HttpUnsized(@Nullable T value, Codec<T> codec) {
    this.value = value;
    this.codec = codec;
  }

  @Override
  public boolean isCloseDelimited() {
    return true;
  }

  @Override
  public @Nullable T get() {
    return this.value;
  }

  @Override
  public Codec<T> codec() {
    return this.codec;
  }

  @Override
  public HttpHeaders injectHeaders(HttpHeaders headers) {
    headers.put(ContentTypeHeader.of(this.contentType()));
    return headers;
  }

  @Override
  public HttpHeaders trailers() {
    return HttpHeaders.empty();
  }

  @Override
  public Encode<HttpUnsized<T>> encode(OutputBuffer<?> output) {
    return EncodeHttpUnsized.encode(output, this, null);
  }

  @Override
  public Encode<HttpUnsized<T>> encode() {
    return new EncodeHttpUnsized<T>(this, null);
  }

  @Override
  public boolean equals(@Nullable Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof HttpUnsized<?> that) {
      return Objects.equals(this.value, that.value)
          && this.codec.equals(that.codec);
    }
    return false;
  }

  private static final int HASH_SEED = Murmur3.seed(HttpUnsized.class);

  @Override
  public int hashCode() {
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(HASH_SEED,
        Objects.hashCode(this.value)), this.codec.hashCode()));
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("HttpUnsized", "of")
            .appendArgument(this.value)
            .appendArgument(this.codec)
            .endInvoke();
  }

  @Override
  public String toString() {
    return WriteSource.toString(this);
  }

  public static <T> HttpUnsized<T> of(@Nullable T value, Codec<T> codec) {
    return new HttpUnsized<T>(value, codec);
  }

  public static <T> Decode<HttpUnsized<T>> decode(InputBuffer input, Codec<T> codec) {
    return DecodeHttpUnsized.decode(input, codec, null);
  }

  public static <T> Decode<HttpUnsized<T>> decode(Codec<T> codec) {
    return new DecodeHttpUnsized<T>(codec, null);
  }

}

final class DecodeHttpUnsized<T> extends Decode<HttpUnsized<T>> {

  final Codec<T> codec;
  final @Nullable Decode<T> decodePayload;

  DecodeHttpUnsized(Codec<T> codec, @Nullable Decode<T> decodePayload) {
    this.codec = codec;
    this.decodePayload = decodePayload;
  }

  @Override
  public Decode<HttpUnsized<T>> consume(InputBuffer input) {
    return DecodeHttpUnsized.decode(input, this.codec, this.decodePayload);
  }

  static <T> Decode<HttpUnsized<T>> decode(InputBuffer input, Codec<T> codec,
                                           @Nullable Decode<T> decodePayload) {
    if (decodePayload == null) {
      decodePayload = codec.decode(input);
    } else {
      decodePayload = decodePayload.consume(input);
    }
    if (decodePayload.isDone()) {
      return Decode.done(HttpUnsized.of(decodePayload.getUnchecked(), codec));
    } else if (decodePayload.isError()) {
      return decodePayload.asError();
    }
    if (input.isError()) {
      return Decode.error(input.getError());
    }
    return new DecodeHttpUnsized<T>(codec, decodePayload);
  }

}

final class EncodeHttpUnsized<T> extends Encode<HttpUnsized<T>> {

  final HttpUnsized<T> payload;
  final @Nullable Encode<?> encode;

  EncodeHttpUnsized(HttpUnsized<T> payload, @Nullable Encode<?> encode) {
    this.payload = payload;
    this.encode = encode;
  }

  @Override
  public Encode<HttpUnsized<T>> produce(OutputBuffer<?> output) {
    return EncodeHttpUnsized.encode(output, this.payload, this.encode);
  }

  static <T> Encode<HttpUnsized<T>> encode(OutputBuffer<?> output, HttpUnsized<T> payload,
                                           @Nullable Encode<?> encode) {
    if (encode == null) {
      encode = payload.codec.encode(output, payload.value);
    } else {
      encode = encode.produce(output);
    }
    if (encode.isDone()) {
      return Encode.done(payload);
    } else if (encode.isError()) {
      return encode.asError();
    }
    if (output.isDone()) {
      return Encode.error(new EncodeException("truncated encode"));
    } else if (output.isError()) {
      return Encode.error(output.getError());
    }
    return new EncodeHttpUnsized<T>(payload, encode);
  }

}
