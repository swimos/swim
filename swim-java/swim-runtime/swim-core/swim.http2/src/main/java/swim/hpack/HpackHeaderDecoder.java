// Copyright 2015-2023 Swim.inc
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

import swim.codec.Binary;
import swim.codec.Decoder;
import swim.codec.DecoderException;
import swim.codec.Input;
import swim.codec.InputBuffer;
import swim.codec.Output;

final class HpackHeaderDecoder extends Decoder<HpackHeader> {

  final HpackDecoder hpack;
  final Output<byte[]> nameOutput;
  final Output<byte[]> valueOutput;
  final Input huffmanInput;
  final boolean sensitive;
  final int index;
  final int value;
  final int shift;
  final int step;

  HpackHeaderDecoder(HpackDecoder hpack, Output<byte[]> nameOutput, Output<byte[]> valueOutput,
                     Input huffmanInput, boolean sensitive, int index, int value, int shift, int step) {
    this.hpack = hpack;
    this.nameOutput = nameOutput;
    this.valueOutput = valueOutput;
    this.huffmanInput = huffmanInput;
    this.sensitive = sensitive;
    this.index = index;
    this.value = value;
    this.shift = shift;
    this.step = step;
  }

  HpackHeaderDecoder(HpackDecoder hpack) {
    this(hpack, null, null, null, false, 0, 0, 0, 1);
  }

  @Override
  public Decoder<HpackHeader> feed(InputBuffer input) {
    return HpackHeaderDecoder.decode(input, this.hpack, this.nameOutput, this.valueOutput,
                                     this.huffmanInput, this.sensitive, this.index,
                                     this.value, this.shift, this.step);
  }

  @SuppressWarnings("unchecked")
  static Decoder<HpackHeader> decode(InputBuffer input, HpackDecoder hpack,
                                     Output<byte[]> nameOutput, Output<byte[]> valueOutput,
                                     Input huffmanInput, boolean sensitive, int index,
                                     int value, int shift, int step) {
    int b;
    if (step == 1) {
      if (input.isCont()) {
        b = input.head();
        input = input.step();
        if ((b & 0x80) != 0) {
          // RFC 7541 Section 6.1. Indexed Header Field Representation
          index = b & 0x7F;
          if (index == 0x7F) {
            step = 2; // DECODE_INDEXED_HEADER
          } else if (index == 0) {
            return Decoder.error(new DecoderException("invalid index: " + index));
          } else {
            final HpackHeader header = hpack.get(index);
            if (header != null) {
              return Decoder.done(header);
            } else {
              return Decoder.error(new DecoderException("invalid index: " + index));
            }
          }
        } else if ((b & 0x40) != 0) {
          // RFC 7541 Section 6.2.1. Literal Header Field with Incremental Indexing
          index = b & 0x3F;
          if (index == 0x3F) {
            step = 3; // DECODE_INDEXED_HEADER_NAME
          } else if (index == 0) {
            step = 4; // DECODE_LITERAL_HEADER_NAME_LENGTH_PREFIX
          } else {
            final HpackHeader header = hpack.get(index);
            if (header != null) {
              nameOutput = Binary.byteArrayOutput(header.name);
              step = 8; // DECODE_LITERAL_HEADER_VALUE_LENGTH_PREFIX
            } else {
              return Decoder.error(new DecoderException("invalid index: " + index));
            }
          }
        } else if ((b & 0x20) != 0) {
          return Decoder.error(new DecoderException("unexpected dynamic table size update"));
        } else {
          // RFC 7541 Section 6.2.2. Literal Header Field without Indexing
          // RFC 7541 Section 6.2.3. Literal Header Field Never Indexed
          if ((b & 0x10) != 0) {
            sensitive = true;
          }
          index = b & 0x0F;
          if (index == 0x0F) {
            step = 3; // DECODE_INDEXED_HEADER_NAME;
          } else if (index == 0) {
            step = 4; // DECODE_LITERAL_HEADER_NAME_LENGTH_PREFIX;
          } else {
            final HpackHeader header = hpack.get(index);
            if (header != null) {
              nameOutput = Binary.byteArrayOutput(header.name);
              step = 8; // DECODE_LITERAL_HEADER_VALUE_LENGTH_PREFIX
            } else {
              return Decoder.error(new DecoderException("invalid index: " + index));
            }
          }
        }
      } else if (input.isDone()) {
        return Decoder.error(new DecoderException("expected literal header"));
      }
    }
    if (step == 2) { // DECODE_INDEXED_HEADER
      while (input.isCont()) {
        b = input.head();
        input = input.step();
        if (shift == 28 && (b & 0xF8) != 0) {
          return Decoder.error(new DecoderException("index overflow"));
        }
        value |= (b & 0x7F) << shift;
        if ((b & 0x80) != 0) {
          shift += 7;
          if (shift >= 32) {
            return Decoder.error(new DecoderException("index overflow"));
          }
        } else {
          index += value;
          if (index < 0) {
            return Decoder.error(new DecoderException("index overflow"));
          }
          final HpackHeader header = hpack.get(index);
          if (header != null) {
            return Decoder.done(header);
          } else {
            return Decoder.error(new DecoderException("invalid index: " + index));
          }
        }
      }
    }
    if (step == 3) { // DECODE_INDEXED_HEADER_NAME
      while (input.isCont()) {
        b = input.head();
        input = input.step();
        if (shift == 28 && (b & 0xF8) != 0) {
          return Decoder.error(new DecoderException("index overflow"));
        }
        value |= (b & 0x7F) << shift;
        if ((b & 0x80) != 0) {
          shift += 7;
          if (shift >= 32) {
            return Decoder.error(new DecoderException("index overflow"));
          }
        } else {
          index += value;
          if (index < 0) {
            return Decoder.error(new DecoderException("index overflow"));
          }
          final HpackHeader header = hpack.get(index);
          if (header != null) {
            nameOutput = Binary.byteArrayOutput(header.name);
            value = 0;
            shift = 0;
            step = 8; // DECODE_LITERAL_HEADER_VALUE_LENGTH_PREFIX
          } else {
            return Decoder.error(new DecoderException("invalid index: " + index));
          }
        }
      }
    }
    if (step == 4) { // DECODE_LITERAL_HEADER_NAME_LENGTH_PREFIX
      if (input.isCont()) {
        b = input.head();
        input = input.step();
        huffmanInput = (b & 0x80) != 0 ? new HuffmanDecodedInput(Input.empty()) : null;
        index = b & 0x7F;
        if (index == 0x7F) {
          step = 5; // DECODE_LITERAL_HEADER_NAME_LENGTH;
        } else {
          if (index == 0) {
            return Decoder.error(new DecoderException("empty header name"));
          }
          step = 6; // DECODE_LITERAL_HEADER_NAME
        }
      } else if (input.isDone()) {
        return Decoder.error(new DecoderException("expected literal header name length prefix"));
      }
    }
    if (step == 5) { // DECODE_LITERAL_HEADER_NAME_LENGTH
      while (input.isCont()) {
        b = input.head();
        input = input.step();
        if (shift == 28 && (b & 0xF8) != 0) {
          return Decoder.error(new DecoderException("length overflow"));
        }
        value |= (b & 0x7F) << shift;
        if ((b & 0x80) != 0) {
          shift += 7;
          if (shift >= 32) {
            return Decoder.error(new DecoderException("length overflow"));
          }
        } else {
          index += value;
          if (index < 0) {
            return Decoder.error(new DecoderException("length overflow"));
          }
          value = 0;
          shift = 0;
          step = 6; // DECODE_LITERAL_HEADER_NAME
        }
      }
    }
    if (step == 6) { // DECODE_LITERAL_HEADER_NAME
      final int inputStart = input.index();
      final int inputLimit = input.limit();
      final int inputRemaining = inputLimit - inputStart;
      if (index < inputRemaining) {
        input = input.limit(inputStart + index);
      }
      final boolean inputPart = input.isPart();
      input = input.isPart(index > inputRemaining);
      if (nameOutput == null) {
        nameOutput = Binary.byteArrayOutput(index);
      }
      if (huffmanInput != null) {
        huffmanInput = huffmanInput.fork(input);
        while (huffmanInput.isCont()) {
          nameOutput = nameOutput.write(huffmanInput.head());
          huffmanInput = huffmanInput.step();
        }
        huffmanInput = huffmanInput.fork(Input.empty());
      } else {
        while (input.isCont()) {
          nameOutput = nameOutput.write(input.head());
          input = input.step();
        }
      }
      input = input.limit(inputLimit).isPart(inputPart);
      index -= input.index() - inputStart;
      if (nameOutput.isError()) {
        return Decoder.error(nameOutput.trap());
      } else if (index == 0) {
        huffmanInput = null;
        step = 8; // DECODE_LITERAL_HEADER_VALUE_LENGTH_PREFIX
      }
    }
    if (step == 7) { // SKIP_LITERAL_HEADER_NAME
      while (input.isCont() && index != 0) {
        input = input.step();
        index -= 1;
      }
      if (index == 0) {
        step = 8; // DECODE_LITERAL_HEADER_VALUE_LENGTH_PREFIX;
      }
    }
    if (step == 8) { // DECODE_LITERAL_HEADER_VALUE_LENGTH_PREFIX
      if (input.isCont()) {
        b = input.head();
        input = input.step();
        huffmanInput = (b & 0x80) != 0 ? new HuffmanDecodedInput(Input.empty()) : null;
        index = b & 0x7F;
        if (index == 0x7F) {
          step = 9; // DECODE_LITERAL_HEADER_VALUE_LENGTH
        } else if (index == 0) {
          return Decoder.done(HpackHeader.create(nameOutput.bind(), HpackHeader.EMPTY_VALUE, sensitive));
        } else {
          step = 10; // DECODE_LITERAL_HEADER_VALUE
        }
      } else if (input.isDone()) {
        return Decoder.error(new DecoderException("expected literal header value length prefix"));
      }
    }
    if (step == 9) { // DECODE_LITERAL_HEADER_VALUE_LENGTH
      while (input.isCont()) {
        b = input.head();
        input = input.step();
        if (shift == 28 && (b & 0xF8) != 0) {
          return Decoder.error(new DecoderException("length overflow"));
        }
        value |= (b & 0x7F) << shift;
        if ((b & 0x80) != 0) {
          shift += 7;
          if (shift >= 32) {
            return Decoder.error(new DecoderException("length overflow"));
          }
        } else {
          index += value;
          if (index < 0) {
            return Decoder.error(new DecoderException("length overflow"));
          }
          value = 0;
          shift = 0;
          step = 10; // DECODE_LITERAL_HEADER_VALUE
        }
      }
    }
    if (step == 10) { // DECODE_LITERAL_HEADER_VALUE
      final int inputStart = input.index();
      final int inputLimit = input.limit();
      final int inputRemaining = inputLimit - inputStart;
      if (index < inputRemaining) {
        input = input.limit(inputStart + index);
      }
      final boolean inputPart = input.isPart();
      input = input.isPart(index > inputRemaining);
      if (valueOutput == null) {
        valueOutput = Binary.byteArrayOutput(index);
      }
      if (huffmanInput != null) {
        huffmanInput = huffmanInput.fork(input);
        while (huffmanInput.isCont()) {
          valueOutput = valueOutput.write(huffmanInput.head());
          huffmanInput = huffmanInput.step();
        }
        huffmanInput = huffmanInput.fork(Input.empty());
      } else {
        while (input.isCont()) {
          valueOutput = valueOutput.write(input.head());
          input = input.step();
        }
      }
      input = input.limit(inputLimit).isPart(inputPart);
      index -= input.index() - inputStart;
      if (valueOutput.isError()) {
        return Decoder.error(valueOutput.trap());
      } else if (index == 0) {
        return Decoder.done(HpackHeader.create(nameOutput.bind(), valueOutput.bind(), sensitive));
      }
    }
    if (step == 11) { // SKIP_LITERAL_HEADER_VALUE
      while (input.isCont() && index != 0) {
        input = input.step();
        index -= 1;
      }
      if (index == 0) {
        return Decoder.done();
      }
    }
    if (input.isDone()) {
      return Decoder.error(new DecoderException("incomplete"));
    } else if (input.isError()) {
      return Decoder.error(input.trap());
    }
    return new HpackHeaderDecoder(hpack, nameOutput, valueOutput, huffmanInput,
                                  sensitive, index, value, shift, step);
  }

  static Decoder<HpackHeader> decode(InputBuffer input, HpackDecoder hpack) {
    return HpackHeaderDecoder.decode(input, hpack, null, null, null, false, 0, 0, 0, 1);
  }

}
