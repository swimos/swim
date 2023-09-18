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

import java.util.Iterator;
import swim.codec.Binary;
import swim.codec.Encoder;
import swim.codec.Input;
import swim.codec.Output;
import swim.codec.OutputBuffer;
import swim.codec.Utf8;

public class HpackEncoder {

  final HpackTableStatic staticTable;
  final HpackTableMap dynamicTable;
  final int[] codes;
  final byte[] lengths;

  HpackEncoder(HpackTableStatic staticTable, HpackTableMap dynamicTable,
               int[] codes, byte[] lengths) {
    this.staticTable = staticTable;
    this.dynamicTable = dynamicTable;
    this.codes = codes;
    this.lengths = lengths;
  }

  public HpackEncoder(int capacity) {
    this(HpackTableStatic.standard(), HpackTableMap.withCapacity(capacity),
         Huffman.CODES, Huffman.LENGTHS);
  }

  public HpackEncoder() {
    this(4096);
  }

  public int size() {
    return this.dynamicTable.size();
  }

  public int capacity() {
    return this.dynamicTable.capacity();
  }

  public void setCapacity(int capacity) {
    if (this.dynamicTable.capacity != capacity) {
      this.dynamicTable.setCapacity(capacity);
    }
  }

  public int length() {
    return this.staticTable.length() + this.dynamicTable.length();
  }

  public int getIndex(byte[] name) {
    int index = this.staticTable.getIndex(name);
    if (index < 0) {
      index = this.dynamicTable.getIndex(name);
      if (index >= 0) {
        index += this.staticTable.length();
      }
    }
    return index;
  }

  public Encoder<?, ?> encodeBlock(OutputBuffer<?> output, Iterator<HpackHeader> headers) {
    return HpackBlockEncoder.encode(output, this, headers);
  }

  public Encoder<?, ?> blockEncoder(Iterator<HpackHeader> headers) {
    return new HpackBlockEncoder(this, headers);
  }

  public Encoder<?, ?> encodeHeader(OutputBuffer<?> output, HpackHeader header, HpackIndexing indexing) {
    if (header.isSensitive()) {
      final int index = this.getIndex(header.name);
      if (index > 0) {
        return this.encodeHeader(output, index, null, this.stringEncoder(header.value), HpackIndexing.NEVER);
      } else {
        return this.encodeHeader(output, 0, this.stringEncoder(header.name), this.stringEncoder(header.value), HpackIndexing.NEVER);
      }
    } else if (this.dynamicTable.capacity == 0) {
      int index = this.staticTable.getIndex(header.name, header.value);
      if (index == -1) {
        index = this.staticTable.getIndex(header.name);
        if (index > 0) {
          return this.encodeHeader(output, index, null, this.stringEncoder(header.value), HpackIndexing.NONE);
        } else {
          return this.encodeHeader(output, 0, this.stringEncoder(header.name), this.stringEncoder(header.value), HpackIndexing.NONE);
        }
      } else {
        return this.encodeHeader(output, index);
      }
    } else {
      final int headerSize = header.hpackSize();
      if (headerSize > this.dynamicTable.capacity) {
        final int index = this.getIndex(header.name);
        if (index > 0) {
          return this.encodeHeader(output, index, null, this.stringEncoder(header.value), HpackIndexing.NONE);
        } else {
          return this.encodeHeader(output, 0, this.stringEncoder(header.name), this.stringEncoder(header.value), HpackIndexing.NONE);
        }
      } else {
        final HpackTableMap.Entry entry = this.dynamicTable.getEntry(header);
        if (entry != null) {
          final int index = this.dynamicTable.getIndex(entry) + this.staticTable.length();
          return this.encodeHeader(output, index);
        } else {
          int index = this.staticTable.getIndex(header.name, header.value);
          if (index > 0) {
            return this.encodeHeader(output, index);
          } else {
            index = this.getIndex(header.name);
            if (indexing == HpackIndexing.INCREMENTAL) {
              this.dynamicTable.ensureCapacity(headerSize);
              this.dynamicTable.add(header);
            }
            if (index > 0) {
              return this.encodeHeader(output, index, null, this.stringEncoder(header.value), indexing);
            } else {
              return this.encodeHeader(output, 0, this.stringEncoder(header.name), this.stringEncoder(header.value), indexing);
            }
          }
        }
      }
    }
  }

  public Encoder<?, ?> headerEncoder(HpackHeader header, HpackIndexing indexing) {
    if (header.isSensitive()) {
      final int index = this.getIndex(header.name);
      if (index > 0) {
        return this.headerEncoder(index, null, this.stringEncoder(header.value), HpackIndexing.NEVER);
      } else {
        return this.headerEncoder(0, this.stringEncoder(header.name), this.stringEncoder(header.value), HpackIndexing.NEVER);
      }
    } else if (this.dynamicTable.capacity == 0) {
      int index = this.staticTable.getIndex(header.name, header.value);
      if (index == -1) {
        index = this.staticTable.getIndex(header.name);
        if (index > 0) {
          return this.headerEncoder(index, null, this.stringEncoder(header.value), HpackIndexing.NONE);
        } else {
          return this.headerEncoder(0, this.stringEncoder(header.name), this.stringEncoder(header.value), HpackIndexing.NONE);
        }
      } else {
        return this.headerEncoder(index);
      }
    } else {
      final int headerSize = header.hpackSize();
      if (headerSize > this.dynamicTable.capacity) {
        final int index = this.getIndex(header.name);
        if (index > 0) {
          return this.headerEncoder(index, null, this.stringEncoder(header.value), HpackIndexing.NONE);
        } else {
          return this.headerEncoder(0, this.stringEncoder(header.name), this.stringEncoder(header.value), HpackIndexing.NONE);
        }
      } else {
        final HpackTableMap.Entry entry = this.dynamicTable.getEntry(header);
        if (entry != null) {
          final int index = this.dynamicTable.getIndex(entry) + this.staticTable.length();
          return this.headerEncoder(index);
        } else {
          int index = this.staticTable.getIndex(header.name, header.value);
          if (index > 0) {
            return this.headerEncoder(index);
          } else {
            index = this.getIndex(header.name);
            if (indexing == HpackIndexing.INCREMENTAL) {
              this.dynamicTable.ensureCapacity(headerSize);
              this.dynamicTable.add(header);
            }
            if (index > 0) {
              return this.headerEncoder(index, null, this.stringEncoder(header.value), indexing);
            } else {
              return this.headerEncoder(0, this.stringEncoder(header.name), this.stringEncoder(header.value), indexing);
            }
          }
        }
      }
    }
  }

  public Encoder<?, ?> encodeHeader(OutputBuffer<?> output, HpackHeader header) {
    return this.encodeHeader(output, header, HpackIndexing.INCREMENTAL);
  }

  public Encoder<?, ?> headerEncoder(HpackHeader header) {
    return this.headerEncoder(header, HpackIndexing.INCREMENTAL);
  }

  public Encoder<?, ?> encodeHeader(OutputBuffer<?> output, int index, Encoder<?, ?> nameEncoder,
                                    Encoder<?, ?> valueEncoder, HpackIndexing indexing) {
    return HpackHeaderEncoder.encode(output, index, nameEncoder, valueEncoder, indexing);
  }

  public Encoder<?, ?> headerEncoder(int index, Encoder<?, ?> nameEncoder,
                                     Encoder<?, ?> valueEncoder, HpackIndexing indexing) {
    return new HpackHeaderEncoder(index, nameEncoder, valueEncoder, indexing);
  }

  public Encoder<?, ?> encodeHeader(OutputBuffer<?> output, int index) {
    return HpackHeaderEncoder.encode(output, index, null, null, null);
  }

  public Encoder<?, ?> headerEncoder(int index) {
    return new HpackHeaderEncoder(index, null, null, null);
  }

  public Encoder<?, ?> encodeInteger(OutputBuffer<?> output, int prefixMask, int prefixBits, int value) {
    return HpackIntegerEncoder.encode(output, prefixMask, prefixBits, value);
  }

  public Encoder<?, ?> integerEncoder(int prefixMask, int prefixBits, int value) {
    return new HpackIntegerEncoder(prefixMask, prefixBits, value);
  }

  public Encoder<?, ?> encodeString(OutputBuffer<?> output, Input input, int length, boolean huffmanEncode) {
    if (huffmanEncode) {
      Input sizeInput = input.clone();
      long encodedSize = 0L;
      while (sizeInput.isCont()) {
        final int b = sizeInput.head();
        sizeInput = sizeInput.step();
        encodedSize += (long) this.lengths[b];
      }
      encodedSize = encodedSize + 7L >>> 3;
      return HpackStringEncoder.encode(output, input, (int) encodedSize, this.huffmanEncodedOutput());
    } else {
      return HpackStringEncoder.encode(output, input, length, null);
    }
  }

  public Encoder<?, ?> stringEncoder(Input input, int length, boolean huffmanEncode) {
    if (huffmanEncode) {
      Input sizeInput = input.clone();
      long encodedSize = 0L;
      while (sizeInput.isCont()) {
        final int b = sizeInput.head();
        sizeInput = sizeInput.step();
        encodedSize += (long) this.lengths[b];
      }
      encodedSize = encodedSize + 7L >>> 3;
      return new HpackStringEncoder(input, (int) encodedSize, this.huffmanEncodedOutput());
    } else {
      return new HpackStringEncoder(input, length, null);
    }
  }

  public Encoder<?, ?> encodeString(OutputBuffer<?> output, Input input, boolean huffmanEncode) {
    Input sizeInput = input.clone();
    long encodedSize = 0L;
    int decodedSize = 0;
    while (sizeInput.isCont()) {
      final int b = sizeInput.head();
      sizeInput = sizeInput.step();
      encodedSize += (long) this.lengths[b];
      decodedSize += 1;
    }
    encodedSize = encodedSize + 7L >>> 3;
    if (huffmanEncode) {
      return HpackStringEncoder.encode(output, input, (int) encodedSize, this.huffmanEncodedOutput());
    } else {
      return HpackStringEncoder.encode(output, input, decodedSize, null);
    }
  }

  public Encoder<?, ?> stringEncoder(Input input, boolean huffmanEncode) {
    Input sizeInput = input.clone();
    long encodedSize = 0L;
    int decodedSize = 0;
    while (sizeInput.isCont()) {
      final int b = sizeInput.head();
      sizeInput = sizeInput.step();
      encodedSize += (long) this.lengths[b];
      decodedSize += 1;
    }
    encodedSize = encodedSize + 7L >>> 3;
    if (huffmanEncode) {
      return new HpackStringEncoder(input, (int) encodedSize, this.huffmanEncodedOutput());
    } else {
      return new HpackStringEncoder(input, decodedSize, null);
    }
  }

  public Encoder<?, ?> encodeString(OutputBuffer<?> output, Input input) {
    Input sizeInput = input.clone();
    long encodedSize = 0L;
    int decodedSize = 0;
    while (sizeInput.isCont()) {
      final int b = sizeInput.head();
      sizeInput = sizeInput.step();
      encodedSize += (long) this.lengths[b];
      decodedSize += 1;
    }
    encodedSize = encodedSize + 7L >>> 3;
    if ((int) encodedSize < decodedSize) {
      return HpackStringEncoder.encode(output, input, (int) encodedSize, this.huffmanEncodedOutput());
    } else {
      return HpackStringEncoder.encode(output, input, decodedSize, null);
    }
  }

  public Encoder<?, ?> stringEncoder(Input input) {
    Input sizeInput = input.clone();
    long encodedSize = 0L;
    int decodedSize = 0;
    while (sizeInput.isCont()) {
      final int b = sizeInput.head();
      sizeInput = sizeInput.step();
      encodedSize += (long) this.lengths[b];
      decodedSize += 1;
    }
    encodedSize = encodedSize + 7L >>> 3;
    if ((int) encodedSize < decodedSize) {
      return new HpackStringEncoder(input, (int) encodedSize, this.huffmanEncodedOutput());
    } else {
      return new HpackStringEncoder(input, decodedSize, null);
    }
  }

  public Encoder<?, ?> encodeString(OutputBuffer<?> output, String string, boolean huffmanEncode) {
    return this.encodeString(output, Utf8.decodedInput(string), huffmanEncode);
  }

  public Encoder<?, ?> stringEncoder(String string, boolean huffmanEncode) {
    return this.stringEncoder(Utf8.decodedInput(string), huffmanEncode);
  }

  public Encoder<?, ?> encodeString(OutputBuffer<?> output, String string) {
    return this.encodeString(output, Utf8.decodedInput(string));
  }

  public Encoder<?, ?> stringEncoder(String string) {
    return this.stringEncoder(Utf8.decodedInput(string));
  }

  public Encoder<?, ?> encodeString(OutputBuffer<?> output, byte[] string, boolean huffmanEncode) {
    if (huffmanEncode) {
      return HpackStringEncoder.encode(output, Binary.inputBuffer(string),
                                       this.huffmanEncodedSize(string),
                                       this.huffmanEncodedOutput());
    } else {
      return HpackStringEncoder.encode(output, Binary.inputBuffer(string), string.length, null);
    }
  }

  public Encoder<?, ?> stringEncoder(byte[] string, boolean huffmanEncode) {
    if (huffmanEncode) {
      return new HpackStringEncoder(Binary.inputBuffer(string),
                                    this.huffmanEncodedSize(string),
                                    this.huffmanEncodedOutput());
    } else {
      return new HpackStringEncoder(Binary.inputBuffer(string), string.length, null);
    }
  }

  int huffmanEncodedSize(byte[] string) {
    long encodedSize = 0L;
    for (int i = 0, n = string.length; i < n; i += 1) {
      final int b = string[i] & 0xFF;
      encodedSize += (long) this.lengths[b];
    }
    return (int) (encodedSize + 7L >>> 3);
  }

  public Encoder<?, ?> encodeString(OutputBuffer<?> output, byte[] string) {
    final int huffmanEncodedSize = this.huffmanEncodedSize(string);
    if (huffmanEncodedSize < string.length) {
      return HpackStringEncoder.encode(output, Binary.inputBuffer(string), huffmanEncodedSize,
                                       this.huffmanEncodedOutput());
    } else {
      return HpackStringEncoder.encode(output, Binary.inputBuffer(string), string.length, null);
    }
  }

  public Encoder<?, ?> stringEncoder(byte[] string) {
    final int huffmanEncodedSize = this.huffmanEncodedSize(string);
    if (huffmanEncodedSize < string.length) {
      return new HpackStringEncoder(Binary.inputBuffer(string), huffmanEncodedSize,
                                    this.huffmanEncodedOutput());
    } else {
      return new HpackStringEncoder(Binary.inputBuffer(string), string.length, null);
    }
  }

  public <T> Output<T> huffmanEncodedOutput(Output<T> output) {
    return new HuffmanEncodedOutput<T>(output, this.codes, this.lengths);
  }

  public Output<?> huffmanEncodedOutput() {
    return new HuffmanEncodedOutput<>(Output.full(), this.codes, this.lengths);
  }

  @Override
  public HpackEncoder clone() {
    return new HpackEncoder(this.staticTable, this.dynamicTable.clone(),
                            this.codes, this.lengths);
  }

}
