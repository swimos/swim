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

package swim.hpack;

import swim.codec.Encoder;
import swim.codec.EncoderException;
import swim.codec.OutputBuffer;

final class HpackIntegerEncoder extends Encoder<Object, Object> {

  final int prefixMask;
  final int prefixBits;
  final int value;
  final int step;

  HpackIntegerEncoder(int prefixMask, int prefixBits, int value, int step) {
    this.prefixMask = prefixMask;
    this.prefixBits = prefixBits;
    this.value = value;
    this.step = step;
  }

  HpackIntegerEncoder(int prefixMask, int prefixBits, int value) {
    this(prefixMask, prefixBits, value, 1);
  }

  @Override
  public Encoder<Object, Object> pull(OutputBuffer<?> output) {
    return HpackIntegerEncoder.encode(output, this.prefixMask, this.prefixBits,
                                      this.value, this.step);
  }

  static Encoder<Object, Object> encode(OutputBuffer<?> output, int prefixMask,
                                        int prefixBits, int value, int step) {
    // RFC 7541 Section 5.1. Integer Representation
    if (step == 1) {
      if (output.isCont()) {
        final int prefixFill = (1 << prefixBits) - 1;
        if (value < prefixFill) {
          output = output.write(prefixMask | value);
          return Encoder.done();
        } else {
          output = output.write(prefixMask | prefixFill);
          value -= prefixFill;
          step = 2;
        }
      }
    }
    if (step == 2) {
      while (output.isCont()) {
        if ((value & ~0x7F) != 0) {
          output = output.write(0x80 | value & 0x7F);
          value >>>= 7;
        } else {
          output = output.write(value);
          if (output.isError()) {
            return Encoder.error(output.trap());
          }
          return Encoder.done();
        }
      }
    }
    if (output.isDone()) {
      return Encoder.error(new EncoderException("truncated"));
    } else if (output.isError()) {
      return Encoder.error(output.trap());
    }
    return new HpackIntegerEncoder(prefixMask, prefixBits, value, step);
  }

  static Encoder<Object, Object> encode(OutputBuffer<?> output, int prefixMask,
                                        int prefixBits, int value) {
    return HpackIntegerEncoder.encode(output, prefixMask, prefixBits, value, 1);
  }

}
