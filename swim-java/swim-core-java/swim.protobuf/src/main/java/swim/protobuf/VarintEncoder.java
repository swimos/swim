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

package swim.protobuf;

import swim.codec.Encoder;
import swim.codec.EncoderException;
import swim.codec.OutputBuffer;

final class VarintEncoder extends Encoder<Number, Object> {
  final long value;

  VarintEncoder(long value) {
    this.value = value;
  }

  VarintEncoder() {
    this(0L);
  }

  @Override
  public Encoder<Number, Object> feed(Number input) {
    return new VarintEncoder(input.longValue());
  }

  @Override
  public Encoder<Number, Object> pull(OutputBuffer<?> output) {
    return encode(output, this.value);
  }

  static int sizeOf(long value) {
    return (63 - Long.numberOfLeadingZeros(value)) / 7 + 1;
  }

  static Encoder<Number, Object> encode(OutputBuffer<?> output, long value) {
    while (output.isCont()) {
      if ((value >>> 7) == 0L) {
        output = output.write((int) value & 0x7f);
        return done();
      } else {
        output = output.write(0x80 | ((int) value & 0x7f));
        value >>>= 7;
      }
    }
    if (output.isDone()) {
      return error(new EncoderException("truncated"));
    } else if (output.isError()) {
      return error(output.trap());
    }
    return new VarintEncoder(value);
  }

  static Encoder<Number, Object> encodeSigned(OutputBuffer<?> output, long value) {
    value = (value << 1) ^ (value >> 63);
    return encode(output, value);
  }
}
