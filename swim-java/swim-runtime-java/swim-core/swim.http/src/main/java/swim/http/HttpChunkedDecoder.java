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
import swim.codec.Parser;
import swim.codec.Utf8;
import swim.http.header.ContentTypeHeader;

final class HttpChunkedDecoder<T> extends Decoder<HttpMessage<T>> {

  final HttpParser http;
  final HttpMessage<?> message;
  final Decoder<T> payloadDecoder;
  final HttpChunkHeader header;
  final Parser<?> part;
  final int offset;
  final int step;

  HttpChunkedDecoder(HttpParser http, HttpMessage<?> message, Decoder<T> payloadDecoder,
                     HttpChunkHeader header, Parser<?> part, int offset, int step) {
    this.http = http;
    this.message = message;
    this.payloadDecoder = payloadDecoder;
    this.header = header;
    this.part = part;
    this.offset = offset;
    this.step = step;
  }

  HttpChunkedDecoder(HttpParser http, HttpMessage<?> message, Decoder<T> payloadDecoder) {
    this(http, message, payloadDecoder, null, null, 0, 1);
  }

  @Override
  public Decoder<HttpMessage<T>> feed(InputBuffer input) {
    return HttpChunkedDecoder.decode(input, this.http, this.message, this.payloadDecoder,
                                     this.header, this.part, this.offset, this.step);
  }

  static <T> Decoder<HttpMessage<T>> decode(InputBuffer input, HttpParser http,
                                            HttpMessage<?> message, Decoder<T> payloadDecoder,
                                            HttpChunkHeader header, Parser<?> part,
                                            int offset, int step) {
    do {
      if (step == 1) { // chunk header
        if (part == null) {
          part = Utf8.parseDecoded(input, http.chunkHeaderParser());
        } else {
          part = part.feed(input);
        }
        if (part.isDone()) {
          header = (HttpChunkHeader) part.bind();
          part = null;
          step = 2;
        } else if (part.isError()) {
          return Decoder.error(part.trap());
        }
      }
      if (step == 2) { // chunk data
        final int inputStart = input.index();
        final int inputLimit = input.limit();
        final int inputRemaining = inputLimit - inputStart;
        final long chunkSize = header.size();
        final long chunkRemaining = chunkSize - offset;
        final boolean inputPart = input.isPart();
        if (chunkRemaining < inputRemaining) {
          input = input.limit(inputStart + (int) chunkRemaining).isPart(chunkSize != 0);
          payloadDecoder = payloadDecoder.feed(input);
          input = input.limit(inputLimit);
        } else {
          input = input.isPart(chunkSize != 0);
          payloadDecoder = payloadDecoder.feed(input);
        }
        input = input.isPart(inputPart);
        offset += input.index() - inputStart;
        if (offset >= chunkSize) {
          offset = 0;
          if (chunkSize > 0) {
            step = 3;
          } else {
            step = 5;
            break;
          }
        } else if (payloadDecoder.isError()) {
          return payloadDecoder.asError();
        }
      }
      if (step == 3) {
        if (input.isCont()) {
          if (input.head() == '\r') {
            input = input.step();
            step = 4;
          } else {
            return Decoder.error(new DecoderException("carriage return"));
          }
        }
      }
      if (step == 4) {
        if (input.isCont()) {
          if (input.head() == '\n') {
            input = input.step();
            step = 1;
            continue;
          } else {
            return Decoder.error(new DecoderException("line feed"));
          }
        }
      }
      break;
    } while (true);
    if (step == 5) { // chunk trailer
      if (part == null) {
        part = Utf8.parseDecoded(input, http.chunkTrailerParser());
      } else {
        part = part.feed(input);
      }
      if (part.isDone()) {
        final HttpChunkTrailer trailer = (HttpChunkTrailer) part.bind();
        message = message.appendedHeaders(trailer.headers());
        final MediaType mediaType;
        final ContentTypeHeader contentTypeHeader = message.getHeader(ContentTypeHeader.class);
        if (contentTypeHeader != null) {
          mediaType = contentTypeHeader.mediaType();
        } else {
          mediaType = null;
        }
        final HttpValue<T> payload = HttpValue.create(payloadDecoder.bind(), mediaType);
        return Decoder.done(message.payload(payload));
      } else if (part.isError()) {
        return Decoder.error(part.trap());
      }
    }
    return new HttpChunkedDecoder<T>(http, message, payloadDecoder, header, part, offset, step);
  }

  static <T> Decoder<HttpMessage<T>> decode(InputBuffer input, HttpParser http,
                                            HttpMessage<?> message, Decoder<T> payloadDecoder) {
    return HttpChunkedDecoder.decode(input, http, message, payloadDecoder, null, null, 0, 1);
  }

}
