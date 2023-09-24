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
import swim.codec.Base16;
import swim.codec.Codec;
import swim.codec.Decode;
import swim.codec.DecodeException;
import swim.codec.Diagnostic;
import swim.codec.Encode;
import swim.codec.EncodeException;
import swim.codec.InputBuffer;
import swim.codec.OutputBuffer;
import swim.codec.Parse;
import swim.http.header.ContentTypeHeader;
import swim.http.header.TransferEncodingHeader;
import swim.util.Assume;
import swim.util.Murmur3;
import swim.util.Notation;
import swim.util.WriteSource;

@Public
@Since("5.0")
public final class HttpChunked<T> extends HttpPayload<T> implements WriteSource {

  final @Nullable T value;
  final Codec<T> codec;
  final HttpHeaders trailers;

  HttpChunked(@Nullable T value, Codec<T> codec, HttpHeaders trailers) {
    this.value = value;
    this.codec = codec;
    this.trailers = trailers;
  }

  @Override
  public boolean isCloseDelimited() {
    return false;
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
    headers.put(TransferEncodingHeader.CHUNKED);
    return headers;
  }

  @Override
  public HttpHeaders trailers() {
    return this.trailers;
  }

  public HttpChunked<T> withTrailers(HttpHeaders trailers) {
    return HttpChunked.of(this.value, this.codec, trailers);
  }

  @Override
  public Encode<HttpChunked<T>> encode(OutputBuffer<?> output) {
    return EncodeHttpChunked.encode(output, this, null, 1);
  }

  @Override
  public Encode<HttpChunked<T>> encode() {
    return new EncodeHttpChunked<T>(this, null, 1);
  }

  @Override
  public boolean equals(@Nullable Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof HttpChunked<?> that) {
      return Objects.equals(this.value, that.value)
          && this.codec.equals(that.codec)
          && this.trailers.equals(that.trailers);
    }
    return false;
  }

  private static final int HASH_SEED = Murmur3.seed(HttpChunked.class);

  @Override
  public int hashCode() {
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(HASH_SEED,
        Objects.hashCode(this.value)), this.codec.hashCode()), this.trailers.hashCode()));
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("HttpChunked", "of")
            .appendArgument(this.value)
            .appendArgument(this.codec)
            .endInvoke();
    if (!this.trailers.isEmpty()) {
      notation.beginInvoke("withTrailers")
              .appendArgument(this.trailers)
              .endInvoke();
    }
  }

  @Override
  public String toString() {
    return WriteSource.toString(this);
  }

  public static <T> HttpChunked<T> of(@Nullable T value, Codec<T> codec, HttpHeaders trailers) {
    return new HttpChunked<T>(value, codec, trailers);
  }

  public static <T> HttpChunked<T> of(@Nullable T value, Codec<T> codec) {
    return new HttpChunked<T>(value, codec, HttpHeaders.empty());
  }

  public static <T> Decode<HttpChunked<T>> decode(InputBuffer input, Codec<T> codec) {
    return DecodeHttpChunked.decode(input, codec, null, null, null, 0L, 1);
  }

  public static <T> Decode<HttpChunked<T>> decode(Codec<T> codec) {
    return new DecodeHttpChunked<T>(codec, null, null, null, 0L, 1);
  }

}

final class DecodeHttpChunked<T> extends Decode<HttpChunked<T>> {

  final Codec<T> codec;
  final @Nullable Parse<HttpChunkHeader> parseHeader;
  final @Nullable Decode<T> decodePayload;
  final @Nullable Parse<HttpHeaders> parseTrailers;
  final long offset;
  final int step;

  DecodeHttpChunked(Codec<T> codec, @Nullable Parse<HttpChunkHeader> parseHeader,
                    @Nullable Decode<T> decodePayload, @Nullable Parse<HttpHeaders> parseTrailers,
                    long offset, int step) {
    this.codec = codec;
    this.parseHeader = parseHeader;
    this.decodePayload = decodePayload;
    this.parseTrailers = parseTrailers;
    this.offset = offset;
    this.step = step;
  }

  @Override
  public Decode<HttpChunked<T>> consume(InputBuffer input) {
    return DecodeHttpChunked.decode(input, this.codec, this.parseHeader, this.decodePayload,
                                    this.parseTrailers, this.offset, this.step);
  }

  static <T> Decode<HttpChunked<T>> decode(InputBuffer input, Codec<T> codec,
                                           @Nullable Parse<HttpChunkHeader> parseHeader,
                                           @Nullable Decode<T> decodePayload,
                                           @Nullable Parse<HttpHeaders> parseTrailers,
                                           long offset, int step) {
    do {
      if (step == 1) {
        if (parseHeader == null) {
          parseHeader = HttpChunkHeader.parse(input);
        } else {
          parseHeader = parseHeader.consume(input);
        }
        if (parseHeader.isDone()) {
          step = 2;
        } else if (parseHeader.isError()) {
          return parseHeader.asError();
        }
      }
      if (step == 2) {
        if (input.isCont() && input.head() == '\r') {
          input.step();
          step = 3;
        } else if (input.isReady()) {
          return Parse.error(Diagnostic.expected("carriage return", input));
        }
      }
      if (step == 3) {
        if (input.isCont() && input.head() == '\n') {
          input.step();
          step = 4;
        } else if (input.isReady()) {
          return Parse.error(Diagnostic.expected("line feed", input));
        }
      }
      if (step == 4) {
        final int inputStart = input.position();
        final int inputLimit = input.limit();
        final int inputRemaining = inputLimit - inputStart;
        final boolean inputLast = input.isLast();
        final long chunkSize = Assume.nonNull(parseHeader).getNonNullUnchecked().size();
        final long chunkRemaining = chunkSize - offset;
        final int decodeSize = (int) Math.min((long) inputRemaining, chunkRemaining);

        input.limit(inputStart + decodeSize).asLast(chunkSize == 0);
        if (decodePayload == null) {
          decodePayload = codec.decode(input);
        } else {
          decodePayload = decodePayload.consume(input);
        }
        input.limit(inputLimit).asLast(inputLast);
        if (decodePayload.isError()) {
          return decodePayload.asError();
        }

        offset += (long) (input.position() - inputStart);
        if (offset == chunkSize) {
          parseHeader = null;
          offset = 0L;
          if (chunkSize > 0L) {
            step = 5;
          } else {
            step = 7;
            break;
          }
        } else if (decodePayload.isDone()) {
          return Decode.error(new DecodeException("undecoded payload data"));
        }
      }
      if (step == 5) {
        if (input.isCont() && input.head() == '\r') {
          input.step();
          step = 6;
        } else if (input.isReady()) {
          return Parse.error(Diagnostic.expected("carriage return", input));
        }
      }
      if (step == 6) {
        if (input.isCont() && input.head() == '\n') {
          input.step();
          step = 1;
          continue;
        } else if (input.isReady()) {
          return Parse.error(Diagnostic.expected("line feed", input));
        }
      }
      break;
    } while (true);
    if (step == 7) {
      if (parseTrailers == null) {
        parseTrailers = HttpHeaders.parse(input);
      } else {
        parseTrailers = parseTrailers.consume(input);
      }
      if (parseTrailers.isDone()) {
        step = 8;
      } else if (parseTrailers.isError()) {
        return parseTrailers.asError();
      }
    }
    if (step == 8) {
      if (input.isCont() && input.head() == '\r') {
        input.step();
        step = 9;
      } else if (input.isReady()) {
        return Parse.error(Diagnostic.expected("carriage return", input));
      }
    }
    if (step == 9) {
      if (input.isCont() && input.head() == '\n') {
        input.step();
        return Decode.done(HttpChunked.of(Assume.nonNull(decodePayload).getUnchecked(), codec,
                                          Assume.nonNull(parseTrailers).getNonNullUnchecked()));
      } else if (input.isReady()) {
        return Parse.error(Diagnostic.expected("line feed", input));
      }
    }
    if (input.isError()) {
      return Decode.error(input.getError());
    }
    return new DecodeHttpChunked<T>(codec, parseHeader, decodePayload,
                                    parseTrailers, offset, step);
  }

}

final class EncodeHttpChunked<T> extends Encode<HttpChunked<T>> {

  final HttpChunked<T> payload;
  final @Nullable Encode<?> encode;
  final int step;

  EncodeHttpChunked(HttpChunked<T> payload, @Nullable Encode<?> encode, int step) {
    this.payload = payload;
    this.encode = encode;
    this.step = step;
  }

  @Override
  public Encode<HttpChunked<T>> produce(OutputBuffer<?> output) {
    return EncodeHttpChunked.encode(output, this.payload, this.encode, this.step);
  }

  static <T> Encode<HttpChunked<T>> encode(OutputBuffer<?> output, HttpChunked<T> payload,
                                           @Nullable Encode<?> encode, int step) {
    if (step == 1 && output.remaining() > 12) { // chunk
      final int outputStart = output.position();
      final int outputEnd = output.limit();
      final boolean outputLast = output.isLast();
      output.position(outputStart + 10); // chunk header
      output.limit(outputEnd - 2); // chunk footer

      output.asLast(false);
      if (encode == null) {
        encode = payload.codec.encode(output, payload.value);
      } else {
        encode = encode.produce(output);
      }

      final int chunkSize = output.position() - outputStart - 10;
      output.limit(outputEnd).asLast(outputLast);
      if (chunkSize > 0) {
        output.write('\r').write('\n');
      } else if (encode.isCont()) {
        output.position(outputStart);
        return new EncodeHttpChunked<T>(payload, encode, step);
      }

      final int chunkEnd = output.position();
      output.position(outputStart + 8).write('\r').write('\n');
      int chunkStart = outputStart + 7;
      int x = chunkSize;
      do {
        output.position(chunkStart).write(Base16.uppercase().encodeDigit(x & 0xF));
        x >>>= 4;
        if (x != 0) {
          chunkStart -= 1;
        } else {
          break;
        }
      } while (true);

      final int chunkLength = chunkEnd - chunkStart;
      output.shift(chunkStart, outputStart, chunkLength);
      output.position(outputStart + chunkLength);

      if (encode.isDone()) {
        if (chunkSize > 0) {
          step = 2;
        } else {
          step = 3;
        }
      } else if (encode.isError()) {
        return encode.asError();
      }
    }
    if (step == 2 && output.remaining() >= 3) { // last chunk
      output.write('0').write('\r').write('\n');
      if (!payload.trailers.isEmpty()) {
        step = 3;
      } else {
        step = 4;
      }
    }
    if (step == 3) {
      if (encode == null) {
        encode = payload.trailers.write(output);
      } else {
        encode = encode.produce(output);
      }
      if (encode.isDone()) {
        encode = null;
        step = 4;
      } else if (encode.isError()) {
        return encode.asError();
      }
    }
    if (step == 4 && output.remaining() >= 2) { // chunk trailer
      output.write('\r').write('\n');
      return Encode.done(payload);
    }
    if (output.isDone()) {
      return Encode.error(new EncodeException("truncated encode"));
    } else if (output.isError()) {
      return Encode.error(output.getError());
    }
    return new EncodeHttpChunked<T>(payload, encode, step);
  }

}
