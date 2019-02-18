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

final class HttpBodyEncoder<T> extends Encoder<Object, HttpMessage<T>> {
  final HttpMessage<T> message;
  final Encoder<?, ?> content;
  final long length;
  final long offset;

  HttpBodyEncoder(HttpMessage<T> message, Encoder<?, ?> content, long length, long offset) {
    this.message = message;
    this.content = content;
    this.length = length;
    this.offset = offset;
  }

  HttpBodyEncoder(HttpMessage<T> message, Encoder<?, ?> content, long length) {
    this(message, content, length, 0L);
  }

  @Override
  public Encoder<Object, HttpMessage<T>> pull(OutputBuffer<?> output) {
    return encode(output, this.message, this.content, this.length, this.offset);
  }

  static <T> Encoder<Object, HttpMessage<T>> encode(OutputBuffer<?> output, HttpMessage<T> message,
                                                    Encoder<?, ?> content, long length, long offset) {
    final int outputStart = output.index();
    final int outputLimit = output.limit();
    final int outputRemaining = outputLimit - outputStart;
    final long inputRemaining = length - offset;
    final boolean outputPart = output.isPart();
    if (inputRemaining <= outputRemaining) {
      output = output.limit(outputStart + (int) inputRemaining).isPart(false);
      content = content.pull(output);
      output = output.limit(outputLimit);
    } else {
      output = output.isPart(true);
      content = content.pull(output);
    }
    output = output.isPart(outputPart);
    offset += output.index() - outputStart;
    if (content.isDone()) {
      if (offset < length) {
        return error(new EncoderException("buffer underflow"));
      } else if (offset > length) {
        return error(new EncoderException("buffer overflow"));
      } else {
        return done(message);
      }
    } else if (content.isError()) {
      return content.asError();
    }
    if (output.isDone()) {
      return error(new EncoderException("truncated"));
    } else if (output.isError()) {
      return error(output.trap());
    }
    return new HttpBodyEncoder<T>(message, content, length, offset);
  }

  static <T> Encoder<Object, HttpMessage<T>> encode(OutputBuffer<?> output, HttpMessage<T> message,
                                                    Encoder<?, ?> content, long length) {
    return encode(output, message, content, length, 0L);
  }
}
