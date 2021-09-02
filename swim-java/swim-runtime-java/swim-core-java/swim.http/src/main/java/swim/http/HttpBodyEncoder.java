// Copyright 2015-2021 Swim Inc.
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
  final Encoder<?, ?> payloadEncoder;
  final long contentLength;
  final long offset;

  HttpBodyEncoder(HttpMessage<T> message, Encoder<?, ?> payloadEncoder,
                  long contentLength, long offset) {
    this.message = message;
    this.payloadEncoder = payloadEncoder;
    this.contentLength = contentLength;
    this.offset = offset;
  }

  HttpBodyEncoder(HttpMessage<T> message, Encoder<?, ?> payloadEncoder, long contentLength) {
    this(message, payloadEncoder, contentLength, 0L);
  }

  @Override
  public Encoder<Object, HttpMessage<T>> pull(OutputBuffer<?> output) {
    return HttpBodyEncoder.encode(output, this.message, this.payloadEncoder,
                                  this.contentLength, this.offset);
  }

  static <T> Encoder<Object, HttpMessage<T>> encode(OutputBuffer<?> output, HttpMessage<T> message,
                                                    Encoder<?, ?> payloadEncoder,
                                                    long contentLength, long offset) {
    final int outputStart = output.index();
    final int outputLimit = output.limit();
    final int outputRemaining = outputLimit - outputStart;
    final long inputRemaining = contentLength - offset;
    final boolean outputPart = output.isPart();
    if (inputRemaining <= outputRemaining) {
      output = output.limit(outputStart + (int) inputRemaining).isPart(false);
      payloadEncoder = payloadEncoder.pull(output);
      output = output.limit(outputLimit);
    } else {
      output = output.isPart(true);
      payloadEncoder = payloadEncoder.pull(output);
    }
    output = output.isPart(outputPart);
    offset += output.index() - outputStart;
    if (payloadEncoder.isDone()) {
      if (offset < contentLength) {
        return Encoder.error(new EncoderException("buffer underflow"));
      } else if (offset > contentLength) {
        return Encoder.error(new EncoderException("buffer overflow"));
      } else {
        return Encoder.done(message);
      }
    } else if (payloadEncoder.isError()) {
      return payloadEncoder.asError();
    }
    if (output.isDone()) {
      return Encoder.error(new EncoderException("truncated"));
    } else if (output.isError()) {
      return Encoder.error(output.trap());
    }
    return new HttpBodyEncoder<T>(message, payloadEncoder, contentLength, offset);
  }

  static <T> Encoder<Object, HttpMessage<T>> encode(OutputBuffer<?> output, HttpMessage<T> message,
                                                    Encoder<?, ?> payloadEncoder, long contentLength) {
    return HttpBodyEncoder.encode(output, message, payloadEncoder, contentLength, 0L);
  }

}
