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

package swim.waml;

import java.math.BigInteger;
import java.nio.ByteBuffer;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import org.junit.jupiter.api.Test;
import swim.annotations.Nullable;
import swim.codec.ParseException;
import swim.util.Murmur3;
import swim.util.Notation;
import static org.junit.jupiter.api.Assertions.assertThrows;

public class WamlJavaParserTests {

  @Test
  public void parseNull() {
    assertParses(null, "()");
  }

  @Test
  public void parseBooleans() {
    assertParses(true, "true");
    assertParses(false, "false");
  }

  @Test
  public void parsePositiveIntegers() {
    assertParses(0, "0");
    assertParses(1, "1");
    assertParses(5, "5");
    assertParses(10, "10");
    assertParses(11, "11");
    assertParses(15, "15");
    assertParses(2147483647, "2147483647");
    assertParses(9223372036854775807L, "9223372036854775807");
  }

  @Test
  public void parseNegativeIntegers() {
    assertParses(-0, "-0");
    assertParses(-1, "-1");
    assertParses(-5, "-5");
    assertParses(-10, "-10");
    assertParses(-11, "-11");
    assertParses(-15, "-15");
    assertParses(-2147483648, "-2147483648");
    assertParses(-9223372036854775808L, "-9223372036854775808");
  }

  @Test
  public void parsePositiveDecimals() {
    assertParses(0.0f, "0.0");
    assertParses(0.5f, "0.5");
    assertParses(1.0f, "1.0");
    assertParses(1.5f, "1.5");
    assertParses(1.05, "1.05");
    assertParses(10.0f, "10.0");
    assertParses(10.5f, "10.5");
  }

  @Test
  public void parseNegativeDecimals() {
    assertParses(-0.0f, "-0.0");
    assertParses(-0.5f, "-0.5");
    assertParses(-1.0f, "-1.0");
    assertParses(-1.5f, "-1.5");
    assertParses(-1.05, "-1.05");
    assertParses(-10.0f, "-10.0");
    assertParses(-10.5f, "-10.5");
  }

  @Test
  public void parsePositiveDecimalsWithExponents() {
    assertParses(4e0f, "4e0");
    assertParses(4E0f, "4E0");
    assertParses(4e1f, "4e1");
    assertParses(4E1f, "4E1");
    assertParses(4e2f, "4e2");
    assertParses(4E2f, "4E2");
    assertParses(4e+0f, "4e+0");
    assertParses(4E+0f, "4E+0");
    assertParses(4e-0f, "4e-0");
    assertParses(4E-0f, "4E-0");
    assertParses(4e+1f, "4e+1");
    assertParses(4E+1f, "4E+1");
    assertParses(4e-1, "4e-1");
    assertParses(4E-1, "4E-1");
    assertParses(4e+2f, "4e+2");
    assertParses(4E+2f, "4E+2");
    assertParses(4e-2, "4e-2");
    assertParses(4E-2, "4E-2");
    assertParses(4.0e2f, "4.0e2");
    assertParses(4.0E2f, "4.0E2");
    assertParses(4.0e+2f, "4.0e+2");
    assertParses(4.0E+2f, "4.0E+2");
    assertParses(4.0e-2, "4.0e-2");
    assertParses(4.0E-2, "4.0E-2");
    assertParses(1.17549435e-38, "1.17549435e-38"); // Float.MIN_VALUE
    assertParses(3.4028235e38, "3.4028235e38"); // Float.MAX_VALUE
    assertParses(1.17549435e-38, "1.17549435e-38"); // Float.MIN_NORMAL
    assertParses(4.9e-324, "4.9e-324"); // Double.MIN_VALUE
    assertParses(1.7976931348623157e308, "1.7976931348623157e308"); // Double.MAX_VALUE
    assertParses(2.2250738585072014e-308, "2.2250738585072014e-308"); // Double.MIN_NORMAL
  }

  @Test
  public void parseNegativeDecimalsWithExponents() {
    assertParses(-4e0f, "-4e0");
    assertParses(-4E0f, "-4E0");
    assertParses(-4e1f, "-4e1");
    assertParses(-4E1f, "-4E1");
    assertParses(-4e2f, "-4e2");
    assertParses(-4E2f, "-4E2");
    assertParses(-4e+0f, "-4e+0");
    assertParses(-4E+0f, "-4E+0");
    assertParses(-4e-0f, "-4e-0");
    assertParses(-4E-0f, "-4E-0");
    assertParses(-4e+1f, "-4e+1");
    assertParses(-4E+1f, "-4E+1");
    assertParses(-4e-1, "-4e-1");
    assertParses(-4E-1, "-4E-1");
    assertParses(-4e+2f, "-4e+2");
    assertParses(-4E+2f, "-4E+2");
    assertParses(-4e-2, "-4e-2");
    assertParses(-4E-2, "-4E-2");
    assertParses(-4.0e2f, "-4.0e2");
    assertParses(-4.0E2f, "-4.0E2");
    assertParses(-4.0e+2f, "-4.0e+2");
    assertParses(-4.0E+2f, "-4.0E+2");
    assertParses(-4.0e-2, "-4.0e-2");
    assertParses(-4.0E-2, "-4.0E-2");
    assertParses(-4.0e2f, "-4.0e02");
    assertParses(-4.0E2f, "-4.0E02");
    assertParses(-4.0e+2f, "-4.0e+02");
    assertParses(-4.0E+2f, "-4.0E+02");
    assertParses(-4.0e-2, "-4.0e-02");
    assertParses(-4.0E-2, "-4.0E-02");
  }

  @Test
  public void parseHexadecimals() {
    assertParses(0x0, "0x0");
    assertParses(0x00000001, "0x00000001");
    assertParses(0x00000010, "0x00000010");
    assertParses(0x00000100, "0x00000100");
    assertParses(0x00001000, "0x00001000");
    assertParses(0x00010000, "0x00010000");
    assertParses(0x00100000, "0x00100000");
    assertParses(0x01000000, "0x01000000");
    assertParses(0x10000000, "0x10000000");
    assertParses(0xFFFFFFFFL, "0xFFFFFFFF");
    assertParses(0xFEDCBA98L, "0xFEDCBA98");
    assertParses(0x01234567, "0x01234567");
    assertParses(0x0000000000000001L, "0x0000000000000001");
    assertParses(0x0000000000000010L, "0x0000000000000010");
    assertParses(0x0000000000000100L, "0x0000000000000100");
    assertParses(0x0000000000001000L, "0x0000000000001000");
    assertParses(0x0000000000010000L, "0x0000000000010000");
    assertParses(0x0000000000100000L, "0x0000000000100000");
    assertParses(0x0000000001000000L, "0x0000000001000000");
    assertParses(0x0000000010000000L, "0x0000000010000000");
    assertParses(0x0000000100000000L, "0x0000000100000000");
    assertParses(0x0000001000000000L, "0x0000001000000000");
    assertParses(0x0000010000000000L, "0x0000010000000000");
    assertParses(0x0000100000000000L, "0x0000100000000000");
    assertParses(0x0001000000000000L, "0x0001000000000000");
    assertParses(0x0010000000000000L, "0x0010000000000000");
    assertParses(0x0100000000000000L, "0x0100000000000000");
    assertParses(0x1000000000000000L, "0x1000000000000000");
    assertParses(0xFFFFFFFFFFFFFFFFL, "0xFFFFFFFFFFFFFFFF");
    assertParses(0xFEDCBA9876543210L, "0xFEDCBA9876543210");
    assertParses(0x0123456789ABCDEFL, "0x0123456789ABCDEF");
  }

  @Test
  public void parseBigIntegers() {
    assertParses(new BigInteger("9223372036854775808"), "9223372036854775808");
    assertParses(new BigInteger("-9223372036854775809"), "-9223372036854775809");
    assertParses(new BigInteger("259804429589205426119611"), "259804429589205426119611");
    assertParses(new BigInteger("-259804429589205426119611"), "-259804429589205426119611");
  }

  @Test
  public void parseEmptyStrings() {
    assertParses("",
                 "\"\"");
  }

  @Test
  public void parseNonEmptyStrings() {
    assertParses("test",
                 "\"test\"");
  }

  @Test
  public void parseStringsWithEscapes() {
    assertParses("\"'/<>@\\{}\b\f\n\r\t",
                 "\"\\\"\\'\\/\\<\\>\\@\\\\\\{\\}\\b\\f\\n\\r\\t\"");
  }

  @Test
  public void parseEmptyTextBlocks() {
    assertParses("",
                 "\"\"\"\"\"\"");
  }

  @Test
  public void parseNonEmptyTextBlocks() {
    assertParses("test",
                 "\"\"\"test\"\"\"");
  }

  @Test
  public void parseTextBlocksWithQuotes() {
    assertParses(" \" ",
                 "\"\"\" \" \"\"\"");
    assertParses(" \"\" ",
                 "\"\"\" \"\" \"\"\"");
    assertParses(" \" ",
                 "\"\"\" \\\" \"\"\"");
    assertParses(" \"\" ",
                 "\"\"\" \\\"\\\" \"\"\"");
    assertParses(" \"\"\" ",
                 "\"\"\" \\\"\\\"\\\" \"\"\"");
  }

  @Test
  public void parseTextBlocksWithBackslashes() {
    assertParses(" \\ ",
                 "\"\"\" \\\\ \"\"\"");
    assertParses(" \\\" ",
                 "\"\"\" \\\\\" \"\"\"");
  }

  @Test
  public void parseEmptyBlobs() {
    assertParses(ByteBuffer.allocate(0),
                 "@blob \"\"");
  }

  @Test
  public void parseNonEmptyBlobs() {
    assertParses(ByteBuffer.allocate(3),
                 "@blob \"AAAA\"");
    assertParses(ByteBuffer.allocate(2),
                 "@blob \"AAA=\"");
    assertParses(ByteBuffer.allocate(1),
                 "@blob \"AA==\"");
    assertParses(ByteBuffer.wrap(new byte[] {(byte) 0x00, (byte) 0x10, (byte) 0x83, (byte) 0x69, (byte) 0xB7, (byte) 0x1D, (byte) 0xD7, (byte) 0x6F, (byte) 0xFE}),
                 "@blob \"ABCDabcd12/+\"");
  }

  @Test
  public void parseEmptyLists() {
    assertParses(List.of(),
                 "[]");
  }

  @Test
  public void parseNonEmptyLists() {
    assertParses(List.of(Map.of(), List.of(), "", 0, true, false),
                 "[{},[],\"\",0,true,false]");
  }

  @Test
  public void parseNestedLists() {
    assertParses(List.of(List.of(1, 2), List.of(3, 4)),
                 "[[1,2],[3,4]]");
  }

  @Test
  public void parseEmptyMarkup() {
    assertParses(List.of(),
                 "<<>>");
  }

  @Test
  public void parseNonEmptyMarkup() {
    assertParses(List.of("test"),
                 "<<test>>");
  }

  @Test
  public void parsNestedMarkup() {
    assertParses(List.of("Hello, ", List.of("world"), "!"),
                 "<<Hello, <<world>>!>>");
  }

  @Test
  public void parseEmptyMaps() {
    assertParses(Map.of(),
                 "{}");
  }

  @Test
  public void parseNonEmptyMaps() {
    assertParses(Map.of("a", 1, "b", true),
                 "{a:1,b:true}");
  }

  @Test
  public void parseNestedMaps() {
    assertParses(Map.of("a", Map.of("b", 1, "c", 2), "d", Map.of("e", 3, "f", 4)),
                 "{a:{b:1,c:2},d:{e:3,f:4}}");
  }

  public enum TestEnum {
    ONE,
    @WamlTag("two")
    TWO,
    @WamlTag("three")
    THREE,
    FOUR;
  }

  @Test
  public void parseEnums() {
    assertParses(TestEnum.class,
                 TestEnum.ONE,
                 "\"ONE\"");
    assertParses(TestEnum.class,
                 TestEnum.TWO,
                 "\"two\"");
    assertParses(TestEnum.class,
                 TestEnum.THREE,
                 "\"three\"");
    assertParses(TestEnum.class,
                 TestEnum.FOUR,
                 "\"FOUR\"");
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
      if (other instanceof TestObject) {
        final TestObject that = (TestObject) other;
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
  public void parseReflectedObjects() {
    assertParses(TestObject.class,
                 new TestObject(3L, "foo"),
                 "{a: 3, b: \"foo\"}");
  }

  @WamlUnion({TestPoint2.class, TestPoint3.class})
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
      if (other instanceof TestPoint2) {
        final TestPoint2 that = (TestPoint2) other;
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

  @WamlTag("Point3")
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
      if (other instanceof TestPoint3) {
        final TestPoint3 that = (TestPoint3) other;
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
  public void parseMonomorphicTypes() {
    assertParses(TestPoint2.class,
                 new TestPoint2(-2.0, 3.0),
                 "{x: -2, y: 3}");
    assertParses(TestPoint3.class,
                 new TestPoint3(2.0, -3.0, 5.0),
                 "{x: 2, y: -3, z: 5}");
  }

  @Test
  public void parsePolymorphicTypes() {
    assertParses(TestPoint.class,
                 new TestPoint2(-2.0, 3.0),
                 "@TestPoint2 {x: -2, y: 3}");
    assertParses(TestPoint.class,
                 new TestPoint3(2.0, -3.0, 5.0),
                 "@Point3 {x: 2, y: -3, z: 5}");
  }

  public static <T> void assertParses(WamlForm<T> valueForm, T expected, String waml) {
    WamlAssertions.assertParses(valueForm.parse(Waml.parser(WamlParserOptions.standard())), expected, waml);
  }

  public static void assertParses(Class<?> valueClass, @Nullable Object expected, String waml) {
    WamlAssertions.assertParses(Waml.parse(valueClass, WamlParserOptions.standard()), expected, waml);
  }

  public static void assertParses(@Nullable Object expected, String waml) {
    WamlAssertions.assertParses(Waml.parse(Object.class, WamlParserOptions.standard()), expected, waml);
  }

  public static void assertParseFails(WamlForm<?> valueForm, final String waml) {
    assertThrows(ParseException.class, () -> {
      valueForm.parse(waml, Waml.parser(WamlParserOptions.standard())).checkDone();
    });
  }

}
