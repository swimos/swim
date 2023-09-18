// Copyright 2015-2023 Nstream, inc.
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

final class HpackHeaderEncoder extends Encoder<Object, Object> {

  final int index;
  final Encoder<?, ?> nameEncoder;
  final Encoder<?, ?> valueEncoder;
  final HpackIndexing indexing;
  final int step;

  HpackHeaderEncoder(int index, Encoder<?, ?> nameEncoder, Encoder<?, ?> valueEncoder,
                     HpackIndexing indexing, int step) {
    this.index = index;
    this.nameEncoder = nameEncoder;
    this.valueEncoder = valueEncoder;
    this.indexing = indexing;
    this.step = step;
  }

  HpackHeaderEncoder(int index, Encoder<?, ?> nameEncoder, Encoder<?, ?> valueEncoder,
                     HpackIndexing indexing) {
    this(index, nameEncoder, valueEncoder, indexing, 1);
  }

  @Override
  public Encoder<Object, Object> pull(OutputBuffer<?> output) {
    return HpackHeaderEncoder.encode(output, this.index, this.nameEncoder,
                                     this.valueEncoder, this.indexing, this.step);
  }

  static Encoder<Object, Object> encode(OutputBuffer<?> output, int index, Encoder<?, ?> nameEncoder,
                                        Encoder<?, ?> valueEncoder, HpackIndexing indexing, int step) {
    if (step == 1) {
      if (output.isCont()) {
        if (valueEncoder == null) {
          // RFC 7541 Section 6.1. Indexed Header Field Representation
          if (index < 0x7F) {
            output = output.write(0x80 | index);
            return Encoder.done();
          } else {
            output = output.write(0x80 | 0x7F);
            index -= 0x7F;
            step = 2;
          }
        } else if (indexing == HpackIndexing.INCREMENTAL) {
          // RFC 7541 Section 6.2.1. Literal Header Field with Incremental Indexing
          if (index < 0x3F) {
            output = output.write(0x40 | index);
            if (nameEncoder == null) {
              step = 4;
            } else {
              step = 3;
            }
          } else {
            output = output.write(0x40 | 0x3F);
            index -= 0x3F;
            step = 2;
          }
        } else if (indexing == HpackIndexing.NONE) {
          // RFC 7541 Section 6.2.2. Literal Header Field without Indexing
          if (index < 0x0F) {
            output = output.write(0x00 | index);
            step = 3;
          } else {
            output = output.write(0x00 | 0x0F);
            index -= 0x0F;
            step = 2;
          }
        } else if (indexing == HpackIndexing.NEVER) {
          // RFC 7541 Section 6.2.3. Literal Header Field Never Indexed
          if (index < 0x0F) {
            output = output.write(0x10 | index);
            step = 3;
          } else {
            output = output.write(0x10 | 0x0F);
            index -= 0x0F;
            step = 2;
          }
        } else {
          throw new AssertionError(); // unreachable
        }
      }
    }
    if (step == 2) {
      while (output.isCont()) {
        if ((index & ~0x7F) != 0) {
          output = output.write(0x80 | index & 0x7F);
          index >>>= 7;
        } else {
          output = output.write(index);
          if (output.isError()) {
            return Encoder.error(output.trap());
          }
          if (nameEncoder != null) {
            step = 3;
          } else if (valueEncoder != null) {
            step = 4;
          } else {
            return Encoder.done();
          }
        }
      }
    }
    if (step == 3) {
      nameEncoder = nameEncoder.pull(output);
      if (nameEncoder.isDone()) {
        step = 4;
      } else if (nameEncoder.isError()) {
        return nameEncoder.asError();
      }
    }
    if (step == 4) {
      valueEncoder = valueEncoder.pull(output);
      if (valueEncoder.isDone()) {
        return Encoder.done();
      } else if (valueEncoder.isError()) {
        return valueEncoder.asError();
      }
    }
    if (output.isDone()) {
      return Encoder.error(new EncoderException("truncated"));
    } else if (output.isError()) {
      return Encoder.error(output.trap());
    }
    return new HpackHeaderEncoder(index, nameEncoder, valueEncoder, indexing, step);
  }

  static Encoder<Object, Object> encode(OutputBuffer<?> output, int index, Encoder<?, ?> nameEncoder,
                                        Encoder<?, ?> valueEncoder, HpackIndexing indexing) {
    return HpackHeaderEncoder.encode(output, index, nameEncoder, valueEncoder, indexing, 1);
  }

}
