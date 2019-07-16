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

package swim.structure;

import java.nio.ByteBuffer;
import java.util.concurrent.atomic.AtomicIntegerFieldUpdater;
import swim.codec.Base16;
import swim.codec.Base64;
import swim.codec.Binary;
import swim.codec.InputBuffer;
import swim.codec.Output;
import swim.codec.OutputSettings;
import swim.codec.Unicode;
import swim.codec.Utf8;
import swim.codec.Writer;
import swim.util.Murmur3;

public class Data extends Value {
  byte[] array;
  int offset;
  int size;
  volatile int flags;

  Data(byte[] array, int offset, int size, int flags) {
    this.array = array;
    this.offset = offset;
    this.size = size;
    this.flags = flags;
  }

  protected Data(byte[] array, int offset, int size) {
    this.array = array;
    this.offset = offset;
    this.size = size;
    this.flags = 0;
  }

  public Data(int initialCapacity) {
    if (initialCapacity < 0) {
      throw new IllegalArgumentException(Integer.toString(initialCapacity));
    }
    this.array = new byte[initialCapacity];
    this.offset = 0;
    this.size = 0;
    this.flags = 0;
  }

  public Data() {
    this.array = null;
    this.offset = 0;
    this.size = 0;
    this.flags = ALIASED;
  }

  @Override
  public boolean isConstant() {
    return true;
  }

  public final int size() {
    return this.size;
  }

  public byte getByte(int index) {
    if (index < 0 || index >= this.size) {
      throw new IndexOutOfBoundsException(Integer.toString(index));
    }
    return this.array[this.offset + index];
  }

  public Data setByte(int index, byte value) {
    final int flags = this.flags;
    if ((flags & IMMUTABLE) != 0) {
      throw new UnsupportedOperationException("immutable");
    } else if (index < 0 || index >= this.size) {
      throw new IndexOutOfBoundsException(Integer.toString(index));
    }
    if ((flags & ALIASED) != 0) {
      return setByteAliased(index, value);
    } else {
      return setByteMutable(index, value);
    }
  }

  private Data setByteAliased(int index, byte value) {
    final int n = this.size;
    final byte[] oldArray = this.array;
    final byte[] newArray = new byte[expand(n)];
    System.arraycopy(oldArray, this.offset, newArray, 0, n);
    newArray[index] = value;
    this.array = newArray;
    this.offset = 0;
    do {
      final int oldFlags = this.flags;
      final int newFlags = oldFlags & ~ALIASED;
      if (FLAGS.compareAndSet(this, oldFlags, newFlags)) {
        break;
      }
    } while (true);
    return this;
  }

  private Data setByteMutable(int index, byte value) {
    this.array[this.offset + index] = value;
    return this;
  }

  public Data addByte(byte value) {
    final int flags = this.flags;
    if ((flags & IMMUTABLE) != 0) {
      throw new UnsupportedOperationException("immutable");
    }
    if ((flags & ALIASED) != 0) {
      return addByteAliased(value);
    } else {
      return addByteMutable(value);
    }
  }

  private Data addByteAliased(byte value) {
    final int n = this.size;
    final byte[] oldArray = this.array;
    final byte[] newArray = new byte[expand(n + 1)];
    if (oldArray != null) {
      System.arraycopy(oldArray, this.offset, newArray, 0, n);
    }
    newArray[n] = value;
    this.array = newArray;
    this.offset = 0;
    this.size = n + 1;
    do {
      final int oldFlags = this.flags;
      final int newFlags = oldFlags & ~ALIASED;
      if (FLAGS.compareAndSet(this, oldFlags, newFlags)) {
        break;
      }
    } while (true);
    return this;
  }

  private Data addByteMutable(byte value) {
    final int n = this.size;
    final byte[] oldArray = this.array;
    final byte[] newArray;
    if (oldArray == null || n + 1 > oldArray.length) {
      newArray = new byte[expand(n + 1)];
      if (oldArray != null) {
        System.arraycopy(oldArray, this.offset, newArray, 0, n);
      }
      this.array = newArray;
      this.offset = 0;
    } else {
      newArray = oldArray;
    }
    newArray[this.offset + n] = value;
    this.size = n + 1;
    return this;
  }

  public Data addByteArray(byte[] array, int offset, int size) {
    final int flags = this.flags;
    if ((flags & IMMUTABLE) != 0) {
      throw new UnsupportedOperationException("immutable");
    }
    if ((flags & ALIASED) != 0) {
      return addByteArrayAliased(array, offset, size);
    } else {
      return addByteArrayMutable(array, offset, size);
    }
  }

  public Data addByteArray(byte[] array) {
    return addByteArray(array, 0, array.length);
  }

  private Data addByteArrayAliased(byte[] array, int offset, int size) {
    if (size == 0) {
      return this;
    }
    final int n = this.size;
    final byte[] oldArray = this.array;
    final byte[] newArray = new byte[expand(n + size)];
    if (oldArray != null) {
      System.arraycopy(oldArray, this.offset, newArray, 0, n);
    }
    System.arraycopy(array, offset, newArray, n, size);
    this.array = newArray;
    this.offset = 0;
    this.size = n + size;
    do {
      final int oldFlags = this.flags;
      final int newFlags = oldFlags & ~ALIASED;
      if (FLAGS.compareAndSet(this, oldFlags, newFlags)) {
        break;
      }
    } while (true);
    return this;
  }

  private Data addByteArrayMutable(byte[] array, int offset, int size) {
    if (size == 0) {
      return this;
    }
    final int n = this.size;
    final byte[] oldArray = this.array;
    final byte[] newArray;
    if (oldArray == null || n + size > oldArray.length) {
      newArray = new byte[expand(n + size)];
      if (oldArray != null) {
        System.arraycopy(oldArray, this.offset, newArray, 0, n);
      }
      this.array = newArray;
      this.offset = 0;
    } else {
      newArray = oldArray;
    }
    System.arraycopy(array, offset, newArray, this.offset + n, size);
    this.size = n + size;
    return this;
  }

  public Data addData(Data data) {
    return addByteArray(data.array, data.offset, data.size);
  }

  public void clear() {
    if ((this.flags & IMMUTABLE) != 0) {
      throw new UnsupportedOperationException("immutable");
    }
    this.array = null;
    this.offset = 0;
    this.size = 0;
    this.flags = Data.ALIASED;
  }

  public byte[] toByteArray() {
    final int n = this.size;
    final byte[] oldArray = this.array;
    final int flags = this.flags;
    if ((flags & IMMUTABLE) != 0) {
      final byte[] newArray = new byte[n];
      if (oldArray != null) {
        System.arraycopy(oldArray, this.offset, newArray, 0, n);
      }
      return newArray;
    } else if ((flags & ALIASED) != 0 || n != oldArray.length) {
      final byte[] newArray = new byte[n];
      if (oldArray != null) {
        System.arraycopy(oldArray, this.offset, newArray, 0, n);
      }
      this.array = newArray;
      this.offset = 0;
      do {
        final int oldFlags = this.flags;
        final int newFlags = oldFlags & ~ALIASED;
        if (FLAGS.compareAndSet(this, oldFlags, newFlags)) {
          break;
        }
      } while (true);
      return newArray;
    } else {
      return oldArray;
    }
  }

  public byte[] asByteArray() {
    return this.array;
  }

  public ByteBuffer toByteBuffer() {
    final int flags = this.flags;
    if ((flags & ALIASED) != 0) {
      final int n = this.size;
      final byte[] oldArray = this.array;
      final byte[] newArray = new byte[n];
      if (oldArray != null) {
        System.arraycopy(oldArray, this.offset, newArray, 0, n);
      }
      return ByteBuffer.wrap(newArray);
    } else {
      ByteBuffer buffer = ByteBuffer.wrap(this.array, this.offset, this.size);
      if ((flags & IMMUTABLE) != 0) {
        buffer = buffer.asReadOnlyBuffer();
      }
      do {
        final int oldFlags = FLAGS.get(this);
        final int newFlags = oldFlags | ALIASED;
        if (FLAGS.compareAndSet(this, oldFlags, newFlags)) {
          break;
        }
      } while (true);
      return buffer;
    }
  }

  public ByteBuffer asByteBuffer() {
    if (this.array != null && this.size > 0) {
      return ByteBuffer.wrap(this.array, this.offset, this.size);
    } else {
      return null;
    }
  }

  public InputBuffer toInputBuffer() {
    return Binary.inputBuffer(toByteArray());
  }

  @Override
  public boolean isAliased() {
    return (this.flags & ALIASED) != 0;
  }

  @Override
  public boolean isMutable() {
    return (this.flags & IMMUTABLE) == 0;
  }

  @Override
  public Data branch() {
    do {
      final int oldFlags = this.flags;
      if ((oldFlags & ALIASED) == 0) {
        final int newFlags = oldFlags | ALIASED;
        if (FLAGS.compareAndSet(this, oldFlags, newFlags)) {
          break;
        }
      } else {
        break;
      }
    } while (true);
    return new Data(this.array, this.offset, this.size, ALIASED);
  }

  @Override
  public Data commit() {
    do {
      final int oldFlags = this.flags;
      if ((oldFlags & IMMUTABLE) == 0) {
        final int newFlags = oldFlags | IMMUTABLE;
        if (FLAGS.compareAndSet(this, oldFlags, newFlags)) {
          break;
        }
      } else {
        break;
      }
    } while (true);
    return this;
  }

  public Writer<?, ?> writer() {
    if (this.array != null && this.size > 0) {
      final ByteBuffer buffer = ByteBuffer.wrap(this.array, 0, this.size);
      do {
        final int oldFlags = FLAGS.get(this);
        if ((oldFlags & ALIASED) == 0) {
          final int newFlags = oldFlags | ALIASED;
          if (FLAGS.compareAndSet(this, oldFlags, newFlags)) {
            break;
          }
        } else {
          break;
        }
      } while (true);
      return Binary.byteBufferWriter(buffer);
    } else {
      return Writer.done();
    }
  }

  public Writer<?, ?> write(Output<?> output) {
    if (this.array != null && this.size > 0) {
      final ByteBuffer buffer = ByteBuffer.wrap(this.array, 0, this.size);
      do {
        final int oldFlags = FLAGS.get(this);
        if ((oldFlags & ALIASED) == 0) {
          final int newFlags = oldFlags | ALIASED;
          if (FLAGS.compareAndSet(this, oldFlags, newFlags)) {
            break;
          }
        } else {
          break;
        }
      } while (true);
      return Binary.writeByteBuffer(buffer, output);
    } else {
      return Writer.done();
    }
  }

  public Writer<?, ?> writeBase16(Output<?> output, Base16 base16) {
    if (this.array != null && this.size != 0) {
      return base16.writeByteBuffer(ByteBuffer.wrap(this.array, this.offset, this.size), output);
    } else {
      return Writer.done();
    }
  }

  public Writer<?, ?> writeBase16(Output<?> output) {
    return writeBase16(output, Base16.uppercase());
  }

  public String toBase16(Base16 base16) {
    final Output<String> output = Unicode.stringOutput();
    writeBase16(output, base16);
    return output.bind();
  }

  public String toBase16() {
    return toBase16(Base16.uppercase());
  }

  public Writer<?, ?> writeBase64(Output<?> output, Base64 base64) {
    if (this.array != null && this.size != 0) {
      return base64.writeByteBuffer(ByteBuffer.wrap(this.array, this.offset, this.size), output);
    } else {
      return Writer.done();
    }
  }

  public Writer<?, ?> writeBase64(Output<?> output) {
    return writeBase64(output, Base64.standard());
  }

  public String toBase64(Base64 base64) {
    final Output<String> output = Unicode.stringOutput();
    writeBase64(output, base64);
    return output.bind();
  }

  public String toBase64() {
    return toBase64(Base64.standard());
  }

  @Override
  public int typeOrder() {
    return 4;
  }

  @Override
  public int compareTo(Item other) {
    if (other instanceof Data) {
      return compareTo((Data) other);
    }
    return Integer.compare(typeOrder(), other.typeOrder());
  }

  int compareTo(Data that) {
    final byte[] xs = this.array;
    final byte[] ys = that.array;
    int xi = this.offset;
    int yi = that.offset;
    final int xn = this.size;
    final int yn = that.size;
    final int xu = xi + xn;
    final int ju = yi + yn;
    int order = 0;
    do {
      if (xi < xu && yi < ju) {
        order = xs[xi] - ys[yi];
        xi += 1;
        yi += 1;
      } else {
        break;
      }
    } while (order == 0);
    if (order > 0) {
      return 1;
    } else if (order < 0) {
      return -1;
    } else if (xn > yn) {
      return 1;
    } else if (xn < yn) {
      return -1;
    } else {
      return 0;
    }
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof Data) {
      final Data that = (Data) other;
      final byte[] xs = this.array;
      final byte[] ys = that.array;
      int xi = this.offset;
      int yi = that.offset;
      final int xn = this.size;
      if (xn != that.size) {
        return false;
      }
      final int xu = xi + xn;
      while (xi < xu) {
        if (xs[xi] != ys[yi]) {
          return false;
        }
        xi += 1;
        yi += 1;
      }
      return true;
    }
    return false;
  }

  @Override
  public int hashCode() {
    if (hashSeed == 0) {
      hashSeed = Murmur3.seed(Data.class);
    }
    return Murmur3.mash(Murmur3.mix(hashSeed, this.array, this.offset, this.size));
  }

  @Override
  public void debug(Output<?> output) {
    output = output.write("Data").write('.');
    if (this.size == 0) {
      output = output.write("empty").write('(').write(')');
    } else {
      output = output.write("fromBase16").write('(').write('"');
      writeBase16(output);
      output = output.write('"').write(')');
    }
  }

  static final int ALIASED = 1 << 0;
  static final int IMMUTABLE = 1 << 1;

  static final AtomicIntegerFieldUpdater<Data> FLAGS =
      AtomicIntegerFieldUpdater.newUpdater(Data.class, "flags");

  private static Data empty;

  private static int hashSeed;

  public static Output<Data> output(Data data) {
    return new DataOutput(data, OutputSettings.standard());
  }

  public static Output<Data> output(int initialCapacity) {
    return new DataOutput(new Data(initialCapacity), OutputSettings.standard());
  }

  public static Output<Data> output() {
    return new DataOutput(new Data(), OutputSettings.standard());
  }

  public static Data empty() {
    if (empty == null) {
      empty = new Data(null, 0, 0, ALIASED | IMMUTABLE);
    }
    return empty;
  }

  public static Data create() {
    return new Data(null, 0, 0, ALIASED);
  }

  public static Data create(int initialCapacity) {
    return new Data(new byte[initialCapacity], 0, 0, 0);
  }

  public static Data wrap(ByteBuffer buffer) {
    if (!buffer.hasArray()) {
      throw new IllegalArgumentException();
    }
    return new Data(buffer.array(), buffer.arrayOffset(), buffer.remaining(), ALIASED);
  }

  public static Data wrap(byte[] array, int offset, int size) {
    return new Data(array, offset, size, ALIASED);
  }

  public static Data wrap(byte[] array) {
    return new Data(array, 0, array.length, ALIASED);
  }

  public static Data from(ByteBuffer buffer) {
    final int n = buffer.remaining();
    if (buffer.hasArray()) {
      final byte[] array = buffer.array();
      return new Data(array, buffer.arrayOffset(), buffer.remaining(), ALIASED);
    } else {
      final byte[] array = new byte[n];
      buffer.get(array);
      return new Data(array, 0, n, 0);
    }
  }

  public static Data fromBase16(String string) {
    return Base16.parse(Unicode.stringInput(string), output()).bind();
  }

  public static Data fromBase64(String string, Base64 base64) {
    return base64.parse(Unicode.stringInput(string), output()).bind();
  }

  public static Data fromBase64(String string) {
    return fromBase64(string, Base64.standard());
  }

  public static Data fromUtf8(String string) {
    Output<Data> output = Utf8.encodedOutput(output());
    int i = 0;
    final int n = string.length();
    while (i < n) {
      output = output.write(string.codePointAt(i));
      i = string.offsetByCodePoints(i, 1);
    }
    return output.bind();
  }

  static int expand(int n) {
    n = Math.max(32, n) - 1;
    n |= n >> 1;
    n |= n >> 2;
    n |= n >> 4;
    n |= n >> 8;
    n |= n >> 16;
    return n + 1;
  }
}
