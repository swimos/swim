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
import swim.codec.Input;
import swim.codec.Output;
import swim.codec.OutputBuffer;

final class HpackStringEncoder extends Encoder<Object, Object> {

  final Input string;
  final int length;
  final Output<?> huffmanOutput;
  final int value;
  final int step;

  HpackStringEncoder(Input string, int length, Output<?> huffmanOutput, int value, int step) {
    this.string = string;
    this.length = length;
    this.huffmanOutput = huffmanOutput;
    this.value = value;
    this.step = step;
  }

  HpackStringEncoder(Input string, int length, Output<?> huffmanOutput) {
    this(string, length, huffmanOutput, 0, 1);
  }

  @Override
  public Encoder<Object, Object> pull(OutputBuffer<?> output) {
    return HpackStringEncoder.encode(output, this.string.clone(), this.length,
                                     this.huffmanOutput != null ? this.huffmanOutput.clone() : null,
                                     this.value, this.step);
  }

  static Encoder<Object, Object> encode(OutputBuffer<?> output, Input string, int length,
                                        Output<?> huffmanOutput, int value, int step) {
    // RFC 7541 Section 5.2. String Literal Representation
    if (step == 1) {
      if (output.isCont()) {
        final int prefixMask = huffmanOutput != null ? 0x80 : 0;
        if (length < 0x7F) {
          output = output.write(prefixMask | length);
          step = 3;
        } else {
          output = output.write(prefixMask | 0x7F);
          value = length - 0x7F;
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
          step = 3;
          break;
        }
      }
    }
    if (step == 3) {
      final int outputStart = output.index();
      final int outputLimit = output.limit();
      final int outputRemaining = outputLimit - outputStart;
      if (length < outputRemaining) {
        output = output.limit(outputStart + length);
      }
      if (huffmanOutput != null) {
        huffmanOutput = huffmanOutput.fork(output);
        while (huffmanOutput.isCont() && string.isCont()) {
          huffmanOutput = huffmanOutput.write(string.head());
          string = string.step();
        }
        if (huffmanOutput.isCont() && !string.isCont()) {
          huffmanOutput = huffmanOutput.flush();
        }
        huffmanOutput = huffmanOutput.fork(Output.full());
      } else {
        while (output.isCont() && string.isCont()) {
          output = output.write(string.head());
          string = string.step();
        }
      }
      output = output.limit(outputLimit);
      length -= output.index() - outputStart;
      if (string.isError()) {
        return Encoder.error(string.trap());
      } else if (length == 0) {
        return Encoder.done();
      }
    }
    if (output.isDone()) {
      return Encoder.error(new EncoderException("truncated"));
    } else if (output.isError()) {
      return Encoder.error(output.trap());
    }
    return new HpackStringEncoder(string, length, huffmanOutput, value, step);
  }

  static Encoder<Object, Object> encode(OutputBuffer<?> output, Input string,
                                        int length, Output<?> huffmanOutput) {
    return HpackStringEncoder.encode(output, string, length, huffmanOutput, 0, 1);
  }

}
