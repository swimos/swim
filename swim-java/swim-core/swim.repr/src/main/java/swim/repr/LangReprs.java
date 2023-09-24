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

package swim.repr;

import java.lang.reflect.Type;
import java.math.BigInteger;
import java.net.Inet6Address;
import java.net.InetAddress;
import java.net.InetSocketAddress;
import java.net.UnknownHostException;
import java.nio.ByteBuffer;
import java.time.Instant;
import java.time.format.DateTimeParseException;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.util.Notation;
import swim.util.WriteSource;

@Public
@Since("5.0")
public final class LangReprs implements ReprProvider, WriteSource {

  final int priority;

  private LangReprs(int priority) {
    this.priority = priority;
  }

  @Override
  public int priority() {
    return this.priority;
  }

  @Override
  public @Nullable ReprForm<?> resolveReprForm(Type type) throws ReprProviderException {
    if (type instanceof Class<?>) {
      final Class<?> classType = (Class<?>) type;
      if (classType == Boolean.class || classType == Boolean.TYPE) {
        return LangReprs.booleanForm();
      } else if (classType == Byte.class || classType == Byte.TYPE) {
        return LangReprs.byteForm();
      } else if (classType == Character.class || classType == Character.TYPE) {
        return LangReprs.charForm();
      } else if (classType == Short.class || classType == Short.TYPE) {
        return LangReprs.shortForm();
      } else if (classType == Integer.class || classType == Integer.TYPE) {
        return LangReprs.intForm();
      } else if (classType == Long.class || classType == Long.TYPE) {
        return LangReprs.longForm();
      } else if (classType == Float.class || classType == Float.TYPE) {
        return LangReprs.floatForm();
      } else if (classType == Double.class || classType == Double.TYPE) {
        return LangReprs.doubleForm();
      } else if (BigInteger.class.isAssignableFrom(classType)) {
        return LangReprs.bigIntegerForm();
      } else if (Number.class.isAssignableFrom(classType)) {
        return LangReprs.numberForm();
      } else if (classType == String.class) {
        return LangReprs.stringFormat();
      } else if (ByteBuffer.class.isAssignableFrom(classType)) {
        return LangReprs.byteBufferForm();
      } else if (Instant.class.isAssignableFrom(classType)) {
        return LangReprs.instantForm();
      } else if (InetAddress.class.isAssignableFrom(classType)) {
        return LangReprs.inetAddressForm();
      } else if (InetSocketAddress.class.isAssignableFrom(classType)) {
        return LangReprs.inetSocketAddressForm();
      }
    }
    return null;
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("LangReprs", "provider");
    if (this.priority != BUILTIN_PRIORITY) {
      notation.appendArgument(this.priority);
    }
    notation.endInvoke();
  }

  @Override
  public String toString() {
    return WriteSource.toString(this);
  }

  static final LangReprs PROVIDER = new LangReprs(BUILTIN_PRIORITY);

  public static LangReprs provider(int priority) {
    if (priority == BUILTIN_PRIORITY) {
      return PROVIDER;
    }
    return new LangReprs(priority);
  }

  public static LangReprs provider() {
    return PROVIDER;
  }

  public static ReprForm<Object> nullForm() {
    return NullForm.INSTANCE;
  }

  public static ReprForm<Boolean> booleanForm() {
    return BooleanForm.INSTANCE;
  }

  public static ReprForm<Byte> byteForm() {
    return ByteForm.INSTANCE;
  }

  public static ReprForm<Character> charForm() {
    return CharForm.INSTANCE;
  }

  public static ReprForm<Short> shortForm() {
    return ShortForm.INSTANCE;
  }

  public static ReprForm<Integer> intForm() {
    return IntForm.INSTANCE;
  }

  public static ReprForm<Long> longForm() {
    return LongForm.INSTANCE;
  }

  public static ReprForm<Float> floatForm() {
    return FloatForm.INSTANCE;
  }

  public static ReprForm<Double> doubleForm() {
    return DoubleForm.INSTANCE;
  }

  public static ReprForm<BigInteger> bigIntegerForm() {
    return BigIntegerForm.INSTANCE;
  }

  public static ReprForm<Number> numberForm() {
    return NumberForm.INSTANCE;
  }

  public static ReprForm<String> stringFormat() {
    return StringForm.INSTANCE;
  }

  public static ReprForm<ByteBuffer> byteBufferForm() {
    return ByteBufferForm.INSTANCE;
  }

  public static ReprForm<Instant> instantForm() {
    return InstantForm.INSTANCE;
  }

  public static ReprForm<InetAddress> inetAddressForm() {
    return InetAddressForm.INSTANCE;
  }

  public static ReprForm<InetSocketAddress> inetSocketAddressForm() {
    return InetSocketAddressForm.INSTANCE;
  }

  static final class NullForm implements ReprForm<Object>, WriteSource {

    @Override
    public Repr intoRepr(@Nullable Object value) {
      return UnitRepr.unit();
    }

    @Override
    public @Nullable Object fromRepr(Repr repr) {
      return null;
    }

    @Override
    public @Nullable Object initializer() {
      return null;
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("LangReprs", "nullForm").endInvoke();
    }

    @Override
    public String toString() {
      return WriteSource.toString(this);
    }

    static final NullForm INSTANCE = new NullForm();

  }

  static final class BooleanForm implements ReprForm<Boolean>, WriteSource {

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
    public Boolean initializer() {
      return Boolean.FALSE;
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("LangReprs", "booleanForm").endInvoke();
    }

    @Override
    public String toString() {
      return WriteSource.toString(this);
    }

    static final BooleanForm INSTANCE = new BooleanForm();

  }

  static final class ByteForm implements ReprForm<Byte>, WriteSource {

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
    public Byte initializer() {
      return Byte.valueOf((byte) 0);
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("LangReprs", "byteForm").endInvoke();
    }

    @Override
    public String toString() {
      return WriteSource.toString(this);
    }

    static final ByteForm INSTANCE = new ByteForm();

  }

  static final class CharForm implements ReprForm<Character>, WriteSource {

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
    public Character initializer() {
      return Character.valueOf((char) 0);
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("LangReprs", "charForm").endInvoke();
    }

    @Override
    public String toString() {
      return WriteSource.toString(this);
    }

    static final CharForm INSTANCE = new CharForm();

  }

  static final class ShortForm implements ReprForm<Short>, WriteSource {

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
    public Short initializer() {
      return Short.valueOf((short) 0);
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("LangReprs", "shortForm").endInvoke();
    }

    @Override
    public String toString() {
      return WriteSource.toString(this);
    }

    static final ShortForm INSTANCE = new ShortForm();

  }

  static final class IntForm implements ReprForm<Integer>, WriteSource {

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
    public Integer initializer() {
      return Integer.valueOf(0);
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("LangReprs", "intForm").endInvoke();
    }

    @Override
    public String toString() {
      return WriteSource.toString(this);
    }

    static final IntForm INSTANCE = new IntForm();

  }

  static final class LongForm implements ReprForm<Long>, WriteSource {

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
    public Long initializer() {
      return Long.valueOf(0L);
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("LangReprs", "longForm").endInvoke();
    }

    @Override
    public String toString() {
      return WriteSource.toString(this);
    }

    static final LongForm INSTANCE = new LongForm();

  }

  static final class FloatForm implements ReprForm<Float>, WriteSource {

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
    public Float initializer() {
      return Float.valueOf(0.0f);
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("LangReprs", "floatForm").endInvoke();
    }

    @Override
    public String toString() {
      return WriteSource.toString(this);
    }

    static final FloatForm INSTANCE = new FloatForm();

  }

  static final class DoubleForm implements ReprForm<Double>, WriteSource {

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
    public Double initializer() {
      return Double.valueOf(0.0);
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("LangReprs", "doubleForm").endInvoke();
    }

    @Override
    public String toString() {
      return WriteSource.toString(this);
    }

    static final DoubleForm INSTANCE = new DoubleForm();

  }

  static final class BigIntegerForm implements ReprForm<BigInteger>, WriteSource {

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
    public BigInteger initializer() {
      return BigInteger.ZERO;
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("LangReprs", "bigIntegerForm").endInvoke();
    }

    @Override
    public String toString() {
      return WriteSource.toString(this);
    }

    static final BigIntegerForm INSTANCE = new BigIntegerForm();

  }

  static final class NumberForm implements ReprForm<Number>, WriteSource {

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
      }
      throw new ReprException("unsupported value: " + value);
    }

    @Override
    public @Nullable Number fromRepr(Repr repr) {
      if (repr.isValidNumber()) {
        return repr.numberValue();
      }
      return null;
    }

    @Override
    public @Nullable Number initializer() {
      return null;
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("LangReprs", "numberForm").endInvoke();
    }

    @Override
    public String toString() {
      return WriteSource.toString(this);
    }

    static final NumberForm INSTANCE = new NumberForm();

  }

  static final class StringForm implements ReprForm<String>, WriteSource {

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
    public @Nullable String initializer() {
      return null;
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("LangReprs", "stringFormat").endInvoke();
    }

    @Override
    public String toString() {
      return WriteSource.toString(this);
    }

    static final StringForm INSTANCE = new StringForm();

  }

  static final class ByteBufferForm implements ReprForm<ByteBuffer>, WriteSource {

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
    public @Nullable ByteBuffer initializer() {
      return null;
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("LangReprs", "byteBufferForm").endInvoke();
    }

    @Override
    public String toString() {
      return WriteSource.toString(this);
    }

    static final ByteBufferForm INSTANCE = new ByteBufferForm();

  }

  static final class InstantForm implements ReprForm<Instant>, WriteSource {

    @Override
    public Repr intoRepr(@Nullable Instant value) {
      if (value == null) {
        return Repr.undefined();
      }
      return StringRepr.of(value.toString());
    }

    @Override
    public @Nullable Instant fromRepr(Repr repr) throws ReprException {
      if (repr.isValidString()) {
        try {
          return Instant.parse(repr.stringValue());
        } catch (DateTimeParseException cause) {
          throw new ReprException(cause);
        }
      } else if (repr.isValidLong()) {
        return Instant.ofEpochMilli(repr.longValue());
      }
      return null;
    }

    @Override
    public @Nullable Instant initializer() {
      return null;
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("LangReprs", "instantForm").endInvoke();
    }

    @Override
    public String toString() {
      return WriteSource.toString(this);
    }

    static final InstantForm INSTANCE = new InstantForm();

  }

  static final class InetAddressForm implements ReprForm<InetAddress>, WriteSource {

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
    public @Nullable InetAddress initializer() {
      return null;
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("LangReprs", "inetAddress").endInvoke();
    }

    @Override
    public String toString() {
      return WriteSource.toString(this);
    }

    static final InetAddressForm INSTANCE = new InetAddressForm();

  }

  static final class InetSocketAddressForm implements ReprForm<InetSocketAddress>, WriteSource {

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
    public @Nullable InetSocketAddress initializer() {
      return null;
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("LangReprs", "inetSocketAddress").endInvoke();
    }

    @Override
    public String toString() {
      return WriteSource.toString(this);
    }

    static final InetSocketAddressForm INSTANCE = new InetSocketAddressForm();

  }

}
