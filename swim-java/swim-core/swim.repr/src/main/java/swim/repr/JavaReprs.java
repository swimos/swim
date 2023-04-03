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

import java.lang.reflect.Type;
import java.math.BigInteger;
import java.net.Inet6Address;
import java.net.InetAddress;
import java.net.InetSocketAddress;
import java.net.UnknownHostException;
import java.nio.ByteBuffer;
import java.time.Instant;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.util.Notation;
import swim.util.ToSource;

@Public
@Since("5.0")
public final class JavaReprs implements ReprProvider, ToSource {

  final int priority;

  private JavaReprs(int priority) {
    this.priority = priority;
  }

  @Override
  public int priority() {
    return this.priority;
  }

  @Override
  public @Nullable ReprForm<?> resolveReprForm(Type javaType) throws ReprFormException {
    if (javaType instanceof Class<?>) {
      final Class<?> javaClass = (Class<?>) javaType;
      if (javaClass == Boolean.class || javaClass == Boolean.TYPE) {
        return JavaReprs.booleanForm();
      } else if (javaClass == Byte.class || javaClass == Byte.TYPE) {
        return JavaReprs.byteForm();
      } else if (javaClass == Character.class || javaClass == Character.TYPE) {
        return JavaReprs.charForm();
      } else if (javaClass == Short.class || javaClass == Short.TYPE) {
        return JavaReprs.shortForm();
      } else if (javaClass == Integer.class || javaClass == Integer.TYPE) {
        return JavaReprs.intForm();
      } else if (javaClass == Long.class || javaClass == Long.TYPE) {
        return JavaReprs.longForm();
      } else if (javaClass == Float.class || javaClass == Float.TYPE) {
        return JavaReprs.floatForm();
      } else if (javaClass == Double.class || javaClass == Double.TYPE) {
        return JavaReprs.doubleForm();
      } else if (BigInteger.class.isAssignableFrom(javaClass)) {
        return JavaReprs.bigIntegerForm();
      } else if (Number.class.isAssignableFrom(javaClass)) {
        return JavaReprs.numberForm();
      } else if (javaClass == String.class) {
        return JavaReprs.stringForm();
      } else if (ByteBuffer.class.isAssignableFrom(javaClass)) {
        return JavaReprs.byteBufferForm();
      } else if (Instant.class.isAssignableFrom(javaClass)) {
        return JavaReprs.instantForm();
      } else if (InetAddress.class.isAssignableFrom(javaClass)) {
        return JavaReprs.inetAddressForm();
      } else if (InetSocketAddress.class.isAssignableFrom(javaClass)) {
        return JavaReprs.inetSocketAddressForm();
      }
    }
    return null;
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("JavaReprs", "provider");
    if (this.priority != BUILTIN_PRIORITY) {
      notation.appendArgument(this.priority);
    }
    notation.endInvoke();
  }

  @Override
  public String toString() {
    return this.toSource();
  }

  private static final JavaReprs PROVIDER = new JavaReprs(BUILTIN_PRIORITY);

  public static JavaReprs provider(int priority) {
    if (priority == BUILTIN_PRIORITY) {
      return PROVIDER;
    } else {
      return new JavaReprs(priority);
    }
  }

  public static JavaReprs provider() {
    return PROVIDER;
  }

  public static ReprForm<Object> nullForm() {
    return JavaReprs.NullForm.INSTANCE;
  }

  public static ReprForm<Boolean> booleanForm() {
    return JavaReprs.BooleanForm.INSTANCE;
  }

  public static ReprForm<Byte> byteForm() {
    return JavaReprs.ByteForm.INSTANCE;
  }

  public static ReprForm<Character> charForm() {
    return JavaReprs.CharForm.INSTANCE;
  }

  public static ReprForm<Short> shortForm() {
    return JavaReprs.ShortForm.INSTANCE;
  }

  public static ReprForm<Integer> intForm() {
    return JavaReprs.IntForm.INSTANCE;
  }

  public static ReprForm<Long> longForm() {
    return JavaReprs.LongForm.INSTANCE;
  }

  public static ReprForm<Float> floatForm() {
    return JavaReprs.FloatForm.INSTANCE;
  }

  public static ReprForm<Double> doubleForm() {
    return JavaReprs.DoubleForm.INSTANCE;
  }

  public static ReprForm<BigInteger> bigIntegerForm() {
    return JavaReprs.BigIntegerForm.INSTANCE;
  }

  public static ReprForm<Number> numberForm() {
    return JavaReprs.NumberForm.INSTANCE;
  }

  public static ReprForm<String> stringForm() {
    return JavaReprs.StringForm.INSTANCE;
  }

  public static ReprForm<ByteBuffer> byteBufferForm() {
    return JavaReprs.ByteBufferForm.INSTANCE;
  }

  public static ReprForm<Instant> instantForm() {
    return JavaReprs.InstantForm.INSTANCE;
  }

  public static ReprForm<InetAddress> inetAddressForm() {
    return JavaReprs.InetAddressForm.INSTANCE;
  }

  public static ReprForm<InetSocketAddress> inetSocketAddressForm() {
    return JavaReprs.InetSocketAddressForm.INSTANCE;
  }

  static final class NullForm implements ReprForm<Object>, ToSource {

    @Override
    public Repr intoRepr(@Nullable Object value) {
      return UnitRepr.unit();
    }

    @Override
    public @Nullable Object fromRepr(Repr repr) {
      return null;
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("JavaReprs", "nullForm").endInvoke();
    }

    @Override
    public String toString() {
      return this.toSource();
    }

    static final JavaReprs.NullForm INSTANCE = new JavaReprs.NullForm();

  }

  static final class BooleanForm implements ReprForm<Boolean>, ToSource {

    @Override
    public Repr intoRepr(@Nullable Boolean value) {
      if (value == null) {
        return Repr.undefined();
      }
      return BooleanRepr.of(value.booleanValue());
    }

    @Override
    public @Nullable Boolean fromRepr(Repr repr) {
      if (repr.isValidBoolean()) {
        return Boolean.valueOf(repr.booleanValue());
      }
      return null;
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("JavaReprs", "booleanForm").endInvoke();
    }

    @Override
    public String toString() {
      return this.toSource();
    }

    static final JavaReprs.BooleanForm INSTANCE = new JavaReprs.BooleanForm();

  }

  static final class ByteForm implements ReprForm<Byte>, ToSource {

    @Override
    public Repr intoRepr(@Nullable Byte value) {
      if (value == null) {
        return Repr.undefined();
      }
      return IntRepr.of((int) value.byteValue());
    }

    @Override
    public @Nullable Byte fromRepr(Repr repr) {
      if (repr.isValidByte()) {
        return Byte.valueOf(repr.byteValue());
      }
      return null;
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("JavaReprs", "byteForm").endInvoke();
    }

    @Override
    public String toString() {
      return this.toSource();
    }

    static final JavaReprs.ByteForm INSTANCE = new JavaReprs.ByteForm();

  }

  static final class CharForm implements ReprForm<Character>, ToSource {

    @Override
    public Repr intoRepr(@Nullable Character value) {
      if (value == null) {
        return Repr.undefined();
      }
      return IntRepr.of((int) value.charValue());
    }

    @Override
    public @Nullable Character fromRepr(Repr repr) {
      if (repr.isValidChar()) {
        return Character.valueOf(repr.charValue());
      }
      return null;
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("JavaReprs", "charForm").endInvoke();
    }

    @Override
    public String toString() {
      return this.toSource();
    }

    static final JavaReprs.CharForm INSTANCE = new JavaReprs.CharForm();

  }

  static final class ShortForm implements ReprForm<Short>, ToSource {

    @Override
    public Repr intoRepr(@Nullable Short value) {
      if (value == null) {
        return Repr.undefined();
      }
      return IntRepr.of((int) value.shortValue());
    }

    @Override
    public @Nullable Short fromRepr(Repr repr) {
      if (repr.isValidShort()) {
        return Short.valueOf(repr.shortValue());
      }
      return null;
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("JavaReprs", "shortForm").endInvoke();
    }

    @Override
    public String toString() {
      return this.toSource();
    }

    static final JavaReprs.ShortForm INSTANCE = new JavaReprs.ShortForm();

  }

  static final class IntForm implements ReprForm<Integer>, ToSource {

    @Override
    public Repr intoRepr(@Nullable Integer value) {
      if (value == null) {
        return Repr.undefined();
      }
      return IntRepr.of(value.intValue());
    }

    @Override
    public @Nullable Integer fromRepr(Repr repr) {
      if (repr.isValidInt()) {
        return Integer.valueOf(repr.intValue());
      }
      return null;
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("JavaReprs", "intForm").endInvoke();
    }

    @Override
    public String toString() {
      return this.toSource();
    }

    static final JavaReprs.IntForm INSTANCE = new JavaReprs.IntForm();

  }

  static final class LongForm implements ReprForm<Long>, ToSource {

    @Override
    public Repr intoRepr(@Nullable Long value) {
      if (value == null) {
        return Repr.undefined();
      }
      return LongRepr.of(value.longValue());
    }

    @Override
    public @Nullable Long fromRepr(Repr repr) {
      if (repr.isValidLong()) {
        return Long.valueOf(repr.longValue());
      }
      return null;
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("JavaReprs", "longForm").endInvoke();
    }

    @Override
    public String toString() {
      return this.toSource();
    }

    static final JavaReprs.LongForm INSTANCE = new JavaReprs.LongForm();

  }

  static final class FloatForm implements ReprForm<Float>, ToSource {

    @Override
    public Repr intoRepr(@Nullable Float value) {
      if (value == null) {
        return Repr.undefined();
      }
      return FloatRepr.of(value.floatValue());
    }

    @Override
    public @Nullable Float fromRepr(Repr repr) {
      if (repr.isValidFloat()) {
        return Float.valueOf(repr.floatValue());
      }
      return null;
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("JavaReprs", "floatForm").endInvoke();
    }

    @Override
    public String toString() {
      return this.toSource();
    }

    static final JavaReprs.FloatForm INSTANCE = new JavaReprs.FloatForm();

  }

  static final class DoubleForm implements ReprForm<Double>, ToSource {

    @Override
    public Repr intoRepr(@Nullable Double value) {
      if (value == null) {
        return Repr.undefined();
      }
      return DoubleRepr.of(value.doubleValue());
    }

    @Override
    public @Nullable Double fromRepr(Repr repr) {
      if (repr.isValidDouble()) {
        return Double.valueOf(repr.doubleValue());
      }
      return null;
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("JavaReprs", "doubleForm").endInvoke();
    }

    @Override
    public String toString() {
      return this.toSource();
    }

    static final JavaReprs.DoubleForm INSTANCE = new JavaReprs.DoubleForm();

  }

  static final class BigIntegerForm implements ReprForm<BigInteger>, ToSource {

    @Override
    public Repr intoRepr(@Nullable BigInteger value) {
      if (value == null) {
        return Repr.undefined();
      }
      return BigIntegerRepr.of(value);
    }

    @Override
    public @Nullable BigInteger fromRepr(Repr repr) {
      if (repr.isValidBigInteger()) {
        return repr.bigIntegerValue();
      }
      return null;
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("JavaReprs", "bigIntegerForm").endInvoke();
    }

    @Override
    public String toString() {
      return this.toSource();
    }

    static final JavaReprs.BigIntegerForm INSTANCE = new JavaReprs.BigIntegerForm();

  }

  static final class NumberForm implements ReprForm<Number>, ToSource {

    @Override
    public Repr intoRepr(@Nullable Number value) throws ReprException {
      if (value == null) {
        return Repr.undefined();
      } else if (value instanceof Byte || value instanceof Short || value instanceof Integer) {
        return IntRepr.of(value.intValue());
      } else if (value instanceof Long) {
        return LongRepr.of(value.longValue());
      } else if (value instanceof Float) {
        return FloatRepr.of(value.floatValue());
      } else if (value instanceof Double) {
        return DoubleRepr.of(value.doubleValue());
      } else if (value instanceof BigInteger) {
        return BigIntegerRepr.of((BigInteger) value);
      } else {
        throw new ReprException("unsupported value: " + value);
      }
    }

    @Override
    public @Nullable Number fromRepr(Repr repr) {
      if (repr.isValidNumber()) {
        return repr.numberValue();
      }
      return null;
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("JavaReprs", "numberForm").endInvoke();
    }

    @Override
    public String toString() {
      return this.toSource();
    }

    static final JavaReprs.NumberForm INSTANCE = new JavaReprs.NumberForm();

  }

  static final class StringForm implements ReprForm<String>, ToSource {

    @Override
    public Repr intoRepr(@Nullable String value) {
      if (value == null) {
        return Repr.undefined();
      }
      return StringRepr.of(value);
    }

    @Override
    public @Nullable String fromRepr(Repr repr) {
      if (repr.isValidString()) {
        return repr.stringValue();
      }
      return null;
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("JavaReprs", "stringForm").endInvoke();
    }

    @Override
    public String toString() {
      return this.toSource();
    }

    static final JavaReprs.StringForm INSTANCE = new JavaReprs.StringForm();

  }

  static final class ByteBufferForm implements ReprForm<ByteBuffer>, ToSource {

    @Override
    public Repr intoRepr(@Nullable ByteBuffer value) {
      if (value == null) {
        return Repr.undefined();
      }
      return BlobRepr.from(value);
    }

    @Override
    public @Nullable ByteBuffer fromRepr(Repr repr) {
      if (repr instanceof BlobRepr) {
        return ((BlobRepr) repr).toByteBuffer();
      }
      return null;
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("JavaReprs", "byteBufferForm").endInvoke();
    }

    @Override
    public String toString() {
      return this.toSource();
    }

    static final JavaReprs.ByteBufferForm INSTANCE = new JavaReprs.ByteBufferForm();

  }

  static final class InstantForm implements ReprForm<Instant>, ToSource {

    @Override
    public Repr intoRepr(@Nullable Instant value) {
      if (value == null) {
        return Repr.undefined();
      }
      return StringRepr.of(value.toString());
    }

    @Override
    public @Nullable Instant fromRepr(Repr repr) {
      if (repr.isValidString()) {
        return Instant.parse(repr.stringValue());
      } else if (repr.isValidLong()) {
        return Instant.ofEpochMilli(repr.longValue());
      }
      return null;
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("JavaReprs", "instantForm").endInvoke();
    }

    @Override
    public String toString() {
      return this.toSource();
    }

    static final JavaReprs.InstantForm INSTANCE = new JavaReprs.InstantForm();

  }

  static final class InetAddressForm implements ReprForm<InetAddress>, ToSource {

    @Override
    public Repr intoRepr(@Nullable InetAddress value) {
      if (value == null) {
        return Repr.undefined();
      }
      return StringRepr.of(value.getHostAddress());
    }

    @Override
    public @Nullable InetAddress fromRepr(Repr repr) throws ReprException {
      if (repr.isValidString()) {
        try {
          return InetAddress.getByName(repr.stringValue());
        } catch (UnknownHostException | SecurityException cause) {
          throw new ReprException(cause);
        }
      } else if (repr instanceof BlobRepr) {
        try {
          return InetAddress.getByAddress(((BlobRepr) repr).asByteArray());
        } catch (UnknownHostException cause) {
          throw new ReprException(cause);
        }
      }
      return null;
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("JavaReprs", "inetAddress").endInvoke();
    }

    @Override
    public String toString() {
      return this.toSource();
    }

    static final JavaReprs.InetAddressForm INSTANCE = new JavaReprs.InetAddressForm();

  }

  static final class InetSocketAddressForm implements ReprForm<InetSocketAddress>, ToSource {

    @Override
    public Repr intoRepr(@Nullable InetSocketAddress value) {
      if (value == null) {
        return Repr.undefined();
      }
      final StringBuilder builder = new StringBuilder();
      // Construct a host:port string without triggering address resolution.
      final String hostString = value.getHostString();
      final InetAddress inetAddress = value.getAddress();
      if (inetAddress instanceof Inet6Address && hostString.equals(inetAddress.getHostAddress())) {
        // Host is an IPv6 literal; enclose it in square brackets.
        builder.append('[').append(hostString).append(']');
      } else {
        // Host is either a hostname or an IPv4 literal.
        builder.append(hostString);
      }
      builder.append(':').append(value.getPort());
      return StringRepr.of(builder.toString());
    }

    @Override
    public @Nullable InetSocketAddress fromRepr(Repr repr) throws ReprException {
      if (repr.isValidString()) {
        final String address = repr.stringValue();
        final int colonIndex = address.indexOf(':');
        if (colonIndex >= 0) {
          try {
            final String host = address.substring(0, colonIndex);
            final int port = Integer.parseInt(address.substring(colonIndex + 1));
            return InetSocketAddress.createUnresolved(host, port);
          } catch (IllegalArgumentException cause) {
            throw new ReprException(cause);
          }
        }
      }
      return null;
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("JavaReprs", "inetSocketAddress").endInvoke();
    }

    @Override
    public String toString() {
      return this.toSource();
    }

    static final JavaReprs.InetSocketAddressForm INSTANCE = new JavaReprs.InetSocketAddressForm();

  }

}
