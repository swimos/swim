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
import swim.codec.Decode;
import swim.codec.DecodeException;
import swim.codec.Encode;
import swim.codec.EncodeException;
import swim.codec.InputBuffer;
import swim.codec.OutputBuffer;
import swim.codec.Transcoder;
import swim.http.header.ContentLengthHeader;
import swim.http.header.ContentTypeHeader;
import swim.util.Murmur3;
import swim.util.Notation;
import swim.util.ToSource;

@Public
@Since("5.0")
public final class HttpBody<T> extends HttpPayload<T> implements ToSource {

  final @Nullable T value;
  final Transcoder<T> transcoder;
  long contentLength;

  HttpBody(@Nullable T value, Transcoder<T> transcoder, long contentLength) {
    this.value = value;
    this.transcoder = transcoder;
    this.contentLength = contentLength;
  }

  HttpBody(@Nullable T value, Transcoder<T> transcoder) {
    this(value, transcoder, -1L);
  }

  @Override
  public @Nullable T get() {
    return this.value;
  }

  @Override
  public Transcoder<T> transcoder() {
    return this.transcoder;
  }

  public long contentLength() {
    if (this.contentLength < 0) {
      this.contentLength = this.transcoder.sizeOf(this.value);
    }
    return this.contentLength;
  }

  @Override
  public HttpHeaders headers() {
    final HttpHeaders headers = HttpHeaders.of();
    headers.add(ContentTypeHeader.of(this.contentType()));
    headers.add(ContentLengthHeader.of(this.contentLength()));
    return headers;
  }

  @Override
  public Encode<HttpBody<T>> encode(OutputBuffer<?> output) {
    return EncodeHttpBody.encode(output, this, null, 0L);
  }

  @Override
  public Encode<HttpBody<T>> encode() {
    return new EncodeHttpBody<T>(this, null, 0L);
  }

  @Override
  public boolean equals(@Nullable Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof HttpBody<?>) {
      final HttpBody<?> that = (HttpBody<?>) other;
      return Objects.equals(this.value, that.value)
          && this.transcoder.equals(that.transcoder);
    }
    return false;
  }

  private static final int HASH_SEED = Murmur3.seed(HttpBody.class);

  @Override
  public int hashCode() {
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(HASH_SEED,
        Objects.hashCode(this.value)), this.transcoder.hashCode()));
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("HttpBody", "of")
            .appendArgument(this.value)
            .appendArgument(this.transcoder)
            .endInvoke();
  }

  @Override
  public String toString() {
    return this.toSource();
  }

  public static <T> HttpBody<T> of(@Nullable T value, Transcoder<T> transcoder,
                                   long contentLength) {
    return new HttpBody<T>(value, transcoder, contentLength);
  }

  public static <T> HttpBody<T> of(@Nullable T value, Transcoder<T> transcoder) {
    return new HttpBody<T>(value, transcoder);
  }

  public static <T> Decode<HttpBody<T>> decode(InputBuffer input,
                                               Transcoder<T> transcoder,
                                               long contentLength) {
    return DecodeHttpBody.decode(input, transcoder, null, contentLength, 0L);
  }

  public static <T> Decode<HttpBody<T>> decode(Transcoder<T> transcoder,
                                               long contentLength) {
    return new DecodeHttpBody<T>(transcoder, null, contentLength, 0L);
  }

}

final class DecodeHttpBody<T> extends Decode<HttpBody<T>> {

  final Transcoder<T> transcoder;
  final @Nullable Decode<T> decodePayload;
  final long contentLength;
  final long offset;

  DecodeHttpBody(Transcoder<T> transcoder, @Nullable Decode<T> decodePayload,
                 long contentLength, long offset) {
    this.transcoder = transcoder;
    this.decodePayload = decodePayload;
    this.contentLength = contentLength;
    this.offset = offset;
  }

  @Override
  public Decode<HttpBody<T>> consume(InputBuffer input) {
    return DecodeHttpBody.decode(input, this.transcoder, this.decodePayload,
                                 this.contentLength, this.offset);
  }

  static <T> Decode<HttpBody<T>> decode(InputBuffer input, Transcoder<T> transcoder,
                                        @Nullable Decode<T> decodePayload,
                                        long contentLength, long offset) {
    final int inputStart = input.position();
    final int inputLimit = input.limit();
    final int inputRemaining = inputLimit - inputStart;
    final boolean inputLast = input.isLast();
    final long bodyRemaining = contentLength - offset;
    final int decodeSize = (int) Math.min((long) inputRemaining, bodyRemaining);

    input.limit(inputStart + decodeSize).asLast(bodyRemaining <= (long) inputRemaining);
    if (decodePayload == null) {
      decodePayload = transcoder.decode(input);
    } else {
      decodePayload = decodePayload.consume(input);
    }
    input.limit(inputLimit).asLast(inputLast);

    offset += (long) (input.position() - inputStart);
    if (offset == contentLength) {
      return Decode.done(HttpBody.of(decodePayload.get(), transcoder, contentLength));
    } else if (decodePayload.isDone()) {
      return Decode.error(new DecodeException("Undecoded payload data"));
    } else if (decodePayload.isError()) {
      return decodePayload.asError();
    }
    if (input.isError()) {
      return Decode.error(input.getError());
    }
    return new DecodeHttpBody<T>(transcoder, decodePayload, contentLength, offset);
  }

}

final class EncodeHttpBody<T> extends Encode<HttpBody<T>> {

  final HttpBody<T> payload;
  final @Nullable Encode<?> encode;
  final long offset;

  EncodeHttpBody(HttpBody<T> payload, @Nullable Encode<?> encode, long offset) {
    this.payload = payload;
    this.encode = encode;
    this.offset = offset;
  }

  @Override
  public Encode<HttpBody<T>> produce(OutputBuffer<?> output) {
    return EncodeHttpBody.encode(output, this.payload, this.encode, this.offset);
  }

  static <T> Encode<HttpBody<T>> encode(OutputBuffer<?> output, HttpBody<T> payload,
                                        @Nullable Encode<?> encode, long offset) {
    final long contentLength = payload.contentLength();
    final int outputStart = output.position();
    final int outputLimit = output.limit();
    final int outputRemaining = outputLimit - outputStart;
    final long inputRemaining = contentLength - offset;

    final boolean outputLast = output.isLast();
    if (inputRemaining <= (long) outputRemaining) {
      output.limit(outputStart + (int) inputRemaining).asLast(true);
      if (encode == null) {
        encode = payload.transcoder.encode(output, payload.value);
      } else {
        encode = encode.produce(output);
      }
      output.limit(outputLimit);
    } else {
      output.asLast(false);
      if (encode == null) {
        encode = payload.transcoder.encode(output, payload.value);
      } else {
        encode = encode.produce(output);
      }
    }
    output.asLast(outputLast);

    offset += (long) (output.position() - outputStart);
    if (offset == contentLength) {
      return Encode.done(payload);
    } else if (encode.isError()) {
      return encode.asError();
    }
    if (output.isDone()) {
      return Encode.error(new EncodeException("Truncated encode"));
    } else if (output.isError()) {
      return Encode.error(output.getError());
    }
    return new EncodeHttpBody<T>(payload, encode, offset);
  }

}
