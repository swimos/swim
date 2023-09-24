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

package swim.waml;

import java.math.BigInteger;
import java.nio.ByteBuffer;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import org.junit.jupiter.api.Test;
import org.junit.platform.commons.JUnitException;
import swim.annotations.Nullable;
import swim.collections.UniformMap;
import swim.decl.TypeName;
import swim.util.Murmur3;
import swim.util.Notation;
import swim.waml.decl.WamlSubType;
import swim.waml.decl.WamlTypeInfo;
import swim.waml.decl.WamlTypeName;

public class WamlLangWriterTests {

  @Test
  public void writeNull() {
    assertWrites("()", null);
  }

  @Test
  public void writeBooleans() {
    assertWrites("true", true);
    assertWrites("false", false);
  }

  @Test
  public void writeNumbers() {
    assertWrites("0", 0);
    assertWrites("1", 1);
    assertWrites("-1", -1);
    assertWrites("15", 15);
    assertWrites("-20", -20);
    assertWrites("3.14", 3.14);
    assertWrites("-0.5", -0.5);
    assertWrites("6.02E23", 6.02E23);
    assertWrites("2147483647", 2147483647);
    assertWrites("-2147483648", -2147483648);
    assertWrites("9223372036854775807", 9223372036854775807L);
    assertWrites("-9223372036854775808", -9223372036854775808L);
    assertWrites("9223372036854775808", new BigInteger("9223372036854775808"));
    assertWrites("-9223372036854775809", new BigInteger("-9223372036854775809"));
  }

  @Test
  public void writeEmptyStrings() {
    assertWrites("\"\"",
                 "");
  }

  @Test
  public void writeNonEmptyStrings() {
    assertWrites("\"Hello, world!\"",
                 "Hello, world!");
  }

  @Test
  public void writeStringsWithEscapes() {
    assertWrites("\"\\\"\\\\\\b\\f\\n\\r\\t\"",
                 "\"\\\b\f\n\r\t");
  }

  @Test
  public void writeEmptyByteBuffers() {
    assertWrites("@blob\"\"",
                 ByteBuffer.allocate(0));
  }

  @Test
  public void writeNonEmptyByteBuffers() {
    assertWrites("@blob\"AAAA\"",
                 ByteBuffer.allocate(3));
    assertWrites("@blob\"AAA=\"",
                 ByteBuffer.allocate(2));
    assertWrites("@blob\"AA==\"",
                 ByteBuffer.allocate(1));
    assertWrites("@blob\"ABCDabcd12/+\"",
                 ByteBuffer.wrap(new byte[] {(byte) 0x00, (byte) 0x10, (byte) 0x83, (byte) 0x69, (byte) 0xB7, (byte) 0x1D, (byte) 0xD7, (byte) 0x6F, (byte) 0xFE}));
  }

  @Test
  public void writeEmptyArrays() {
    assertWrites("[]",
                 new Object[] {});
  }

  @Test
  public void writeUnaryArrays() {
    assertWrites("[1]",
                 new Object[] {1});
  }

  @Test
  public void writeNonEmptyArrays() {
    assertWrites("[1,2,\"3\",true]",
                 new Object[]{1, 2, "3", true});
  }

  @Test
  public void writeNestedArrays() {
    assertWrites("[[1,2],[3,4]]",
                 new Object[] {new Object[] {1, 2}, new Object[] {3, 4}});
  }

  @Test
  public void writePrimitiveArrays() {
    assertWrites("[1,2,3]",
                 new int[] {1, 2, 3});
  }

  @Test
  public void writeEmptyLists() {
    assertWrites("[]",
                 List.of());
  }

  @Test
  public void writeUnaryLists() {
    assertWrites("[1]",
                 List.of(1));
  }

  @Test
  public void writeNonEmptyLists() {
    assertWrites("[1,2,\"3\",true]",
                 List.of(1, 2, "3", true));
  }

  @Test
  public void writeNestedLists() {
    assertWrites("[[1,2],[3,4]]",
                 List.of(List.of(1, 2), List.of(3, 4)));
  }

  @Test
  public void writeEmptyMaps() {
    assertWrites("{}",
                 Map.of());
  }

  @Test
  public void writeUnaryMaps() {
    assertWrites("{a:1}",
                 Map.of("a", 1));
  }

  @Test
  public void writeNonEmptyMaps() {
    final UniformMap<String, Object> map = new UniformMap<String, Object>();
    map.put("a", 1);
    map.put("b", 2);
    map.put("c", "3");
    map.put("d", true);
    assertWrites("{a:1,b:2,c:\"3\",d:true}", map);
  }

  @Test
  public void writeNestedMaps() {
    final UniformMap<String, Object> map = new UniformMap<String, Object>();
    final UniformMap<String, Object> mapA = new UniformMap<String, Object>();
    mapA.put("b", 2);
    mapA.put("c", "3");
    map.put("a", mapA);
    final UniformMap<String, Object> mapD = new UniformMap<String, Object>();
    mapD.put("e", true);
    map.put("d", mapD);
    assertWrites("{a:{b:2,c:\"3\"},d:{e:true}}", map);
  }

  public enum TestEnum {
    ONE,
    @WamlTypeName("two")
    TWO,
    @TypeName("three")
    THREE,
    FOUR;
  }

  @Test
  public void writeEnums() {
    assertWrites(TestEnum.class,
                 "\"ONE\"",
                 TestEnum.ONE);
    assertWrites(TestEnum.class,
                 "\"two\"",
                 TestEnum.TWO);
    assertWrites(TestEnum.class,
                 "\"three\"",
                 TestEnum.THREE);
    assertWrites(TestEnum.class,
                 "\"FOUR\"",
                 TestEnum.FOUR);
  }

  public static class TestObject {

    long a;
    @Nullable String b;

    TestObject(long a, @Nullable String b) {
      this.a = a;
      this.b = b;
    }

    TestObject() {
      // default
    }

    @Override
    public boolean equals(@Nullable Object other) {
      if (this == other) {
        return true;
      } else if (other instanceof TestObject that) {
        return this.a == that.a && Objects.equals(this.b, that.b);
      }
      return false;
    }

    @Override
    public int hashCode() {
      return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.seed(TestObject.class),
          Murmur3.hash(this.a)), Objects.hashCode(this.b)));
    }

    @Override
    public String toString() {
      return Notation.of().beginInvokeNew("TestObject")
                          .appendArgument(this.a)
                          .appendArgument(this.b)
                          .endInvoke()
                          .toString();
    }

  }

  @Test
  public void writeReflectedObjects() {
    assertWrites(TestObject.class,
                 "{a:3,b:\"foo\"}",
                 new TestObject(3L, "foo"));
  }

  @WamlTypeInfo
  @WamlSubType(TestPoint2.class)
  @WamlSubType(TestPoint3.class)
  public abstract static class TestPoint {

  }

  public static class TestPoint2 extends TestPoint {

    double x;
    double y;

    TestPoint2(double x, double y) {
      this.x = x;
      this.y = y;
    }

    TestPoint2() {
      // default
    }

    @Override
    public boolean equals(@Nullable Object other) {
      if (this == other) {
        return true;
      } else if (other instanceof TestPoint2 that) {
        return this.x == that.x && this.y == that.y;
      }
      return false;
    }

    @Override
    public int hashCode() {
      return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.seed(TestPoint2.class),
          Murmur3.hash(this.x)), Murmur3.hash(this.x)));
    }

    @Override
    public String toString() {
      return Notation.of().beginInvokeNew("TestPoint2")
                          .appendArgument(this.x)
                          .appendArgument(this.y)
                          .endInvoke()
                          .toString();
    }

  }

  @WamlTypeName("Point3")
  public static class TestPoint3 extends TestPoint {

    double x;
    double y;
    double z;

    TestPoint3(double x, double y, double z) {
      this.x = x;
      this.y = y;
      this.z = z;
    }

    TestPoint3() {
      // default
    }

    @Override
    public boolean equals(@Nullable Object other) {
      if (this == other) {
        return true;
      } else if (other instanceof TestPoint3 that) {
        return this.x == that.x && this.y == that.y && this.z == that.z;
      }
      return false;
    }

    @Override
    public int hashCode() {
      return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.seed(TestPoint3.class),
          Murmur3.hash(this.x)), Murmur3.hash(this.y)), Murmur3.hash(this.z)));
    }

    @Override
    public String toString() {
      return Notation.of().beginInvokeNew("TestPoint3")
                          .appendArgument(this.x)
                          .appendArgument(this.y)
                          .appendArgument(this.z)
                          .endInvoke()
                          .toString();
    }

  }

  @Test
  public void writeMonomorphicTypes() {
    assertWrites(TestPoint2.class,
                 "{x:-2.0,y:3.0}",
                 new TestPoint2(-2.0, 3.0));
    assertWrites(TestPoint3.class,
                 "{x:2.0,y:-3.0,z:5.0}",
                 new TestPoint3(2.0, -3.0, 5.0));
  }

  @Test
  public void writePolymorphicTypes() throws WamlProviderException {
    assertWrites(TestPoint.class,
                 "@TestPoint2{x:-2.0,y:3.0}",
                 new TestPoint2(-2.0, 3.0));
    assertWrites(TestPoint.class,
                 "@Point3{x:2.0,y:-3.0,z:5.0}",
                 new TestPoint3(2.0, -3.0, 5.0));
  }

  public static <T> void assertWrites(WamlWriter<T> writer, String expected, @Nullable T value) {
    WamlAssertions.assertWrites(expected, () -> writer.write(value, WamlWriterOptions.compact()));
  }

  public static void assertWrites(Class<?> valueClass, String expected, @Nullable Object value) {
    final WamlWriter<Object> writer;
    try {
      writer = WamlFormat.get(valueClass);
    } catch (WamlProviderException cause) {
      throw new JUnitException(cause.getMessage(), cause);
    }
    WamlAssertions.assertWrites(expected, () -> writer.write(value, WamlWriterOptions.compact()));
  }

  public static void assertWrites(String expected, @Nullable Object value) {
    final WamlWriter<Object> writer;
    try {
      writer = WamlFormat.get(value);
    } catch (WamlProviderException cause) {
      throw new JUnitException(cause.getMessage(), cause);
    }
    WamlAssertions.assertWrites(expected, () -> writer.write(value, WamlWriterOptions.compact()));
  }

}
