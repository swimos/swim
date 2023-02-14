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

package swim.repr;

import java.nio.ByteBuffer;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.codec.Base16;
import swim.codec.Base64;
import swim.codec.Binary;
import swim.codec.BinaryInput;
import swim.codec.BinaryInputBuffer;
import swim.codec.InputBuffer;
import swim.codec.Output;
import swim.codec.StringInput;
import swim.codec.StringOutput;
import swim.codec.Utf8EncodedOutput;
import swim.codec.Write;
import swim.util.Murmur3;
import swim.util.Notation;
import swim.util.ToSource;

@Public
@Since("5.0")
public final class BlobRepr implements Repr, Comparable<BlobRepr>, ToSource {

  int flags;
  Attrs attrs;
  byte[] array;
  int offset;
  int size;

  BlobRepr(int flags, Attrs attrs, byte[] array, int offset, int size) {
    this.flags = flags;
    this.attrs = attrs;
    this.array = array;
    this.offset = offset;
    this.size = size;
  }

  @Override
  public Attrs attrs() {
    return this.attrs;
  }

  @Override
  public void setAttrs(Attrs attrs) {
    if ((this.flags & IMMUTABLE_FLAG) != 0) {
      throw new UnsupportedOperationException("Immutable");
    }
    this.attrs = attrs;
  }

  @Override
  public BlobRepr letAttrs(Attrs attrs) {
    if ((this.flags & IMMUTABLE_FLAG) != 0) {
      return this.withAttrs(attrs);
    } else {
      this.attrs = attrs;
      return this;
    }
  }

  @Override
  public BlobRepr letAttr(String key, Repr value) {
    return this.letAttrs(this.attrs.let(key, value));
  }

  @Override
  public BlobRepr letAttr(String key) {
    return this.letAttr(key, Repr.unit());
  }

  @SuppressWarnings("ReferenceEquality")
  @Override
  public BlobRepr withAttrs(Attrs attrs) {
    if (attrs == this.attrs) {
      return this;
    } else {
      this.flags |= ALIASED_FLAG;
      return new BlobRepr(this.flags, attrs, this.array, this.offset, this.size);
    }
  }

  @Override
  public BlobRepr withAttr(String key, Repr value) {
    return this.withAttrs(this.attrs.updated(key, value));
  }

  @Override
  public BlobRepr withAttr(String key) {
    return this.withAttr(key, Repr.unit());
  }

  public int size() {
    return this.size;
  }

  public byte getByte(int index) {
    if (index < 0 || index >= this.size) {
      throw new IndexOutOfBoundsException(Integer.toString(index));
    }
    return this.array[this.offset + index];
  }

  public BlobRepr setByte(int index, byte value) {
    if ((this.flags & IMMUTABLE_FLAG) != 0) {
      throw new UnsupportedOperationException("Immutable");
    }
    final int n = this.size;
    if (index < 0 || index >= n) {
      throw new IndexOutOfBoundsException(Integer.toString(index));
    }
    byte[] array = this.array;
    if ((this.flags & ALIASED_FLAG) != 0) {
      final byte[] newArray = new byte[BlobRepr.expand(n)];
      System.arraycopy(array, this.offset, newArray, 0, n);
      array = newArray;
      this.array = array;
      this.offset = 0;
      this.flags &= ~ALIASED_FLAG;
    }
    array[this.offset + index] = value;
    return this;
  }

  public BlobRepr addByte(byte value) {
    if ((this.flags & IMMUTABLE_FLAG) != 0) {
      throw new UnsupportedOperationException("Immutable");
    }
    final int n = this.size;
    byte[] array = this.array;
    if (n + 1 > array.length || (this.flags & ALIASED_FLAG) != 0) {
      final byte[] newArray = new byte[BlobRepr.expand(n + 1)];
      System.arraycopy(array, this.offset, newArray, 0, n);
      array = newArray;
      this.array = array;
      this.offset = 0;
      this.flags &= ~ALIASED_FLAG;
    }
    array[this.offset + n] = value;
    this.size = n + 1;
    return this;
  }

  public BlobRepr addByteArray(byte[] bytes) {
    return this.addByteArray(bytes, 0, bytes.length);
  }

  public BlobRepr addByteArray(byte[] bytes, int offset, int size) {
    if ((this.flags & IMMUTABLE_FLAG) != 0) {
      throw new UnsupportedOperationException("Immutable");
    }
    final int n = this.size;
    byte[] array = this.array;
    if (n + size > array.length || (this.flags & ALIASED_FLAG) != 0) {
      final byte[] newArray = new byte[expand(n + size)];
      System.arraycopy(array, this.offset, newArray, 0, n);
      array = newArray;
      this.array = array;
      this.offset = 0;
      this.flags &= ~ALIASED_FLAG;
    }
    System.arraycopy(bytes, offset, array, this.offset + n, size);
    this.size = n + size;
    return this;
  }

  public BlobRepr addBlob(BlobRepr blob) {
    return this.addByteArray(blob.array, blob.offset, blob.size);
  }

  public void clear() {
    if ((this.flags & IMMUTABLE_FLAG) != 0) {
      throw new UnsupportedOperationException("Immutable");
    }
    this.array = EMPTY_ARRAY;
    this.offset = 0;
    this.size = 0;
    this.flags |= ALIASED_FLAG;
  }

  public byte[] toByteArray() {
    final int n = this.size;
    byte[] array = this.array;
    if (n != array.length || (this.flags & (IMMUTABLE_FLAG | ALIASED_FLAG)) != 0) {
      final byte[] newArray = new byte[n];
      System.arraycopy(array, this.offset, newArray, 0, n);
      array = newArray;
      if ((this.flags & IMMUTABLE_FLAG) == 0) {
        this.array = array;
        this.offset = 0;
        this.flags |= ALIASED_FLAG;
      }
    }
    return array;
  }

  public byte[] asByteArray() {
    return this.array;
  }

  public ByteBuffer toByteBuffer() {
    if ((this.flags & ALIASED_FLAG) != 0) {
      final int n = this.size;
      final byte[] array = this.array;
      final byte[] newArray = new byte[n];
      System.arraycopy(array, this.offset, newArray, 0, n);
      return ByteBuffer.wrap(newArray);
    } else {
      ByteBuffer buffer = ByteBuffer.wrap(this.array, this.offset, this.size);
      if ((this.flags & IMMUTABLE_FLAG) != 0) {
        buffer = buffer.asReadOnlyBuffer();
      }
      this.flags |= ALIASED_FLAG;
      return buffer;
    }
  }

  public ByteBuffer asByteBuffer() {
    return ByteBuffer.wrap(this.array, this.offset, this.size);
  }

  public InputBuffer toInputBuffer() {
    return new BinaryInput(this.toByteArray());
  }

  @Override
  public boolean isMutable() {
    return (this.flags & IMMUTABLE_FLAG) == 0;
  }

  @Override
  public BlobRepr clone() {
    this.flags |= ALIASED_FLAG;
    return new BlobRepr(ALIASED_FLAG, this.attrs, this.array, this.offset, this.size);
  }

  @Override
  public BlobRepr commit() {
    if ((this.flags & IMMUTABLE_FLAG) == 0) {
      this.flags |= IMMUTABLE_FLAG;
      this.attrs.commit();
    }
    return this;
  }

  public Write<?> write(Output<?> output) {
    if (this.size > 0) {
      this.flags |= ALIASED_FLAG;
      final ByteBuffer buffer = ByteBuffer.wrap(this.array, 0, this.size);
      return Binary.encode(output, new BinaryInputBuffer(buffer));
    } else {
      return Write.done();
    }
  }

  public Write<?> write() {
    if (this.size > 0) {
      this.flags |= ALIASED_FLAG;
      final ByteBuffer buffer = ByteBuffer.wrap(this.array, 0, this.size);
      return Binary.encode(new BinaryInputBuffer(buffer));
    } else {
      return Write.done();
    }
  }

  public Write<?> writeBase16(Output<?> output, Base16 base16) {
    if (this.size != 0) {
      return base16.writeByteBuffer(output, ByteBuffer.wrap(this.array, this.offset, this.size));
    } else {
      return Write.done();
    }
  }

  public Write<?> writeBase16(Output<?> output) {
    return this.writeBase16(output, Base16.uppercase());
  }

  public String toBase16(Base16 base16) {
    final StringOutput output = new StringOutput();
    this.writeBase16(output, base16).checkDone();
    return output.get();
  }

  public String toBase16() {
    return this.toBase16(Base16.uppercase());
  }

  public Write<?> writeBase64(Output<?> output, Base64 base64) {
    if (this.size != 0) {
      return base64.writeByteBuffer(output, ByteBuffer.wrap(this.array, this.offset, this.size));
    } else {
      return Write.done();
    }
  }

  public Write<?> writeBase64(Output<?> output) {
    return this.writeBase64(output, Base64.standard());
  }

  public String toBase64(Base64 base64) {
    final StringOutput output = new StringOutput();
    this.writeBase64(output, base64).checkDone();
    return output.get();
  }

  public String toBase64() {
    return this.toBase64(Base64.standard());
  }

  @Override
  public int compareTo(BlobRepr that) {
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
  public boolean equals(@Nullable Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof BlobRepr) {
      final BlobRepr that = (BlobRepr) other;
      if (this.attrs.equals(that.attrs)) {
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
    }
    return false;
  }

  private static final int hashSeed = Murmur3.seed(BlobRepr.class);

  @Override
  public int hashCode() {
    return Murmur3.mash(Murmur3.mixByteArray(BlobRepr.hashSeed, this.array, this.offset, this.size));
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    if (this.size == 0) {
      notation.beginInvoke("BlobRepr", "empty").endInvoke();
    } else {
      notation.beginInvoke("BlobRepr", "fromBase16")
              .beginArgument()
              .append('"');
      this.writeBase16(StringOutput.from(output)).checkDone();
      notation.append('"')
              .endArgument()
              .endInvoke();
    }
    if (!this.attrs.isEmpty()) {
      this.attrs.writeWithAttrs(notation);
    }
  }

  @Override
  public String toString() {
    return this.toSource();
  }

  static final int IMMUTABLE_FLAG = 1 << 0;

  static final int ALIASED_FLAG = 1 << 1;

  private static final byte[] EMPTY_ARRAY = new byte[0];

  private static final BlobRepr EMPTY = new BlobRepr(IMMUTABLE_FLAG | ALIASED_FLAG, Attrs.empty(), EMPTY_ARRAY, 0, 0);

  public static BlobRepr empty() {
    return EMPTY;
  }

  public static BlobRepr create() {
    return new BlobRepr(ALIASED_FLAG, Attrs.empty(), EMPTY_ARRAY, 0, 0);
  }

  public static BlobRepr withCapacity(int initialCapacity) {
    return new BlobRepr(0, Attrs.empty(), new byte[initialCapacity], 0, 0);
  }

  public static BlobRepr wrap(ByteBuffer buffer) {
    return new BlobRepr(ALIASED_FLAG, Attrs.empty(), buffer.array(),
                        buffer.arrayOffset(), buffer.remaining());
  }

  public static BlobRepr wrap(byte[] array, int offset, int size) {
    return new BlobRepr(ALIASED_FLAG, Attrs.empty(), array, offset, size);
  }

  public static BlobRepr wrap(byte[] array) {
    return new BlobRepr(ALIASED_FLAG, Attrs.empty(), array, 0, array.length);
  }

  public static BlobRepr from(ByteBuffer buffer) {
    final int size = buffer.remaining();
    if (buffer.hasArray()) {
      return new BlobRepr(ALIASED_FLAG, Attrs.empty(), buffer.array(),
                          buffer.arrayOffset(), buffer.remaining());
    } else {
      final byte[] array = new byte[size];
      buffer.get(array);
      return new BlobRepr(0, Attrs.empty(), array, 0, size);
    }
  }

  public static BlobRepr fromBase16(String string) {
    return Base16.parse(new StringInput(string), new BlobReprOutput()).getNonNull();
  }

  public static BlobRepr fromBase64(String string, Base64 base64) {
    return base64.parse(new StringInput(string), new BlobReprOutput()).getNonNull();
  }

  public static BlobRepr fromBase64(String string) {
    return fromBase64(string, Base64.standard());
  }

  public static BlobRepr fromUtf8(String string) {
    final Utf8EncodedOutput<BlobRepr> output = new Utf8EncodedOutput<BlobRepr>(new BlobReprOutput());
    int i = 0;
    final int n = string.length();
    while (i < n) {
      output.write(string.codePointAt(i));
      i = string.offsetByCodePoints(i, 1);
    }
    return output.getNonNull();
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
