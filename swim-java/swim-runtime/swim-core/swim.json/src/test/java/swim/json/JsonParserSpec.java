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

package swim.json;

import java.math.BigInteger;
import org.testng.annotations.Test;
import swim.codec.ParserException;
import swim.structure.Attr;
import swim.structure.Bool;
import swim.structure.Num;
import swim.structure.Record;
import swim.structure.Slot;
import swim.structure.Text;
import swim.structure.Value;
import static org.testng.Assert.ThrowingRunnable;
import static org.testng.Assert.assertThrows;

public class JsonParserSpec {

  @Test
  public void parseEmptyObjects() {
    assertParsesObject("{}", Record.empty());
  }

  @Test
  public void parseEmptyArrays() {
    assertParses("[]", Record.empty());
    assertParsesObject("[]", Record.empty());
  }

  @Test
  public void parseEmptyStrings() {
    assertParses("\"\"", Text.empty());
    assertParses("''", Text.empty());
  }

  @Test
  public void parseNonEmptyStrings() {
    assertParses("\"test\"", Text.from("test"));
    assertParses("'test'", Text.from("test"));
  }

  @Test
  public void parseStringsWithCharacterEscapes() {
    assertParses("\"\\\"\\\\\\/\\b\\f\\n\\r\\t\"", Text.from("\"\\/\b\f\n\r\t"));
    assertParses("'\\\'\\\\\\/\\b\\f\\n\\r\\t'", Text.from("'\\/\b\f\n\r\t"));
  }

  @Test
  public void parseStringsWithUnicodeEscapes() {
    assertParses("\"\\u00C0\"", Text.from("À"));
    assertParses("\"\\u00D6\"", Text.from("Ö"));
    assertParses("\"\\u00D8\"", Text.from("Ø"));
    assertParses("\"\\u00F6\"", Text.from("ö"));
    assertParses("\"\\u00F8\"", Text.from("ø"));
    assertParses("\"\\u02FF\"", Text.from("˿"));
    assertParses("\"\\u0370\"", Text.from("Ͱ"));
    assertParses("\"\\u037D\"", Text.from("ͽ"));
    assertParses("\"\\u037F\"", Text.from("Ϳ"));
    assertParses("\"\\u1FFF\"", Text.from("῿"));
    assertParses("\"\\u2070\"", Text.from("⁰"));
    assertParses("\"\\u218F\"", Text.from("↏"));
    assertParses("\"\\u2C00\"", Text.from("Ⰰ"));
    assertParses("\"\\u2FEF\"", Text.from("⿯"));
    assertParses("\"\\u3001\"", Text.from("、"));
    assertParses("\"\\uD7FF\"", Text.from("퟿"));
    assertParses("\"\\uF900\"", Text.from("豈"));
    assertParses("\"\\uFDCF\"", Text.from("﷏"));
    assertParses("\"\\uFDF0\"", Text.from("ﷰ"));
  }

  @Test
  public void parseIdentifiers() {
    assertParses("test", Text.from("test"));
  }

  @Test
  public void parseUnicodeIdentifiers() {
    assertParses("À", Text.from("À")); // U+C0
    assertParses("Ö", Text.from("Ö")); // U+D6
    assertParses("Ø", Text.from("Ø")); // U+D8
    assertParses("ö", Text.from("ö")); // U+F6
    assertParses("ø", Text.from("ø")); // U+F8
    assertParses("˿", Text.from("˿")); // U+2FF
    assertParses("Ͱ", Text.from("Ͱ")); // U+370
    assertParses("ͽ", Text.from("ͽ")); // U+37D
    assertParses("Ϳ", Text.from("Ϳ")); // U+37F
    assertParses("῿", Text.from("῿")); // U+1FFF
    assertParses("⁰", Text.from("⁰")); // U+2070
    assertParses("↏", Text.from("↏")); // U+218F
    assertParses("Ⰰ", Text.from("Ⰰ")); // U+2C00
    assertParses("⿯", Text.from("⿯")); // U+2FEF
    assertParses("、", Text.from("、")); // U+3001
    assertParses("퟿", Text.from("퟿")); // U+D7FF
    assertParses("豈", Text.from("豈")); // U+F900
    assertParses("﷏", Text.from("﷏")); // U+FDCF
    assertParses("ﷰ", Text.from("ﷰ")); // U+FDF0
    //assertParses("𐀀", Text.from("𐀀")); // U+10000
    //assertParses("󯿿", Text.from("󯿿")); // U+EFFFF

    assertParses("_À", Text.from("_À")); // U+C0
    assertParses("_Ö", Text.from("_Ö")); // U+D6
    assertParses("_Ø", Text.from("_Ø")); // U+D8
    assertParses("_ö", Text.from("_ö")); // U+F6
    assertParses("_ø", Text.from("_ø")); // U+F8
    assertParses("_˿", Text.from("_˿")); // U+2FF
    assertParses("_Ͱ", Text.from("_Ͱ")); // U+370
    assertParses("_ͽ", Text.from("_ͽ")); // U+37D
    assertParses("_Ϳ", Text.from("_Ϳ")); // U+37F
    assertParses("_῿", Text.from("_῿")); // U+1FFF
    assertParses("_⁰", Text.from("_⁰")); // U+2070
    assertParses("_↏", Text.from("_↏")); // U+218F
    assertParses("_Ⰰ", Text.from("_Ⰰ")); // U+2C00
    assertParses("_⿯", Text.from("_⿯")); // U+2FEF
    assertParses("_、", Text.from("_、")); // U+3001
    assertParses("_퟿", Text.from("_퟿")); // U+D7FF
    assertParses("_豈", Text.from("_豈")); // U+F900
    assertParses("_﷏", Text.from("_﷏")); // U+FDCF
    assertParses("_ﷰ", Text.from("_ﷰ")); // U+FDF0
    //assertParses("_𐀀", Text.from("_𐀀")); // U+10000
    //assertParses("_󯿿", Text.from("_󯿿")); // U+EFFFF
  }

  @Test
  public void parsePositiveIntegers() {
    assertParses("0", Num.from(0));
    assertParses("1", Num.from(1));
    assertParses("5", Num.from(5));
    assertParses("10", Num.from(10));
    assertParses("11", Num.from(11));
    assertParses("15", Num.from(15));
    assertParses("2147483647", Num.from(2147483647));
    assertParses("9223372036854775807", Num.from(9223372036854775807L));
  }

  @Test
  public void parseNegativeIntegers() {
    assertParses("-0", Num.from(-0));
    assertParses("-1", Num.from(-1));
    assertParses("-5", Num.from(-5));
    assertParses("-10", Num.from(-10));
    assertParses("-11", Num.from(-11));
    assertParses("-15", Num.from(-15));
    assertParses("-2147483648", Num.from(-2147483648));
    assertParses("-9223372036854775808", Num.from(-9223372036854775808L));
  }

  @Test
  public void parsePositiveDecimals() {
    assertParses("0.0", Num.from(0.0));
    assertParses("0.5", Num.from(0.5));
    assertParses("1.0", Num.from(1.0));
    assertParses("1.5", Num.from(1.5));
    assertParses("1.05", Num.from(1.05));
    assertParses("10.0", Num.from(10.0));
    assertParses("10.5", Num.from(10.5));
  }

  @Test
  public void parseNegativeDecimals() {
    assertParses("-0.0", Num.from(-0.0));
    assertParses("-0.5", Num.from(-0.5));
    assertParses("-1.0", Num.from(-1.0));
    assertParses("-1.5", Num.from(-1.5));
    assertParses("-1.05", Num.from(-1.05));
    assertParses("-10.0", Num.from(-10.0));
    assertParses("-10.5", Num.from(-10.5));
  }

  @Test
  public void parsePositiveDecimalsWithExponents() {
    assertParses("4e0", Num.from(4e0));
    assertParses("4E0", Num.from(4E0));
    assertParses("4e1", Num.from(4e1));
    assertParses("4E1", Num.from(4E1));
    assertParses("4e2", Num.from(4e2));
    assertParses("4E2", Num.from(4E2));
    assertParses("4e+0", Num.from(4e+0));
    assertParses("4E+0", Num.from(4E+0));
    assertParses("4e-0", Num.from(4e-0));
    assertParses("4E-0", Num.from(4E-0));
    assertParses("4e+1", Num.from(4e+1));
    assertParses("4E+1", Num.from(4E+1));
    assertParses("4e-1", Num.from(4e-1));
    assertParses("4E-1", Num.from(4E-1));
    assertParses("4e+2", Num.from(4e+2));
    assertParses("4E+2", Num.from(4E+2));
    assertParses("4e-2", Num.from(4e-2));
    assertParses("4E-2", Num.from(4E-2));
    assertParses("4.0e2", Num.from(4.0e2));
    assertParses("4.0E2", Num.from(4.0E2));
    assertParses("4.0e+2", Num.from(4.0e+2));
    assertParses("4.0E+2", Num.from(4.0E+2));
    assertParses("4.0e-2", Num.from(4.0e-2));
    assertParses("4.0E-2", Num.from(4.0E-2));
    assertParses("1.17549435e-38", Num.from(1.17549435e-38)); // Float.MIN_VALUE
    assertParses("3.4028235e38", Num.from(3.4028235e38)); // Float.MAX_VALUE
    assertParses("1.17549435e-38", Num.from(1.17549435e-38)); // Float.MIN_NORMAL
    assertParses("4.9e-324", Num.from(4.9e-324)); // Double.MIN_VALUE
    assertParses("1.7976931348623157e308", Num.from(1.7976931348623157e308)); // Double.MAX_VALUE
    assertParses("2.2250738585072014e-308", Num.from(2.2250738585072014e-308)); // Double.MIN_NORMAL
  }

  @Test
  public void parseNegativeDecimalsWithExponents() {
    assertParses("-4e0", Num.from(-4e0));
    assertParses("-4E0", Num.from(-4E0));
    assertParses("-4e1", Num.from(-4e1));
    assertParses("-4E1", Num.from(-4E1));
    assertParses("-4e2", Num.from(-4e2));
    assertParses("-4E2", Num.from(-4E2));
    assertParses("-4e+0", Num.from(-4e+0));
    assertParses("-4E+0", Num.from(-4E+0));
    assertParses("-4e-0", Num.from(-4e-0));
    assertParses("-4E-0", Num.from(-4E-0));
    assertParses("-4e+1", Num.from(-4e+1));
    assertParses("-4E+1", Num.from(-4E+1));
    assertParses("-4e-1", Num.from(-4e-1));
    assertParses("-4E-1", Num.from(-4E-1));
    assertParses("-4e+2", Num.from(-4e+2));
    assertParses("-4E+2", Num.from(-4E+2));
    assertParses("-4e-2", Num.from(-4e-2));
    assertParses("-4E-2", Num.from(-4E-2));
    assertParses("-4.0e2", Num.from(-4.0e2));
    assertParses("-4.0E2", Num.from(-4.0E2));
    assertParses("-4.0e+2", Num.from(-4.0e+2));
    assertParses("-4.0E+2", Num.from(-4.0E+2));
    assertParses("-4.0e-2", Num.from(-4.0e-2));
    assertParses("-4.0E-2", Num.from(-4.0E-2));
    assertParses("-4.0e02", Num.from(-4.0e2));
    assertParses("-4.0E02", Num.from(-4.0E2));
    assertParses("-4.0e+02", Num.from(-4.0e+2));
    assertParses("-4.0E+02", Num.from(-4.0E+2));
    assertParses("-4.0e-02", Num.from(-4.0e-2));
    assertParses("-4.0E-02", Num.from(-4.0E-2));
  }

  @Test
  public void parseHexadecimals() {
    assertParses("0x0", Num.uint32(0x0));

    assertParses("0x00000001", Num.uint32(0x00000001));
    assertParses("0x00000010", Num.uint32(0x00000010));
    assertParses("0x00000100", Num.uint32(0x00000100));
    assertParses("0x00001000", Num.uint32(0x00001000));
    assertParses("0x00010000", Num.uint32(0x00010000));
    assertParses("0x00100000", Num.uint32(0x00100000));
    assertParses("0x01000000", Num.uint32(0x01000000));
    assertParses("0x10000000", Num.uint32(0x10000000));
    assertParses("0xFFFFFFFF", Num.uint32(0xFFFFFFFF));
    assertParses("0xFEDCBA98", Num.uint32(0xFEDCBA98));
    assertParses("0x01234567", Num.uint32(0x01234567));

    assertParses("0x0000000000000001", Num.uint64(0x0000000000000001L));
    assertParses("0x0000000000000010", Num.uint64(0x0000000000000010L));
    assertParses("0x0000000000000100", Num.uint64(0x0000000000000100L));
    assertParses("0x0000000000001000", Num.uint64(0x0000000000001000L));
    assertParses("0x0000000000010000", Num.uint64(0x0000000000010000L));
    assertParses("0x0000000000100000", Num.uint64(0x0000000000100000L));
    assertParses("0x0000000001000000", Num.uint64(0x0000000001000000L));
    assertParses("0x0000000010000000", Num.uint64(0x0000000010000000L));
    assertParses("0x0000000100000000", Num.uint64(0x0000000100000000L));
    assertParses("0x0000001000000000", Num.uint64(0x0000001000000000L));
    assertParses("0x0000010000000000", Num.uint64(0x0000010000000000L));
    assertParses("0x0000100000000000", Num.uint64(0x0000100000000000L));
    assertParses("0x0001000000000000", Num.uint64(0x0001000000000000L));
    assertParses("0x0010000000000000", Num.uint64(0x0010000000000000L));
    assertParses("0x0100000000000000", Num.uint64(0x0100000000000000L));
    assertParses("0x1000000000000000", Num.uint64(0x1000000000000000L));
    assertParses("0xFFFFFFFFFFFFFFFF", Num.uint64(0xFFFFFFFFFFFFFFFFL));
    assertParses("0xFEDCBA9876543210", Num.uint64(0xFEDCBA9876543210L));
    assertParses("0x0123456789ABCDEF", Num.uint64(0x0123456789ABCDEFL));
  }

  @Test
  public void parseBigIntegers() {
    assertParses("9223372036854775808", Num.from(new BigInteger("9223372036854775808")));
    assertParses("-9223372036854775809", Num.from(new BigInteger("-9223372036854775809")));
    assertParses("259804429589205426119611", Num.from(new BigInteger("259804429589205426119611")));
    assertParses("-259804429589205426119611", Num.from(new BigInteger("-259804429589205426119611")));
  }

  @Test
  public void parseBooleans() {
    assertParses("true", Bool.from(true));
    assertParses("false", Bool.from(false));
  }

  @Test
  public void parseNulls() {
    assertParses("null", Value.extant());
  }

  @Test
  public void parseNonEmptyObjects() {
    assertParsesObject("{\"object\":{},\"array\":[],\"string\":\"\",\"number\":0,\"true\":true,\"false\":false,\"null\":null}",
                       Record.of(Slot.of("object", Record.empty()), Slot.of("array", Record.empty()),
                                 Slot.of("string", ""), Slot.of("number", 0), Slot.of("true", Bool.from(true)),
                                 Slot.of("false", Bool.from(false)), Slot.of("null")));
  }

  @Test
  public void parseObjectsWithAttributes() {
    assertParsesObject("{\"@test\": null}", Record.of(Attr.of("test")));
  }

  @Test
  public void parseObjectsWithWhitespace() {
    assertParsesObject(" { } ", Record.empty());
    assertParsesObject(" { \"a\" : 1 , \"b\" : 2 } ", Record.of(Slot.of("a", 1), Slot.of("b", 2)));
  }

  @Test
  public void parseNonEmptyArrays() {
    assertParses("[{},[],\"\",0,true,false,null]",
                 Record.of(Record.empty(), Record.empty(), "", 0, Bool.from(true),
                           Bool.from(false), Value.extant()));
    assertParsesObject("[{},[],\"\",0,true,false,null]",
        Record.of(Record.empty(), Record.empty(), "", 0, Bool.from(true),
            Bool.from(false), Value.extant()));
  }

  @Test
  public void parseArraysWithWhitespace() {
    assertParses(" [ ] ", Record.empty());
    assertParses(" [ 1 , 2 ] ", Record.of(1, 2));
    assertParsesObject(" [ ] ", Record.empty());
    assertParsesObject(" [ 1 , 2 ] ", Record.of(1, 2));
  }

  @Test
  public void parseUnclosedEmptyObjectFails() {
    assertParseFails("{");
  }

  @Test
  public void parseUnclosedNonEmptyObjectFails() {
    assertParseFails("{\"\"");
    assertParseFails("{\"\" ");
    assertParseFails("{\"\":");
    assertParseFails("{\"\",");
    assertParseFails("{\"\":,");
    assertParseFails("{\"\":1");
    assertParseFails("{\"\":1 ");
    assertParseFails("{\"\":1,");
  }

  @Test
  public void parseTrailingObjectCommaFails() {
    assertParseFails("{,}");
    assertParseFails("{\"a\":1,}");
    assertParseFails("{\"a\":1,,}");
  }

  @Test
  public void parseUnclosedEmptyArrayFails() {
    assertParseFails("[");
  }

  @Test
  public void parseUnclosedNonEmptyArrayFails() {
    assertParseFails("[1");
    assertParseFails("[1:");
    assertParseFails("[1,");
    assertParseFails("[1 ");
  }

  @Test
  public void parseTrailingArrayCommaFails() {
    assertParseFails("[,]");
    assertParseFails("[1,]");
    assertParseFails("[1,,]");
  }

  @Test
  public void parseUnclosedEmptyStringFails() {
    assertParseFails("\"");
    assertParseFails("'");
  }

  @Test
  public void parseUnclosedNonEmptyStringFails() {
    assertParseFails("\"test");
    assertParseFails("\"test\\");

    assertParseFails("'test");
    assertParseFails("'test\\");
  }

  @Test
  public void parseNakedNegativeFails() {
    assertParseFails("-");
  }

  @Test
  public void parseTrailingDecimalFails() {
    assertParseFails("1.");
  }

  @Test
  public void parseTrailingExponentFails() {
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
  public void parseTrailingValuesFails() {
    assertParseFails("{}{}");
    assertParseFails("1 2");
  }

  public static void assertParses(String json, Value expected) {
    JsonAssertions.assertParses(Json.structureParser().valueParser(), json, expected);
    JsonAssertions.assertParses(Json.structureParser().valueParser(), " " + json + " ", expected);
  }

  public static void assertParsesObject(String json, Value expected) {
    assertParses(json, expected);
    JsonAssertions.assertParses(Json.structureParser().documentParser(), json, expected);
    JsonAssertions.assertParses(Json.structureParser().documentParser(), " " + json + " ", expected);
  }

  public static void assertParseFails(final String json) {
    assertThrows(ParserException.class, new ThrowingRunnable() {
      @Override
      public void run() throws Throwable {
        Json.parse(json);
      }
    });
  }

}
