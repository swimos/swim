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

import swim.codec.Decoder;
import swim.codec.DecoderException;
import swim.codec.InputBuffer;
import swim.http.header.ContentType;

final class HttpBodyDecoder<T> extends Decoder<HttpMessage<T>> {
  final HttpMessage<?> message;
  final Decoder<T> content;
  final long length;
  final long offset;

  HttpBodyDecoder(HttpMessage<?> message, Decoder<T> content, long length, long offset) {
    this.message = message;
    this.content = content;
    this.length = length;
    this.offset = offset;
  }

  HttpBodyDecoder(HttpMessage<?> message, Decoder<T> content, long length) {
    this(message, content, length, 0L);
  }

  @Override
  public Decoder<HttpMessage<T>> feed(InputBuffer input) {
    return decode(input, this.message, this.content, this.length, this.offset);
  }

  static <T> Decoder<HttpMessage<T>> decode(InputBuffer input, HttpMessage<?> message,
                                            Decoder<T> content, long length, long offset) {
    final int inputStart = input.index();
    final int inputLimit = input.limit();
    int inputRemaining = inputLimit - inputStart;
    long outputRemaining = length - offset;
    final boolean inputPart = input.isPart();
    if (outputRemaining <= inputRemaining) {
      input = input.limit(inputStart + (int) outputRemaining).isPart(false);
      content = content.feed(input);
      input = input.limit(inputLimit);
    } else {
      input = input.isPart(true);
      content = content.feed(input);
    }
    input = input.isPart(inputPart);
    final int inputEnd = input.index();
    offset += inputEnd - inputStart;
    inputRemaining = inputLimit - inputEnd;
    outputRemaining = length - offset;
    if (content.isDone() && inputRemaining > 0 && outputRemaining > 0L) {
      // Consume excess input.
      final int inputExcess = (int) Math.min((long) inputRemaining, outputRemaining);
      input = input.index(inputEnd + inputExcess);
      offset += inputExcess;
    }
    if (content.isDone()) {
      if (offset < length) {
        return error(new DecoderException("buffer underflow"));
      } else if (offset > length) {
        return error(new DecoderException("buffer overflow"));
      } else {
        final MediaType mediaType;
        final ContentType contentType = message.getHeader(ContentType.class);
        if (contentType != null) {
          mediaType = contentType.mediaType();
        } else {
          mediaType = null;
        }
        final HttpValue<T> entity = HttpValue.from(content.bind(), mediaType);
        return done(message.entity(entity));
      }
    } else if (content.isError()) {
      return content.asError();
    }
    return new HttpBodyDecoder<T>(message, content, length, offset);
  }

  static <T> Decoder<HttpMessage<T>> decode(InputBuffer input, HttpMessage<?> message,
                                            Decoder<T> content, long length) {
    return decode(input, message, content, length, 0L);
  }
}
