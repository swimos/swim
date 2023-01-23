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

package swim.security;

import java.util.Iterator;
import swim.codec.Encoder;
import swim.codec.EncoderException;
import swim.codec.OutputBuffer;

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
    return DerSequenceEncoder.encode(output, this.der, this.tag, this.length,
                                     this.elements, this.element, this.offset, this.step);
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
        element = der.encode(output, elements.next());
      }
      output = output.limit(outputLimit).isPart(outputPart);
      offset += output.index() - outputStart;
      if (element.isDone()) {
        if (offset < length) {
          if (elements.hasNext()) {
            element = null;
            continue;
          } else {
            return Encoder.error(new EncoderException("buffer underflow"));
          }
        } else if (offset > length) {
          return Encoder.error(new EncoderException("buffer overflow"));
        } else {
          return Encoder.done();
        }
      } else if (element.isError()) {
        return element.asError();
      }
      break;
    }
    if (output.isDone()) {
      return Encoder.error(new EncoderException("truncated"));
    } else if (output.isError()) {
      return Encoder.error(output.trap());
    }
    return new DerSequenceEncoder<V>(der, tag, length, elements, element, offset, step);
  }

  static <V> Encoder<Object, Object> encode(OutputBuffer<?> output, DerEncoder<V> der,
                                            int tag, int length, Iterator<V> elements) {
    return DerSequenceEncoder.encode(output, der, tag, length, elements, null, 0, 1);
  }

}
