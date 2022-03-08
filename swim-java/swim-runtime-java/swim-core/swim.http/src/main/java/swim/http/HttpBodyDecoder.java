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

import swim.codec.Decoder;
import swim.codec.DecoderException;
import swim.codec.InputBuffer;
import swim.http.header.ContentTypeHeader;

final class HttpBodyDecoder<T> extends Decoder<HttpMessage<T>> {

  final HttpMessage<?> message;
  final Decoder<T> payloadDecoder;
  final long contentLength;
  final long offset;

  HttpBodyDecoder(HttpMessage<?> message, Decoder<T> payloadDecoder,
                  long contentLength, long offset) {
    this.message = message;
    this.payloadDecoder = payloadDecoder;
    this.contentLength = contentLength;
    this.offset = offset;
  }

  HttpBodyDecoder(HttpMessage<?> message, Decoder<T> payloadDecoder, long contentLength) {
    this(message, payloadDecoder, contentLength, 0L);
  }

  @Override
  public Decoder<HttpMessage<T>> feed(InputBuffer input) {
    return HttpBodyDecoder.decode(input, this.message, this.payloadDecoder,
                                  this.contentLength, this.offset);
  }

  static <T> Decoder<HttpMessage<T>> decode(InputBuffer input, HttpMessage<?> message,
                                            Decoder<T> payloadDecoder,
                                            long contentLength, long offset) {
    final int inputStart = input.index();
    final int inputLimit = input.limit();
    int inputRemaining = inputLimit - inputStart;
    long outputRemaining = contentLength - offset;
    final boolean inputPart = input.isPart();
    if (outputRemaining <= inputRemaining) {
      input = input.limit(inputStart + (int) outputRemaining).isPart(false);
      payloadDecoder = payloadDecoder.feed(input);
      input = input.limit(inputLimit);
    } else {
      input = input.isPart(true);
      payloadDecoder = payloadDecoder.feed(input);
    }
    input = input.isPart(inputPart);
    final int inputEnd = input.index();
    offset += inputEnd - inputStart;
    inputRemaining = inputLimit - inputEnd;
    outputRemaining = contentLength - offset;
    if (payloadDecoder.isDone() && inputRemaining > 0 && outputRemaining > 0L) {
      // Consume excess input.
      final int inputExcess = (int) Math.min((long) inputRemaining, outputRemaining);
      input = input.index(inputEnd + inputExcess);
      offset += inputExcess;
    }
    if (payloadDecoder.isDone()) {
      if (offset < contentLength) {
        return Decoder.error(new DecoderException("buffer underflow"));
      } else if (offset > contentLength) {
        return Decoder.error(new DecoderException("buffer overflow"));
      } else {
        final MediaType mediaType;
        final ContentTypeHeader contentType = message.getHeader(ContentTypeHeader.class);
        if (contentType != null) {
          mediaType = contentType.mediaType();
        } else {
          mediaType = null;
        }
        final HttpValue<T> payload = HttpValue.create(payloadDecoder.bind(), mediaType);
        return Decoder.done(message.payload(payload));
      }
    } else if (payloadDecoder.isError()) {
      return payloadDecoder.asError();
    }
    return new HttpBodyDecoder<T>(message, payloadDecoder, contentLength, offset);
  }

  static <T> Decoder<HttpMessage<T>> decode(InputBuffer input, HttpMessage<?> message,
                                            Decoder<T> payloadDecoder, long contentLength) {
    return HttpBodyDecoder.decode(input, message, payloadDecoder, contentLength, 0L);
  }

}
