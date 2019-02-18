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

package swim.security;

import java.util.Iterator;
import swim.codec.Encoder;
import swim.codec.EncoderException;
import swim.codec.OutputBuffer;

abstract class DerEncoder<V> {
  public abstract boolean isSequence(V value);

  public abstract Iterator<V> iterator(V value);

  public abstract int tagOf(V value);

  public abstract int sizeOfPrimitive(V value);

  public abstract Encoder<?, ?> primitiveEncoder(int length, V value);

  public int sizeOf(V value) {
    final int length;
    if (isSequence(value)) {
      length = sizeOfSequence(iterator(value));
    } else {
      length = sizeOfPrimitive(value);
    }
    return sizeOfValue(length);
  }

  public Encoder<?, ?> encoder(V value) {
    final int tag = tagOf(value);
    if (isSequence(value)) {
      final int length = sizeOfSequence(iterator(value));
      return sequenceEncoder(tag, length, iterator(value));
    } else {
      final int length = sizeOfPrimitive(value);
      final Encoder<?, ?> data = primitiveEncoder(length, value);
      return valueEncoder(tag, length, data);
    }
  }

  public Encoder<?, ?> encode(V value, OutputBuffer<?> output) {
    final int tag = tagOf(value);
    if (isSequence(value)) {
      final int length = sizeOfSequence(iterator(value));
      return encodeSequence(tag, length, iterator(value), output);
    } else {
      final int length = sizeOfPrimitive(value);
      final Encoder<?, ?> data = primitiveEncoder(length, value);
      return encodeValue(tag, length, data, output);
    }
  }

  public int sizeOfValue(int length) {
    return 1 + sizeOfLength(length) + length;
  }

  public Encoder<?, ?> valueEncoder(int tag, int length, Encoder<?, ?> data) {
    return new DerValueEncoder<V>(this, tag, length, data);
  }

  public Encoder<?, ?> encodeValue(int tag, int length, Encoder<?, ?> data, OutputBuffer<?> output) {
    return DerValueEncoder.encode(output, this, tag, length, data);
  }

  public int sizeOfSequence(Iterator<V> elements) {
    int size = 0;
    while (elements.hasNext()) {
      size += sizeOf(elements.next());
    }
    return size;
  }

  public Encoder<?, ?> sequenceEncoder(int tag, int length, Iterator<V> elements) {
    return new DerSequenceEncoder<V>(this, tag, length, elements);
  }

  public Encoder<?, ?> encodeSequence(int tag, int length, Iterator<V> elements, OutputBuffer<?> output) {
    return DerSequenceEncoder.encode(output, this, tag, length, elements);
  }

  static int sizeOfLength(int length) {
    if (length < 128) {
      return 1;
    } else if (length < (1 << 8)) {
      return 2;
    } else if (length < (1 << 16)) {
      return 3;
    } else if (length < (1 << 24)) {
      return 4;
    } else {
      return 5;
    }
  }
}

final class DerValueEncoder<V> extends Encoder<Object, Object> {
  DerEncoder<V> der;
  final int tag;
  final int length;
  final Encoder<?, ?> data;
  final int offset;
  final int step;

  DerValueEncoder(DerEncoder<V> der, int tag, int length, Encoder<?, ?> data, int offset, int step) {
    this.der = der;
    this.tag = tag;
    this.length = length;
    this.data = data;
    this.offset = offset;
    this.step = step;
  }

  DerValueEncoder(DerEncoder<V> der, int tag, int length, Encoder<?, ?> data) {
    this(der, tag, length, data, 0, 1);
  }

  @Override
  public Encoder<Object, Object> pull(OutputBuffer<?> output) {
    return encode(output, this.der, this.tag, this.length, this.data, this.offset, this.step);
  }

  static <V> Encoder<Object, Object> encode(OutputBuffer<?> output, DerEncoder<V> der,
                                            int tag, int length, Encoder<?, ?> data,
                                            int offset, int step) {
    if (step == 1 && output.isCont()) {
      output = output.write(tag);
      step = 2;
    }
    if (step == 2 && output.isCont()) {
      if (length < 128) {
        output = output.write(length);
        step = 7;
      } else if (length < (1 << 8)) {
        output = output.write(0x81);
        step = 6;
      } else if (length < (1 << 16)) {
        output = output.write(0x82);
        step = 5;
      } else if (length < (1 << 24)) {
        output = output.write(0x83);
        step = 4;
      } else {
        output = output.write(0x84);
        step = 3;
      }
    }
    if (step == 3 && output.isCont()) {
      output = output.write(length >> 24);
      step = 4;
    }
    if (step == 4 && output.isCont()) {
      output = output.write(length >> 16);
      step = 5;
    }
    if (step == 5 && output.isCont()) {
      output = output.write(length >> 8);
      step = 6;
    }
    if (step == 6 && output.isCont()) {
      output = output.write(length);
      step = 7;
    }
    if (step == 7) {
      final int outputStart = output.index();
      final int outputLimit = output.limit();
      final int outputRemaining = outputLimit - outputStart;
      final int inputRemaining = length - offset;
      final boolean outputPart = output.isPart();
      if (inputRemaining <= outputRemaining) {
        output = output.limit(outputStart + inputRemaining).isPart(false);
        data = data.pull(output);
        output = output.limit(outputLimit);
      } else {
        output = output.isPart(true);
        data = data.pull(output);
      }
      output = output.isPart(outputPart);
      offset += output.index() - outputStart;
      if (data.isDone()) {
        if (offset < length) {
          return error(new EncoderException("buffer underflow"));
        } else if (offset > length) {
          return error(new EncoderException("buffer overflow"));
        } else {
          return done();
        }
      } else if (data.isError()) {
        return data.asError();
      }
    }
    if (output.isDone()) {
      return error(new EncoderException("truncated"));
    } else if (output.isError()) {
      return error(output.trap());
    }
    return new DerValueEncoder<V>(der, tag, length, data, offset, step);
  }

  static <V> Encoder<Object, Object> encode(OutputBuffer<?> output, DerEncoder<V> der,
                                            int tag, int length, Encoder<?, ?> data) {
    return encode(output, der, tag, length, data, 0, 1);
  }
}

final class DerSequenceEncoder<V> extends Encoder<Object, Object> {
  DerEncoder<V> der;
  final int tag;
  final int length;
  final Iterator<V> elements;
  final Encoder<?, ?> element;
  final int offset;
  final int step;

  DerSequenceEncoder(DerEncoder<V> der, int tag, int length, Iterator<V> elements,
                     Encoder<?, ?> element, int offset, int step) {
    this.der = der;
    this.tag = tag;
    this.length = length;
    this.elements = elements;
    this.element = element;
    this.offset = offset;
    this.step = step;
  }

  DerSequenceEncoder(DerEncoder<V> der, int tag, int length, Iterator<V> elements) {
    this(der, tag, length, elements, null, 0, 1);
  }

  @Override
  public Encoder<Object, Object> pull(OutputBuffer<?> output) {
    return encode(output, this.der, this.tag, this.length, this.elements,
                  this.element, this.offset, this.step);
  }

  static <V> Encoder<Object, Object> encode(OutputBuffer<?> output, DerEncoder<V> der, int tag, int length,
                                            Iterator<V> elements, Encoder<?, ?> element, int offset, int step) {
    if (step == 1 && output.isCont()) {
      output = output.write(tag);
      step = 2;
    }
    if (step == 2 && output.isCont()) {
      if (length < 128) {
        output = output.write(length);
        step = 7;
      } else if (length < (1 << 8)) {
        output = output.write(0x81);
        step = 6;
      } else if (length < (1 << 16)) {
        output = output.write(0x82);
        step = 5;
      } else if (length < (1 << 24)) {
        output = output.write(0x83);
        step = 4;
      } else {
        output = output.write(0x84);
        step = 3;
      }
    }
    if (step == 3 && output.isCont()) {
      output = output.write(length >> 24);
      step = 4;
    }
    if (step == 4 && output.isCont()) {
      output = output.write(length >> 16);
      step = 5;
    }
    if (step == 5 && output.isCont()) {
      output = output.write(length >> 8);
      step = 6;
    }
    if (step == 6 && output.isCont()) {
      output = output.write(length);
      step = 7;
    }
    while (step == 7) {
      final int outputStart = output.index();
      final int outputLimit = output.limit();
      final int outputRemaining = outputLimit - outputStart;
      final int inputRemaining = length - offset;
      final boolean outputPart = output.isPart();
      output = output.limit(outputStart + inputRemaining).isPart(inputRemaining > outputRemaining);
      if (element != null) {
        element = element.pull(output);
      } else if (elements.hasNext()) {
        element = der.encode(elements.next(), output);
      }
      output = output.limit(outputLimit).isPart(outputPart);
      offset += output.index() - outputStart;
      if (element.isDone()) {
        if (offset < length) {
          if (elements.hasNext()) {
            element = null;
            continue;
          } else {
            return error(new EncoderException("buffer underflow"));
          }
        } else if (offset > length) {
          return error(new EncoderException("buffer overflow"));
        } else {
          return done();
        }
      } else if (element.isError()) {
        return element.asError();
      }
      break;
    }
    if (output.isDone()) {
      return error(new EncoderException("truncated"));
    } else if (output.isError()) {
      return error(output.trap());
    }
    return new DerSequenceEncoder<V>(der, tag, length, elements, element, offset, step);
  }

  static <V> Encoder<Object, Object> encode(OutputBuffer<?> output, DerEncoder<V> der,
                                            int tag, int length, Iterator<V> elements) {
    return encode(output, der, tag, length, elements, null, 0, 1);
  }
}
