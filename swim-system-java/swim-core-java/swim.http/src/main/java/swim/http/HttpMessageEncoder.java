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

import swim.codec.Encoder;
import swim.codec.EncoderException;
import swim.codec.OutputBuffer;
import swim.codec.Utf8;
import swim.codec.Writer;

final class HttpMessageEncoder<T> extends Encoder<Object, HttpMessage<T>> {
  final HttpWriter http;
  final HttpMessage<T> message;
  final Object part;
  final int step;

  HttpMessageEncoder(HttpWriter http, HttpMessage<T> message, Object part, int step) {
    this.http = http;
    this.message = message;
    this.part = part;
    this.step = step;
  }

  HttpMessageEncoder(HttpWriter http, HttpMessage<T> message) {
    this(http, message, null, 1);
  }

  public Encoder<Object, HttpMessage<T>> pull(OutputBuffer<?> output) {
    return encode(output, this.http, this.message, this.part, this.step);
  }

  @SuppressWarnings("unchecked")
  static <T> Encoder<Object, HttpMessage<T>> encode(OutputBuffer<?> output, HttpWriter http,
                                                    HttpMessage<T> message, Object part, int step) {
    if (step == 1) {
      if (part == null) {
        part = Utf8.writeEncoded(message.httpWriter(http), output);
      } else {
        part = ((Writer<?, ?>) part).pull(output);
      }
      final Writer<?, ?> writer = (Writer<?, ?>) part;
      if (writer.isDone()) {
        part = null;
        step = 2;
      } else if (writer.isError()) {
        return error(writer.trap());
      }
    }
    if (step == 2) {
      if (part == null) {
        part = message.entity().encodeHttp(message, output, http);
      } else {
        part = ((Encoder<?, ?>) part).pull(output);
      }
      final Encoder<?, HttpMessage<T>> encoder = (Encoder<?, HttpMessage<T>>) part;
      if (encoder.isDone()) {
        return encoder.asDone();
      } else if (encoder.isError()) {
        return encoder.asError();
      }
    }
    if (output.isDone()) {
      return error(new EncoderException("truncated"));
    } else if (output.isError()) {
      return error(output.trap());
    }
    return new HttpMessageEncoder<T>(http, message, part, step);
  }

  static <T> Encoder<Object, HttpMessage<T>> encode(OutputBuffer<?> output, HttpWriter http,
                                                    HttpMessage<T> message) {
    return encode(output, http, message, null, 1);
  }
}
