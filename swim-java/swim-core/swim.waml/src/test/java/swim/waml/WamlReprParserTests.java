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
import org.junit.jupiter.api.Test;
import swim.codec.ParseException;
import swim.repr.ArrayRepr;
import swim.repr.BlobRepr;
import swim.repr.BooleanRepr;
import swim.repr.NumberRepr;
import swim.repr.ObjectRepr;
import swim.repr.Repr;
import swim.repr.StringRepr;
import swim.repr.TupleRepr;
import static org.junit.jupiter.api.Assertions.assertThrows;

public class WamlReprParserTests {

  @Test
  public void parseUnit() {
    assertParses(Repr.unit(), "()");
  }

  @Test
  public void parseBooleans() {
    assertParses(BooleanRepr.of(true), "true");
    assertParses(BooleanRepr.of(false), "false");
  }

  @Test
  public void parsePositiveIntegers() {
    assertParses(NumberRepr.of(0), "0");
    assertParses(NumberRepr.of(1), "1");
    assertParses(NumberRepr.of(5), "5");
    assertParses(NumberRepr.of(10), "10");
    assertParses(NumberRepr.of(11), "11");
    assertParses(NumberRepr.of(15), "15");
    assertParses(NumberRepr.of(2147483647), "2147483647");
    assertParses(NumberRepr.of(9223372036854775807L), "9223372036854775807");
  }

  @Test
  public void parseNegativeIntegers() {
    assertParses(NumberRepr.of(-0), "-0");
    assertParses(NumberRepr.of(-1), "-1");
    assertParses(NumberRepr.of(-5), "-5");
    assertParses(NumberRepr.of(-10), "-10");
    assertParses(NumberRepr.of(-11), "-11");
    assertParses(NumberRepr.of(-15), "-15");
    assertParses(NumberRepr.of(-2147483648), "-2147483648");
    assertParses(NumberRepr.of(-9223372036854775808L), "-9223372036854775808");
  }

  @Test
  public void parsePositiveDecimals() {
    assertParses(NumberRepr.of(0.0), "0.0");
    assertParses(NumberRepr.of(0.5), "0.5");
    assertParses(NumberRepr.of(1.0), "1.0");
    assertParses(NumberRepr.of(1.5), "1.5");
    assertParses(NumberRepr.of(1.05), "1.05");
    assertParses(NumberRepr.of(10.0), "10.0");
    assertParses(NumberRepr.of(10.5), "10.5");
  }

  @Test
  public void parseNegativeDecimals() {
    assertParses(NumberRepr.of(-0.0), "-0.0");
    assertParses(NumberRepr.of(-0.5), "-0.5");
    assertParses(NumberRepr.of(-1.0), "-1.0");
    assertParses(NumberRepr.of(-1.5), "-1.5");
    assertParses(NumberRepr.of(-1.05), "-1.05");
    assertParses(NumberRepr.of(-10.0), "-10.0");
    assertParses(NumberRepr.of(-10.5), "-10.5");
  }

  @Test
  public void parsePositiveDecimalsWithExponents() {
    assertParses(NumberRepr.of(4e0), "4e0");
    assertParses(NumberRepr.of(4E0), "4E0");
    assertParses(NumberRepr.of(4e1), "4e1");
    assertParses(NumberRepr.of(4E1), "4E1");
    assertParses(NumberRepr.of(4e2), "4e2");
    assertParses(NumberRepr.of(4E2), "4E2");
    assertParses(NumberRepr.of(4e+0), "4e+0");
    assertParses(NumberRepr.of(4E+0), "4E+0");
    assertParses(NumberRepr.of(4e-0), "4e-0");
    assertParses(NumberRepr.of(4E-0), "4E-0");
    assertParses(NumberRepr.of(4e+1), "4e+1");
    assertParses(NumberRepr.of(4E+1), "4E+1");
    assertParses(NumberRepr.of(4e-1), "4e-1");
    assertParses(NumberRepr.of(4E-1), "4E-1");
    assertParses(NumberRepr.of(4e+2), "4e+2");
    assertParses(NumberRepr.of(4E+2), "4E+2");
    assertParses(NumberRepr.of(4e-2), "4e-2");
    assertParses(NumberRepr.of(4E-2), "4E-2");
    assertParses(NumberRepr.of(4.0e2), "4.0e2");
    assertParses(NumberRepr.of(4.0E2), "4.0E2");
    assertParses(NumberRepr.of(4.0e+2), "4.0e+2");
    assertParses(NumberRepr.of(4.0E+2), "4.0E+2");
    assertParses(NumberRepr.of(4.0e-2), "4.0e-2");
    assertParses(NumberRepr.of(4.0E-2), "4.0E-2");
    assertParses(NumberRepr.of(1.17549435e-38), "1.17549435e-38"); // Float.MIN_VALUE
    assertParses(NumberRepr.of(3.4028235e38), "3.4028235e38"); // Float.MAX_VALUE
    assertParses(NumberRepr.of(1.17549435e-38), "1.17549435e-38"); // Float.MIN_NORMAL
    assertParses(NumberRepr.of(4.9e-324), "4.9e-324"); // Double.MIN_VALUE
    assertParses(NumberRepr.of(1.7976931348623157e308), "1.7976931348623157e308"); // Double.MAX_VALUE
    assertParses(NumberRepr.of(2.2250738585072014e-308), "2.2250738585072014e-308"); // Double.MIN_NORMAL
  }

  @Test
  public void parseNegativeDecimalsWithExponents() {
    assertParses(NumberRepr.of(-4e0), "-4e0");
    assertParses(NumberRepr.of(-4E0), "-4E0");
    assertParses(NumberRepr.of(-4e1), "-4e1");
    assertParses(NumberRepr.of(-4E1), "-4E1");
    assertParses(NumberRepr.of(-4e2), "-4e2");
    assertParses(NumberRepr.of(-4E2), "-4E2");
    assertParses(NumberRepr.of(-4e+0), "-4e+0");
    assertParses(NumberRepr.of(-4E+0), "-4E+0");
    assertParses(NumberRepr.of(-4e-0), "-4e-0");
    assertParses(NumberRepr.of(-4E-0), "-4E-0");
    assertParses(NumberRepr.of(-4e+1), "-4e+1");
    assertParses(NumberRepr.of(-4E+1), "-4E+1");
    assertParses(NumberRepr.of(-4e-1), "-4e-1");
    assertParses(NumberRepr.of(-4E-1), "-4E-1");
    assertParses(NumberRepr.of(-4e+2), "-4e+2");
    assertParses(NumberRepr.of(-4E+2), "-4E+2");
    assertParses(NumberRepr.of(-4e-2), "-4e-2");
    assertParses(NumberRepr.of(-4E-2), "-4E-2");
    assertParses(NumberRepr.of(-4.0e2), "-4.0e2");
    assertParses(NumberRepr.of(-4.0E2), "-4.0E2");
    assertParses(NumberRepr.of(-4.0e+2), "-4.0e+2");
    assertParses(NumberRepr.of(-4.0E+2), "-4.0E+2");
    assertParses(NumberRepr.of(-4.0e-2), "-4.0e-2");
    assertParses(NumberRepr.of(-4.0E-2), "-4.0E-2");
    assertParses(NumberRepr.of(-4.0e2), "-4.0e02");
    assertParses(NumberRepr.of(-4.0E2), "-4.0E02");
    assertParses(NumberRepr.of(-4.0e+2), "-4.0e+02");
    assertParses(NumberRepr.of(-4.0E+2), "-4.0E+02");
    assertParses(NumberRepr.of(-4.0e-2), "-4.0e-02");
    assertParses(NumberRepr.of(-4.0E-2), "-4.0E-02");
  }

  @Test
  public void parseHexadecimals() {
    assertParses(NumberRepr.of(0x0), "0x0");
    assertParses(NumberRepr.of(0x00000001), "0x00000001");
    assertParses(NumberRepr.of(0x00000010), "0x00000010");
    assertParses(NumberRepr.of(0x00000100), "0x00000100");
    assertParses(NumberRepr.of(0x00001000), "0x00001000");
    assertParses(NumberRepr.of(0x00010000), "0x00010000");
    assertParses(NumberRepr.of(0x00100000), "0x00100000");
    assertParses(NumberRepr.of(0x01000000), "0x01000000");
    assertParses(NumberRepr.of(0x10000000), "0x10000000");
    assertParses(NumberRepr.of(0xFFFFFFFFL), "0xFFFFFFFF");
    assertParses(NumberRepr.of(0xFEDCBA98L), "0xFEDCBA98");
    assertParses(NumberRepr.of(0x01234567), "0x01234567");
    assertParses(NumberRepr.of(0x0000000000000001L), "0x0000000000000001");
    assertParses(NumberRepr.of(0x0000000000000010L), "0x0000000000000010");
    assertParses(NumberRepr.of(0x0000000000000100L), "0x0000000000000100");
    assertParses(NumberRepr.of(0x0000000000001000L), "0x0000000000001000");
    assertParses(NumberRepr.of(0x0000000000010000L), "0x0000000000010000");
    assertParses(NumberRepr.of(0x0000000000100000L), "0x0000000000100000");
    assertParses(NumberRepr.of(0x0000000001000000L), "0x0000000001000000");
    assertParses(NumberRepr.of(0x0000000010000000L), "0x0000000010000000");
    assertParses(NumberRepr.of(0x0000000100000000L), "0x0000000100000000");
    assertParses(NumberRepr.of(0x0000001000000000L), "0x0000001000000000");
    assertParses(NumberRepr.of(0x0000010000000000L), "0x0000010000000000");
    assertParses(NumberRepr.of(0x0000100000000000L), "0x0000100000000000");
    assertParses(NumberRepr.of(0x0001000000000000L), "0x0001000000000000");
    assertParses(NumberRepr.of(0x0010000000000000L), "0x0010000000000000");
    assertParses(NumberRepr.of(0x0100000000000000L), "0x0100000000000000");
    assertParses(NumberRepr.of(0x1000000000000000L), "0x1000000000000000");
    assertParses(NumberRepr.of(0xFFFFFFFFFFFFFFFFL), "0xFFFFFFFFFFFFFFFF");
    assertParses(NumberRepr.of(0xFEDCBA9876543210L), "0xFEDCBA9876543210");
    assertParses(NumberRepr.of(0x0123456789ABCDEFL), "0x0123456789ABCDEF");
  }

  @Test
  public void parseBigIntegers() {
    assertParses(NumberRepr.of(new BigInteger("9223372036854775808")), "9223372036854775808");
    assertParses(NumberRepr.of(new BigInteger("-9223372036854775809")), "-9223372036854775809");
    assertParses(NumberRepr.of(new BigInteger("259804429589205426119611")), "259804429589205426119611");
    assertParses(NumberRepr.of(new BigInteger("-259804429589205426119611")), "-259804429589205426119611");
  }

  @Test
  public void parseEmptyStrings() {
    assertParses(StringRepr.empty(),
                 "\"\"");
  }

  @Test
  public void parseNonEmptyStrings() {
    assertParses(StringRepr.of("test"),
                 "\"test\"");
  }

  @Test
  public void parseStringsWithEscapes() {
    assertParses(StringRepr.of("\"'/<>@\\{}\b\f\n\r\t"),
                 "\"\\\"\\'\\/\\<\\>\\@\\\\\\{\\}\\b\\f\\n\\r\\t\"");
  }

  @Test
  public void parseEmptyTextBlocks() {
    assertParses(StringRepr.empty(),
                 "\"\"\"\"\"\"");
  }

  @Test
  public void parseNonEmptyTextBlocks() {
    assertParses(StringRepr.of("test"),
                 "\"\"\"test\"\"\"");
  }

  @Test
  public void parseTextBlocksWithQuotes() {
    assertParses(StringRepr.of(" \" "),
                 "\"\"\" \" \"\"\"");
    assertParses(StringRepr.of(" \"\" "),
                 "\"\"\" \"\" \"\"\"");
    assertParses(StringRepr.of(" \" "),
                 "\"\"\" \\\" \"\"\"");
    assertParses(StringRepr.of(" \"\" "),
                 "\"\"\" \\\"\\\" \"\"\"");
    assertParses(StringRepr.of(" \"\"\" "),
                 "\"\"\" \\\"\\\"\\\" \"\"\"");
  }

  @Test
  public void parseTextBlocksWithBackslashes() {
    assertParses(StringRepr.of(" \\ "),
                 "\"\"\" \\\\ \"\"\"");
    assertParses(StringRepr.of(" \\\" "),
                 "\"\"\" \\\\\" \"\"\"");
  }

  @Test
  public void parseEmptyBlobs() {
    assertParses(BlobRepr.empty(),
                 "@blob \"\"");
  }

  @Test
  public void parseNonEmptyBlobs() {
    assertParses(BlobRepr.fromBase64("AAAA"),
                 "@blob \"AAAA\"");
    assertParses(BlobRepr.fromBase64("AAA="),
                 "@blob \"AAA=\"");
    assertParses(BlobRepr.fromBase64("AA=="),
                 "@blob \"AA==\"");
    assertParses(BlobRepr.fromBase64("ABCDabcd12/+"),
                 "@blob \"ABCDabcd12/+\"");
  }

  @Test
  public void parseEmptyArrays() {
    assertParses(ArrayRepr.empty(),
                 "[]");
  }

  @Test
  public void parseNonEmptyArrays() {
    assertParses(ArrayRepr.of(1, 2, "3", true),
                 "[1,2,\"3\",true]");
  }

  @Test
  public void parseNestedArrays() {
    assertParses(ArrayRepr.of(ArrayRepr.of(1, 2), ArrayRepr.of(3, 4)),
                 "[[1,2],[3,4]]");
  }

  @Test
  public void parseArraysWithComments() {
    assertParses(ArrayRepr.empty(),
                 "[#comment\n]");
    assertParses(ArrayRepr.empty(),
                 "[#comment\n#comment\n]");
  }

  @Test
  public void parseEmptyMarkup() {
    assertParses(ArrayRepr.empty(),
                 "<<>>");
  }

  @Test
  public void parseNonEmptyMarkup() {
    assertParses(ArrayRepr.of("test"),
                 "<<test>>");
  }

  @Test
  public void parseNestedMarkup() {
    assertParses(ArrayRepr.of("Hello, ", ArrayRepr.of("world"), "!"),
                 "<<Hello, <<world>>!>>");
  }

  @Test
  public void parseEmptyObjects() {
    assertParses(ObjectRepr.empty(),
                 "{}");
  }

  @Test
  public void parseNonEmptyObjects() {
    assertParses(ObjectRepr.of("a", 1, "b", true),
                 "{a:1,b:true}");
  }

  @Test
  public void parseNestedObjects() {
    assertParses(ObjectRepr.of("a", ObjectRepr.of("b", 1, "c", 2), "d", ObjectRepr.of("e", 3, "f", 4)),
                 "{a:{b:1,c:2},d:{e:3,f:4}}");
  }

  @Test
  public void parseObjectsWithComments() {
    assertParses(ObjectRepr.empty(),
                 "{#comment\n}");
    assertParses(ObjectRepr.empty(),
                 "{#comment\n#comment\n}");
  }

  @Test
  public void parseUnaryArraysWithTrailingCommas() {
    assertParses(ArrayRepr.of(1),
                 "[1,]");
  }

  @Test
  public void parseCommaSeparateArrays() {
    assertParses(ArrayRepr.of(1, 2, 3, 4),
                 "[ 1, 2,3 ,4 ]");
  }

  @Test
  public void parseCommaSeparateArraysWithTrailingCommas() {
    assertParses(ArrayRepr.of(1, 2, 3, 4),
                 "[  1, 2,3 ,4, ]");
  }

  @Test
  public void parseNewlineSeparatedArrays() {
    assertParses(ArrayRepr.of(1, 2, 3, 4),
                 "[\n1\n 2\n3 \n4  ]");
  }

  @Test
  public void parseNewlineSeparatedArraysWithTrailingNewlines() {
    assertParses(ArrayRepr.of(1, 2, 3, 4),
                 "[ \n 1\n 2\n3 \n4\n ]");
  }

  @Test
  public void parseArraysWithMixedSeparators() {
    assertParses(ArrayRepr.of(1, 2, 3, 4),
                 "[1, 2\n3 ,\n 4  ]");
  }

  @Test
  public void parseCommaNewlineSeparatedArrays() {
    assertParses(ArrayRepr.of(1, 2, 3),
                 "[\n 1,\n 2,\n3 \n]");
  }

  @Test
  public void parseHeterogeneousObjects() {
    assertParses(ObjectRepr.of("unit", null, "object", ObjectRepr.empty(), "array", ArrayRepr.empty(), "markup", ArrayRepr.empty(), "blob", BlobRepr.fromBase64("AA=="),
                               "integer", 0, "decimal", 0.0, "t", true, "f", false),
                 "{\n  unit: ()\n  object: {}\n  array: []\n  markup: <<>>\n  blob:  @blob \"AA==\"\n  integer: 0\n  decimal: 0.0\n  t: true\n  f:false\n}");
  }

  @Test
  public void parseLeadingCommentsInArrays() {
    assertParses(ArrayRepr.of(1, 2),
                 "[#comment\n1\n#comment\n2]");
  }

  @Test
  public void parseLeadingCommentsInObjects() {
    assertParses(ObjectRepr.of("a", 1, "b", 2),
                 "{#comment\na:1\n#comment\nb:2}");
  }

  @Test
  public void parseTrailingCommentsInArrays() {
    assertParses(ArrayRepr.of(1, 2),
                 "[1#comment\n2#comment\n]");
  }

  @Test
  public void parseTrailingCommentsInObjects() {
    assertParses(ObjectRepr.of("a", 1, "b", 2),
                 "{a:1#comment\nb:2#comment\n}");
  }

  @Test
  public void parseSingleUnitAttributesWithNoParameters() {
    assertParses(Repr.unit().withAttr("test"),
                 "@test");
  }

  @Test
  public void parseSingleAttributesWithEmptyParameters() {
    assertParses(Repr.unit().withAttr("test"),
                 "@test()");
  }

  @Test
  public void parseQuotedAttributeNames() {
    assertParses(Repr.unit().withAttr("test"),
                 "@\"test\"");
    assertParses(Repr.unit().withAttr("test"),
                 "@\"test\"()");
    assertParses(Repr.unit().withAttr("@at"),
                 "@\"@at\"");
    assertParses(Repr.unit().withAttr("@at"),
                 "@\"@at\"()");
  }

  @Test
  public void parseSingleAttributesWithSingleParameters() {
    assertParses(Repr.unit().withAttr("hello"),
                 "@hello()");
    assertParses(Repr.unit().withAttr("hello", StringRepr.of("world")),
                 "@hello(\"world\")");
    assertParses(Repr.unit().withAttr("hello", NumberRepr.of(42)),
                 "@hello(42)");
    assertParses(Repr.unit().withAttr("hello", ArrayRepr.of("world")),
                 "@hello(<<world>>)");
  }

  @Test
  public void parseSingleAttributesWithMultipleParameters() {
    assertParses(Repr.unit().withAttr("hello", TupleRepr.of(null, "world", null, BlobRepr.fromBase64("AA=="), null, 42, null, true)),
                 "@hello(\"world\", @blob \"AA==\", 42, true)");
    assertParses(Repr.unit().withAttr("hello", TupleRepr.of(null, "world", null, BlobRepr.fromBase64("AA=="), null, 42, null, true)),
                 "@hello(\"world\"\n@blob \"AA==\"\n42\ntrue)");
  }

  @Test
  public void parseSingleAttributesWithNamedParameters() {
    assertParses(Repr.unit().withAttr("hello", TupleRepr.of("name", "world")),
                 "@hello(name: \"world\")");
    assertParses(Repr.unit().withAttr("hello", TupleRepr.of("name", "world", "blob", BlobRepr.fromBase64("AA=="), "number", 42, null, false)),
                 "@hello(name: \"world\", blob: @blob \"AA==\", number: 42, false)");
  }

  @Test
  public void parseMultipleAttributesWithNoParameters() {
    assertParses(Repr.unit().withAttr("a").withAttr("b"),
                 "@a@b");
    assertParses(Repr.unit().withAttr("a").withAttr("b"),
                 "@a @b");
  }

  @Test
  public void parseMultipleAttributesWithEmptyParameters() {
    assertParses(Repr.unit().withAttr("a").withAttr("b"),
                 "@a()@b()");
    assertParses(Repr.unit().withAttr("a").withAttr("b"),
                 "@a() @b()");
  }

  @Test
  public void parseMultipleAttributesWithSingleParameters() {
    assertParses(Repr.unit().withAttr("a", ObjectRepr.empty()).withAttr("b", ArrayRepr.empty()),
                 "@a({})@b(<<>>)");
    assertParses(Repr.unit().withAttr("a", StringRepr.of("test")).withAttr("b", NumberRepr.of(42)),
                 "@a(\"test\") @b(42)");
    assertParses(Repr.unit().withAttr("a", BooleanRepr.of(true)).withAttr("b", BooleanRepr.of(false)),
                 "@a(true) @b(false)");
  }

  @Test
  public void parseMultipleAttributesWithComplexParameters() {
    assertParses(Repr.unit().withAttr("hello", TupleRepr.of(null, "world", null, 42)).withAttr("test", TupleRepr.of("name", "parse", "pending", false)),
                 "@hello(\"world\", 42) @test(name: \"parse\", pending: false)");
  }

  @Test
  public void parseAttributedBooleans() {
    assertParses(BooleanRepr.of(true).withAttr("hello"),
                 "@hello true");
    assertParses(BooleanRepr.of(false).withAttr("hello"),
                 "@hello() false");
    assertParses(BooleanRepr.of(true).withAttr("hello", StringRepr.of("world")),
                 "@hello(\"world\") true");
    assertParses(BooleanRepr.of(false).withAttr("hello", TupleRepr.of("name", "world")),
                 "@hello(name: \"world\") false");
  }

  @Test
  public void parseAttributedNumbers() {
    assertParses(NumberRepr.of(42).withAttr("hello"),
                 "@hello 42");
    assertParses(NumberRepr.of(-42).withAttr("hello"),
                 "@hello() -42");
    assertParses(NumberRepr.of(42.0).withAttr("hello", StringRepr.of("world")),
                 "@hello(\"world\") 42.0");
    assertParses(NumberRepr.of(-42.0).withAttr("hello", TupleRepr.of("name", "world")),
                 "@hello(name: \"world\") -42.0");
  }

  @Test
  public void parseAttributedStrings() {
    assertParses(StringRepr.empty().withAttr("hello"),
                 "@hello \"\"");
    assertParses(StringRepr.empty().withAttr("hello"),
                 "@hello() \"\"");
    assertParses(StringRepr.empty().withAttr("hello", StringRepr.of("world")),
                 "@hello(\"world\") \"\"");
    assertParses(StringRepr.empty().withAttr("hello", TupleRepr.of("name", "world")),
                 "@hello(name: \"world\") \"\"");
  }

  @Test
  public void parseAttributedBlobs() {
    assertParses(BlobRepr.empty().withAttr("hello"),
                 "@hello @blob \"\"");
    assertParses(BlobRepr.empty().withAttr("hello"),
                 "@hello() @blob() \"\"");
    assertParses(BlobRepr.empty().withAttr("hello", StringRepr.of("world")),
                 "@hello(\"world\") @blob \"\"");
    assertParses(BlobRepr.empty().withAttr("hello", TupleRepr.of("name", "world")),
                 "@hello(name: \"world\") @blob \"\"");
  }

  @Test
  public void parseAttributedArrays() {
    assertParses(ArrayRepr.of().withAttr("hello"),
                 "@hello []");
    assertParses(ArrayRepr.of().withAttr("hello"),
                 "@hello() []");
    assertParses(ArrayRepr.of().withAttr("hello", StringRepr.of("world")),
                 "@hello(\"world\") []");
    assertParses(ArrayRepr.of().withAttr("hello", TupleRepr.of("name", "world")),
                 "@hello(name: \"world\") []");
  }

  @Test
  public void parseAttributedMarkup() {
    assertParses(ArrayRepr.of().withAttr("hello"),
                 "@hello <<>>");
    assertParses(ArrayRepr.of().withAttr("hello"),
                 "@hello() <<>>");
    assertParses(ArrayRepr.of().withAttr("hello", StringRepr.of("world")),
                 "@hello(\"world\") <<>>");
    assertParses(ArrayRepr.of().withAttr("hello", TupleRepr.of("name", "world")),
                 "@hello(name: \"world\") <<>>");
  }

  @Test
  public void parseAttributedObjects() {
    assertParses(ObjectRepr.of().withAttr("hello"),
                 "@hello {}");
    assertParses(ObjectRepr.of().withAttr("hello"),
                 "@hello() {}");
    assertParses(ObjectRepr.of().withAttr("hello", StringRepr.of("world")),
                 "@hello(\"world\") {}");
    assertParses(ObjectRepr.of().withAttr("hello", TupleRepr.of("name", "world")),
                 "@hello(name: \"world\") {}");
  }

  @Test
  public void parseMarkupWithUnescapedAngleBrackets() {
    assertParses(ArrayRepr.of("<"),
                 "<<<>>");
    assertParses(ArrayRepr.of("< "),
                 "<<< >>");
    assertParses(ArrayRepr.of("> "),
                 "<<> >>");
    assertParses(ArrayRepr.of(" < "),
                 "<< < >>");
    assertParses(ArrayRepr.of(" > "),
                 "<< > >>");
    assertParses(ArrayRepr.of("><"),
                 "<<><>>");
    assertParses(ArrayRepr.of(" <> "),
                 "<< <> >>");
    assertParses(ArrayRepr.of(" >< "),
                 "<< >< >>");
    assertParses(ArrayRepr.of(" < > "),
                 "<< < > >>");
    assertParses(ArrayRepr.of(" > < "),
                 "<< > < >>");
    assertParses(ArrayRepr.of(" <p></p> "),
                 "<< <p></p> >>");
  }

  @Test
  public void parseMarkupWithEscapes() {
    assertParses(ArrayRepr.of("\"'/<>@\\{}\b\f\n\r\t"),
                 "<<\\\"\\'\\/\\<\\>\\@\\\\\\{\\}\\b\\f\\n\\r\\t>>");
  }

  @Test
  public void parseMarkupWithEmbeddedNodes() {
    assertParses(ArrayRepr.of("Hello", Repr.unit(), "world!"),
                 "<<Hello{()}world!>>");
    assertParses(ArrayRepr.of("A: ", "answer", "."),
                 "<<A: {\"answer\"}.>>");
    assertParses(ArrayRepr.of("A: ", BlobRepr.fromBase64("AA=="), "."),
                 "<<A: {@blob\"AA==\"}.>>");
    assertParses(ArrayRepr.of("A: ", 42, "."),
                 "<<A: {42}.>>");
    assertParses(ArrayRepr.of("A: ", true, "."),
                 "<<A: {true}.>>");
    assertParses(ArrayRepr.of("A: ", false, "."),
                 "<<A: {false}.>>");
    assertParses(ArrayRepr.of("A: ", ObjectRepr.of("answer", 0.0), "."),
                 "<<A: {{answer:0.0}}.>>");
  }

  @Test
  public void parseMarkupWithEmbeddedSingleAttributes() {
    assertParses(ArrayRepr.of("A: ", Repr.unit().withAttr("answer"), "."),
                 "<<A: @answer.>>");
    assertParses(ArrayRepr.of("A: ", Repr.unit().withAttr("answer"), "."),
                 "<<A: @answer().>>");
    assertParses(ArrayRepr.of("A: ", Repr.unit().withAttr("answer", StringRepr.of("secret")), "."),
                 "<<A: @answer(\"secret\").>>");
    assertParses(ArrayRepr.of("A: ", Repr.unit().withAttr("answer", TupleRepr.of("number", 42, null, true)), "."),
                 "<<A: @answer(number: 42, true).>>");
  }

  @Test
  public void parseMarkupWithEmbeddedSequentialAttributes() {
    assertParses(ArrayRepr.of("A: ", Repr.unit().withAttr("good"), " ", Repr.unit().withAttr("answer"), "."),
                 "<<A: @good @answer.>>");
    assertParses(ArrayRepr.of("A: ", Repr.unit().withAttr("good"), Repr.unit().withAttr("answer"), "."),
                 "<<A: @good@answer.>>");
    assertParses(ArrayRepr.of("A: ", Repr.unit().withAttr("good"), " ", Repr.unit().withAttr("answer"), "."),
                 "<<A: @good() @answer().>>");
    assertParses(ArrayRepr.of("A: ", Repr.unit().withAttr("good"), Repr.unit().withAttr("answer"), "."),
                 "<<A: @good()@answer().>>");
  }

  @Test
  public void parseMarkupWithEmbeddedAttributedMarkup() {
    assertParses(ArrayRepr.of("Hello, ", ArrayRepr.of("world").withAttr("em"), "!"),
                 "<<Hello, @em<<world>>!>>");
    assertParses(ArrayRepr.of("Hello, ", ArrayRepr.of("world").withAttr("em"), "!"),
                 "<<Hello, @em()<<world>>!>>");
    assertParses(ArrayRepr.of("Hello, ", ArrayRepr.of("world").withAttr("em", StringRepr.of("italic")), "!"),
                 "<<Hello, @em(\"italic\")<<world>>!>>");
    assertParses(ArrayRepr.of("Hello, ", ArrayRepr.of("world").withAttr("em", TupleRepr.of("class", "subject", "style", "italic")), "!"),
                 "<<Hello, @em(class:\"subject\",style:\"italic\")<<world>>!>>");
  }

  @Test
  public void parseMarkupWithEmbeddedAttributeArrays() {
    assertParses(ArrayRepr.of("Hello, ", ArrayRepr.of("world").withAttr("em"), "!"),
                 "<<Hello, @em[\"world\"]!>>");
    assertParses(ArrayRepr.of("Hello, ", ArrayRepr.of("world").withAttr("em"), "!"),
                 "<<Hello, @em()[\"world\"]!>>");
    assertParses(ArrayRepr.of("Hello, ", ArrayRepr.of("world").withAttr("em", StringRepr.of("italic")), "!"),
                 "<<Hello, @em(\"italic\")[\"world\"]!>>");
    assertParses(ArrayRepr.of("Hello, ", ArrayRepr.of("world").withAttr("em", TupleRepr.of("class", "subject", "style", "italic")), "!"),
                 "<<Hello, @em(class:\"subject\",style:\"italic\")[\"world\"]!>>");
  }

  @Test
  public void parseMarkupWithEmbeddedAttributedValues() {
    assertParses(ArrayRepr.of("A: ", NumberRepr.of(42).withAttr("answer"), "."),
                 "<<A: {@answer 42}.>>");
    assertParses(ArrayRepr.of("A: ", NumberRepr.of(42).withAttr("answer"), "."),
                 "<<A: {@answer() 42}.>>");
    assertParses(ArrayRepr.of("A: ", NumberRepr.of(42).withAttr("answer", StringRepr.of("secret")), "."),
                 "<<A: {@answer(\"secret\") 42}.>>");
    assertParses(ArrayRepr.of("A: ", BooleanRepr.of(true).withAttr("answer", TupleRepr.of("number", 42, null,
                 "secret")), "."), "<<A: {@answer(number: 42, \"secret\") true}.>>");
  }

  @Test
  public void parseLeadingArrayCommaFails() {
    assertParseFails("[,]");
  }

  @Test
  public void parseLeadingObjectCommaFails() {
    assertParseFails("{,}");
  }

  @Test
  public void parseNakedNegativesFails() {
    assertParseFails("-");
  }

  @Test
  public void parseTrailingDecimalsFails() {
    assertParseFails("1.");
  }

  @Test
  public void parseTrailingExponentsFails() {
    assertParseFails("1e");
    assertParseFails("1E");
    assertParseFails("1.e");
    assertParseFails("1.E");
    assertParseFails("1.0e");
    assertParseFails("1.0E");
    assertParseFails("1.0e+");
    assertParseFails("1.0E+");
    assertParseFails("1.0e-");
    assertParseFails("1.0E-");
  }

  @Test
  public void parseUnclosedEmptyStringsFails() {
    assertParseFails("\"");
  }

  @Test
  public void parseUnclosedNonEmptyStringsFails() {
    assertParseFails("\"test");
    assertParseFails("\"test\\");
  }

  @Test
  public void parseUnpaddedBlobsFails() {
    assertParseFails("@blob \"AAA\"");
    assertParseFails("@blob \"AA\"");
    assertParseFails("@blob \"A\"");
  }

  @Test
  public void parseMalformedBlobsFails() {
    assertParseFails("@blob \"AA=A\"");
  }

  @Test
  public void parseUnclosedEmptyArraysFails() {
    assertParseFails("[");
    assertParseFails("[#comment");
  }

  @Test
  public void parseUnclosedNonEmptyArraysFails() {
    assertParseFails("[1");
    assertParseFails("[1 ");
    assertParseFails("[1,");
    assertParseFails("[1#comment");
  }

  @Test
  public void parseUnclosedEmptyObjectsFails() {
    assertParseFails("{");
    assertParseFails("{#comment");
  }

  @Test
  public void parseUnclosedNonEmptyObjectsFails() {
    assertParseFails("{a:1");
    assertParseFails("{a:1 ");
    assertParseFails("{a:1,");
    assertParseFails("{a:1#comment");
  }

  @Test
  public void parseUnclosedEmptyMarkupFails() {
    assertParseFails("<<");
  }

  @Test
  public void parseUnclosedNonEmptyMarkupFails() {
    assertParseFails("<<test");
    assertParseFails("<<test{}");
  }

  @Test
  public void parseKeylessAttrsFails() {
    assertParseFails("@");
    assertParseFails("@()");
  }

  @Test
  public void parsePostfixAttrsFails() {
    assertParseFails("()@foo");
    assertParseFails("() @foo");
    assertParseFails("42@foo");
    assertParseFails("42 @foo");
    assertParseFails("[]@foo");
    assertParseFails("[] @foo");
    assertParseFails("<<>>@foo");
    assertParseFails("<<>> @foo");
    assertParseFails("{}@foo");
    assertParseFails("{} @foo");
  }

  @Test
  public void parseKeylessFieldsFails() {
    assertParseFails("{:}");
    assertParseFails("{:test}");
  }

  @Test
  public void parseTrailingValuesFails() {
    assertParseFails("1 2");
    assertParseFails("true false");
    assertParseFails("\"\" \"\"");
    assertParseFails("<<>><<>>");
    assertParseFails("[][]");
    assertParseFails("{}{}");
  }

  public static void assertParses(Repr expected, String waml) {
    WamlAssertions.assertParses(Waml.parse(WamlParserOptions.standard()), expected, waml);
    WamlAssertions.assertParses(Waml.parse(WamlParserOptions.expressions()), expected, waml);
  }

  public static void assertParseFails(final String waml) {
    assertThrows(ParseException.class, () -> {
      Waml.parse(waml, WamlParserOptions.standard());
    });
    assertThrows(ParseException.class, () -> {
      Waml.parse(waml, WamlParserOptions.expressions());
    });
  }

}
