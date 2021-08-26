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

package swim.security;

import java.util.Iterator;
import swim.codec.Encoder;
import swim.codec.OutputBuffer;

abstract class DerEncoder<V> {

  public abstract boolean isSequence(V value);

  public abstract Iterator<V> iterator(V value);

  public abstract int tagOf(V value);

  public abstract int sizeOfPrimitive(V value);

  public abstract Encoder<?, ?> primitiveEncoder(int length, V value);

  public int sizeOf(V value) {
    final int length;
    if (this.isSequence(value)) {
      length = this.sizeOfSequence(this.iterator(value));
    } else {
      length = this.sizeOfPrimitive(value);
    }
    return this.sizeOfValue(length);
  }

  public Encoder<?, ?> encoder(V value) {
    final int tag = this.tagOf(value);
    if (this.isSequence(value)) {
      final int length = this.sizeOfSequence(this.iterator(value));
      return this.sequenceEncoder(tag, length, this.iterator(value));
    } else {
      final int length = this.sizeOfPrimitive(value);
      final Encoder<?, ?> data = this.primitiveEncoder(length, value);
      return this.valueEncoder(tag, length, data);
    }
  }

  public Encoder<?, ?> encode(V value, OutputBuffer<?> output) {
    final int tag = this.tagOf(value);
    if (this.isSequence(value)) {
      final int length = this.sizeOfSequence(this.iterator(value));
      return this.encodeSequence(tag, length, this.iterator(value), output);
    } else {
      final int length = this.sizeOfPrimitive(value);
      final Encoder<?, ?> data = this.primitiveEncoder(length, value);
      return this.encodeValue(tag, length, data, output);
    }
  }

  public int sizeOfValue(int length) {
    return 1 + DerEncoder.sizeOfLength(length) + length;
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
      size += this.sizeOf(elements.next());
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
