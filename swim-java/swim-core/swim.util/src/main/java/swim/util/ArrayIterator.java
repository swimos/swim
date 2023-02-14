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

package swim.util;

import java.util.Iterator;
import java.util.NoSuchElementException;
import swim.annotations.Public;
import swim.annotations.Since;

@Public
@Since("5.0")
public final class ArrayIterator {

  private ArrayIterator() {
    // static
  }

  public static Iterator<Byte> of(byte[] array) {
    return new ByteArrayIterator(array);
  }

  public static Iterator<Short> of(short[] array) {
    return new ShortArrayIterator(array);
  }

  public static Iterator<Integer> of(int[] array) {
    return new IntArrayIterator(array);
  }

  public static Iterator<Long> of(long[] array) {
    return new LongArrayIterator(array);
  }

  public static Iterator<Float> of(float[] array) {
    return new FloatArrayIterator(array);
  }

  public static Iterator<Double> of(double[] array) {
    return new DoubleArrayIterator(array);
  }

  public static Iterator<Character> of(char[] array) {
    return new CharArrayIterator(array);
  }

  public static Iterator<Boolean> of(boolean[] array) {
    return new BooleanArrayIterator(array);
  }

  public static <T> Iterator<T> of(T[] array) {
    return new ObjectArrayIterator<T>(array);
  }

  public static Iterator<?> of(Object array) {
    if (array instanceof byte[]) {
      return new ByteArrayIterator((byte[]) array);
    } else if (array instanceof short[]) {
      return new ShortArrayIterator((short[]) array);
    } else if (array instanceof int[]) {
      return new IntArrayIterator((int[]) array);
    } else if (array instanceof long[]) {
      return new LongArrayIterator((long[]) array);
    } else if (array instanceof float[]) {
      return new FloatArrayIterator((float[]) array);
    } else if (array instanceof double[]) {
      return new DoubleArrayIterator((double[]) array);
    } else if (array instanceof char[]) {
      return new CharArrayIterator((char[]) array);
    } else if (array instanceof boolean[]) {
      return new BooleanArrayIterator((boolean[]) array);
    } else {
      return new ObjectArrayIterator<Object>((Object[]) array);
    }
  }

}

final class ByteArrayIterator implements Iterator<Byte> {

  final byte[] array;
  int index;

  ByteArrayIterator(byte[] array) {
    this.array = array;
    this.index = 0;
  }

  @Override
  public boolean hasNext() {
    return this.index < this.array.length;
  }

  @Override
  public Byte next() {
    final int index = this.index;
    if (index >= this.array.length) {
      throw new NoSuchElementException();
    }
    this.index = index + 1;
    return Byte.valueOf(this.array[index]);
  }

}

final class ShortArrayIterator implements Iterator<Short> {

  final short[] array;
  int index;

  ShortArrayIterator(short[] array) {
    this.array = array;
    this.index = 0;
  }

  @Override
  public boolean hasNext() {
    return this.index < this.array.length;
  }

  @Override
  public Short next() {
    final int index = this.index;
    if (index >= this.array.length) {
      throw new NoSuchElementException();
    }
    this.index = index + 1;
    return Short.valueOf(this.array[index]);
  }

}

final class IntArrayIterator implements Iterator<Integer> {

  final int[] array;
  int index;

  IntArrayIterator(int[] array) {
    this.array = array;
    this.index = 0;
  }

  @Override
  public boolean hasNext() {
    return this.index < this.array.length;
  }

  @Override
  public Integer next() {
    final int index = this.index;
    if (index >= this.array.length) {
      throw new NoSuchElementException();
    }
    this.index = index + 1;
    return Integer.valueOf(this.array[index]);
  }

}

final class LongArrayIterator implements Iterator<Long> {

  final long[] array;
  int index;

  LongArrayIterator(long[] array) {
    this.array = array;
    this.index = 0;
  }

  @Override
  public boolean hasNext() {
    return this.index < this.array.length;
  }

  @Override
  public Long next() {
    final int index = this.index;
    if (index >= this.array.length) {
      throw new NoSuchElementException();
    }
    this.index = index + 1;
    return Long.valueOf(this.array[index]);
  }

}

final class FloatArrayIterator implements Iterator<Float> {

  final float[] array;
  int index;

  FloatArrayIterator(float[] array) {
    this.array = array;
    this.index = 0;
  }

  @Override
  public boolean hasNext() {
    return this.index < this.array.length;
  }

  @Override
  public Float next() {
    final int index = this.index;
    if (index >= this.array.length) {
      throw new NoSuchElementException();
    }
    this.index = index + 1;
    return Float.valueOf(this.array[index]);
  }

}

final class DoubleArrayIterator implements Iterator<Double> {

  final double[] array;
  int index;

  DoubleArrayIterator(double[] array) {
    this.array = array;
    this.index = 0;
  }

  @Override
  public boolean hasNext() {
    return this.index < this.array.length;
  }

  @Override
  public Double next() {
    final int index = this.index;
    if (index >= this.array.length) {
      throw new NoSuchElementException();
    }
    this.index = index + 1;
    return Double.valueOf(this.array[index]);
  }

}

final class CharArrayIterator implements Iterator<Character> {

  final char[] array;
  int index;

  CharArrayIterator(char[] array) {
    this.array = array;
    this.index = 0;
  }

  @Override
  public boolean hasNext() {
    return this.index < this.array.length;
  }

  @Override
  public Character next() {
    final int index = this.index;
    if (index >= this.array.length) {
      throw new NoSuchElementException();
    }
    this.index = index + 1;
    return Character.valueOf(this.array[index]);
  }

}

final class BooleanArrayIterator implements Iterator<Boolean> {

  final boolean[] array;
  int index;

  BooleanArrayIterator(boolean[] array) {
    this.array = array;
    this.index = 0;
  }

  @Override
  public boolean hasNext() {
    return this.index < this.array.length;
  }

  @Override
  public Boolean next() {
    final int index = this.index;
    if (index >= this.array.length) {
      throw new NoSuchElementException();
    }
    this.index = index + 1;
    return Boolean.valueOf(this.array[index]);
  }

}

final class ObjectArrayIterator<T> implements Iterator<T> {

  final T[] array;
  int index;

  ObjectArrayIterator(T[] array) {
    this.array = array;
    this.index = 0;
  }

  @Override
  public boolean hasNext() {
    return this.index < this.array.length;
  }

  @Override
  public T next() {
    final int index = this.index;
    if (index >= this.array.length) {
      throw new NoSuchElementException();
    }
    this.index = index + 1;
    return this.array[index];
  }

}
