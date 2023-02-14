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

package swim.json;

import java.math.BigInteger;
import org.junit.jupiter.api.Test;
import swim.codec.ParseException;
import swim.repr.ArrayRepr;
import swim.repr.BooleanRepr;
import swim.repr.NumberRepr;
import swim.repr.ObjectRepr;
import swim.repr.StringRepr;
import swim.repr.Repr;
import static org.junit.jupiter.api.Assertions.assertThrows;

public class JsonReprParserTests {

  @Test
  public void parseUndefined() {
    assertParses(Repr.undefined(), "undefined");
  }

  @Test
  public void parseNull() {
    assertParses(Repr.unit(), "null");
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
  public void parseStringsWithCharacterEscapes() {
    assertParses(StringRepr.of("\"\\/\b\f\n\r\t"),
                 "\"\\\"\\\\\\/\\b\\f\\n\\r\\t\"");
  }

  @Test
  public void parseStringsWithUnicodeEscapes() {
    assertParses(StringRepr.of("À"), "\"\\u00C0\"");
    assertParses(StringRepr.of("Ö"), "\"\\u00D6\"");
    assertParses(StringRepr.of("Ø"), "\"\\u00D8\"");
    assertParses(StringRepr.of("ö"), "\"\\u00F6\"");
    assertParses(StringRepr.of("ø"), "\"\\u00F8\"");
    assertParses(StringRepr.of("˿"), "\"\\u02FF\"");
    assertParses(StringRepr.of("Ͱ"), "\"\\u0370\"");
    assertParses(StringRepr.of("ͽ"), "\"\\u037D\"");
    assertParses(StringRepr.of("Ϳ"), "\"\\u037F\"");
    assertParses(StringRepr.of("῿"), "\"\\u1FFF\"");
    assertParses(StringRepr.of("⁰"), "\"\\u2070\"");
    assertParses(StringRepr.of("↏"), "\"\\u218F\"");
    assertParses(StringRepr.of("Ⰰ"), "\"\\u2C00\"");
    assertParses(StringRepr.of("⿯"), "\"\\u2FEF\"");
    assertParses(StringRepr.of("、"), "\"\\u3001\"");
    assertParses(StringRepr.of("퟿"), "\"\\uD7FF\"");
    assertParses(StringRepr.of("豈"), "\"\\uF900\"");
    assertParses(StringRepr.of("﷏"), "\"\\uFDCF\"");
    assertParses(StringRepr.of("ﷰ"), "\"\\uFDF0\"");
  }

  @Test
  public void parseEmptyArrays() {
    assertParses(ArrayRepr.empty(),
                 "[]");
  }

  @Test
  public void parseNonEmptyArrays() {
    assertParses(ArrayRepr.of(ObjectRepr.empty(), ArrayRepr.empty(), "", 0, true, false, null),
                 "[{},[],\"\",0,true,false,null]");
  }

  @Test
  public void parseArraysWithWhitespace() {
    assertParses(ArrayRepr.empty(),
                 " [ ] ");
    assertParses(ArrayRepr.of(1, 2),
                 " [ 1 , 2 ] ");
  }

  @Test
  public void parseEmptyObjects() {
    assertParses(ObjectRepr.empty(),
                 "{}");
  }

  @Test
  public void parseNonEmptyObjects() {
    assertParses(ObjectRepr.of("object", ObjectRepr.empty(),
                               "array", ArrayRepr.empty(),
                               "string", "",
                               "number", 0,
                               "true", true,
                               "false", false,
                               "null", null),
                 "{\"object\":{},\"array\":[],\"string\":\"\",\"number\":0,\"true\":true,\"false\":false,\"null\":null}");
  }

  @Test
  public void parseObjectsWithIdentifierKeys() {
    assertParses(ObjectRepr.of("test", null),
                 "{test:null}");
  }

  @Test
  public void parseObjectsWithUnicodeIdentifierKeys() {
    assertParses(ObjectRepr.of("À", null), "{À:null}"); // U+C0
    assertParses(ObjectRepr.of("Ö", null), "{Ö:null}"); // U+D6
    assertParses(ObjectRepr.of("Ø", null), "{Ø:null}"); // U+D8
    assertParses(ObjectRepr.of("ö", null), "{ö:null}"); // U+F6
    assertParses(ObjectRepr.of("ø", null), "{ø:null}"); // U+F8
    assertParses(ObjectRepr.of("˿", null), "{˿:null}"); // U+2FF
    assertParses(ObjectRepr.of("Ͱ", null), "{Ͱ:null}"); // U+370
    assertParses(ObjectRepr.of("ͽ", null), "{ͽ:null}"); // U+37D
    assertParses(ObjectRepr.of("Ϳ", null), "{Ϳ:null}"); // U+37F
    assertParses(ObjectRepr.of("῿", null), "{῿:null}"); // U+1FFF
    assertParses(ObjectRepr.of("⁰", null), "{⁰:null}"); // U+2070
    assertParses(ObjectRepr.of("↏", null), "{↏:null}"); // U+218F
    assertParses(ObjectRepr.of("Ⰰ", null), "{Ⰰ:null}"); // U+2C00
    assertParses(ObjectRepr.of("⿯", null), "{⿯:null}"); // U+2FEF
    assertParses(ObjectRepr.of("、", null), "{、:null}"); // U+3001
    assertParses(ObjectRepr.of("퟿", null), "{퟿:null}"); // U+D7FF
    assertParses(ObjectRepr.of("豈", null), "{豈:null}"); // U+F900
    assertParses(ObjectRepr.of("﷏", null), "{﷏:null}"); // U+FDCF
    assertParses(ObjectRepr.of("ﷰ", null), "{ﷰ:null}"); // U+FDF0
    //assertParses(ObjectRepr.of("𐀀", null), "{𐀀:null}"); // U+10000
    //assertParses(ObjectRepr.of("󯿿", null), "{󯿿:null}"); // U+EFFFF

    assertParses(ObjectRepr.of("_À", null), "{_À:null}"); // U+C0
    assertParses(ObjectRepr.of("_Ö", null), "{_Ö:null}"); // U+D6
    assertParses(ObjectRepr.of("_Ø", null), "{_Ø:null}"); // U+D8
    assertParses(ObjectRepr.of("_ö", null), "{_ö:null}"); // U+F6
    assertParses(ObjectRepr.of("_ø", null), "{_ø:null}"); // U+F8
    assertParses(ObjectRepr.of("_˿", null), "{_˿:null}"); // U+2FF
    assertParses(ObjectRepr.of("_Ͱ", null), "{_Ͱ:null}"); // U+370
    assertParses(ObjectRepr.of("_ͽ", null), "{_ͽ:null}"); // U+37D
    assertParses(ObjectRepr.of("_Ϳ", null), "{_Ϳ:null}"); // U+37F
    assertParses(ObjectRepr.of("_῿", null), "{_῿:null}"); // U+1FFF
    assertParses(ObjectRepr.of("_⁰", null), "{_⁰:null}"); // U+2070
    assertParses(ObjectRepr.of("_↏", null), "{_↏:null}"); // U+218F
    assertParses(ObjectRepr.of("_Ⰰ", null), "{_Ⰰ:null}"); // U+2C00
    assertParses(ObjectRepr.of("_⿯", null), "{_⿯:null}"); // U+2FEF
    assertParses(ObjectRepr.of("_、", null), "{_、:null}"); // U+3001
    assertParses(ObjectRepr.of("_퟿", null), "{_퟿:null}"); // U+D7FF
    assertParses(ObjectRepr.of("_豈", null), "{_豈:null}"); // U+F900
    assertParses(ObjectRepr.of("_﷏", null), "{_﷏:null}"); // U+FDCF
    assertParses(ObjectRepr.of("_ﷰ", null), "{_ﷰ:null}"); // U+FDF0
    //assertParses(ObjectRepr.of"_𐀀", null), "{_𐀀:null}"); // U+10000
    //assertParses(ObjectRepr.of"_󯿿", null), "{_󯿿:null}"); // U+EFFFF
  }

  @Test
  public void parseObjectsWithWhitespace() {
    assertParses(ObjectRepr.empty(),
                 " { } ");
    assertParses(ObjectRepr.of("a", 1, "b", 2),
                 " { \"a\" : 1 , \"b\" : 2 } ");
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
  public void parseTrailingValuesFails() {
    assertParseFails("{}{}");
    assertParseFails("1 2");
  }

  public static void assertParses(Repr expected, String json) {
    JsonAssertions.assertParses(Json.parse(), expected, json);
    JsonAssertions.assertParses(Json.parse(), expected, " " + json + " ");
  }

  public static void assertParseFails(final String json) {
    assertThrows(ParseException.class, () -> {
      Json.parse(json);
    });
  }

}
