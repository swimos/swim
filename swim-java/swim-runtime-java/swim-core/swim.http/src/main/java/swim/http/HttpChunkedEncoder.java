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

import swim.codec.Base16;
import swim.codec.Encoder;
import swim.codec.EncoderException;
import swim.codec.OutputBuffer;

final class HttpChunkedEncoder<T> extends Encoder<Object, HttpMessage<T>> {

  final HttpMessage<T> message;
  final Encoder<?, ?> payloadEncoder;
  final int step;

  HttpChunkedEncoder(HttpMessage<T> message, Encoder<?, ?> payloadEncoder, int step) {
    this.message = message;
    this.payloadEncoder = payloadEncoder;
    this.step = step;
  }

  HttpChunkedEncoder(HttpMessage<T> message, Encoder<?, ?> payloadEncoder) {
    this(message, payloadEncoder, 1);
  }

  @Override
  public Encoder<Object, HttpMessage<T>> pull(OutputBuffer<?> output) {
    return HttpChunkedEncoder.encode(output, this.message, this.payloadEncoder, this.step);
  }

  static <T> Encoder<Object, HttpMessage<T>> encode(OutputBuffer<?> output, HttpMessage<T> message,
                                                    Encoder<?, ?> payloadEncoder, int step) {
    if (step == 1 && output.remaining() > 12) { // chunk
      final int outputStart = output.index();
      final int outputEnd = output.limit();
      final boolean outputPart = output.isPart();
      output = output.index(outputStart + 10); // chunk header
      output = output.limit(outputEnd - 2); // chunk footer
      output = output.isPart(true);
      payloadEncoder = payloadEncoder.pull(output);
      final int chunkSize = output.index() - outputStart - 10;
      output = output.limit(outputEnd).isPart(outputPart);
      if (chunkSize > 0) {
        output = output.write('\r').write('\n');
      } else if (payloadEncoder.isCont()) {
        output = output.index(outputStart);
        return new HttpChunkedEncoder<T>(message, payloadEncoder, step);
      }
      final int chunkEnd = output.index();
      output = output.index(outputStart + 8).write('\r').write('\n');
      int chunkStart = outputStart + 7;
      int x = chunkSize;
      do {
        output = output.index(chunkStart).write(Base16.uppercase().encodeDigit(x & 0xf));
        x >>>= 4;
        if (x != 0) {
          chunkStart -= 1;
        } else {
          break;
        }
      } while (true);
      final int chunkLength = chunkEnd - chunkStart;
      output = output.move(chunkStart, outputStart, chunkLength)
                     .index(outputStart + chunkLength);
      if (payloadEncoder.isDone()) {
        if (chunkSize > 0) {
          step = 2;
        } else {
          step = 3;
        }
      } else if (payloadEncoder.isError()) {
        return payloadEncoder.asError();
      }
    }
    if (step == 2 && output.remaining() >= 3) { // last chunk
      output = output.write('0').write('\r').write('\n');
      step = 3;
    }
    if (step == 3 && output.remaining() >= 2) { // chunk trailer
      output = output.write('\r').write('\n');
      return Encoder.done(message);
    }
    if (output.isDone()) {
      return Encoder.error(new EncoderException("truncated"));
    } else if (output.isError()) {
      return Encoder.error(output.trap());
    }
    return new HttpChunkedEncoder<T>(message, payloadEncoder, step);
  }

  static <T> Encoder<Object, HttpMessage<T>> encode(OutputBuffer<?> output, HttpMessage<T> message,
                                                    Encoder<?, ?> payloadEncoder) {
    return HttpChunkedEncoder.encode(output, message, payloadEncoder, 1);
  }

}
