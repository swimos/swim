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
import swim.repr.ArrayRepr;
import swim.repr.BlobRepr;
import swim.repr.BooleanRepr;
import swim.repr.NumberRepr;
import swim.repr.ObjectRepr;
import swim.repr.Repr;
import swim.repr.StringRepr;
import swim.repr.TupleRepr;

public class WamlReprWriterTests {

  @Test
  public void writeUndefined() {
    assertWrites("undefined", Repr.undefined());
  }

  @Test
  public void writeUnit() {
    assertWrites("()", Repr.unit());
  }

  @Test
  public void writeBooleans() {
    assertWrites("true", BooleanRepr.of(true));
    assertWrites("false", BooleanRepr.of(false));
  }

  @Test
  public void writeNumbers() {
    assertWrites("0", NumberRepr.of(0));
    assertWrites("1", NumberRepr.of(1));
    assertWrites("-1", NumberRepr.of(-1));
    assertWrites("15", NumberRepr.of(15));
    assertWrites("-20", NumberRepr.of(-20));
    assertWrites("3.14", NumberRepr.of(3.14));
    assertWrites("-0.5", NumberRepr.of(-0.5));
    assertWrites("6.02E23", NumberRepr.of(6.02E23));
    assertWrites("2147483647", NumberRepr.of(2147483647));
    assertWrites("-2147483648", NumberRepr.of(-2147483648));
    assertWrites("9223372036854775807", NumberRepr.of(9223372036854775807L));
    assertWrites("-9223372036854775808", NumberRepr.of(-9223372036854775808L));
    assertWrites("9223372036854775808", NumberRepr.of(new BigInteger("9223372036854775808")));
    assertWrites("-9223372036854775809", NumberRepr.of(new BigInteger("-9223372036854775809")));
  }

  @Test
  public void writeEmptyStrings() {
    assertWrites("\"\"",
                 StringRepr.empty());
  }

  @Test
  public void writeNonEmptyStrings() {
    assertWrites("\"Hello, world!\"",
                 StringRepr.of("Hello, world!"));
  }

  @Test
  public void writeStringsWithEscapes() {
    assertWrites("\"\\\"\\\\\\b\\f\\n\\r\\t\"",
                 StringRepr.of("\"\\\b\f\n\r\t"));
  }

  @Test
  public void writeEmptyBlobs() {
    assertWrites("@blob \"\"",
                 BlobRepr.empty(),
                 WamlWriterOptions.readable());
    assertWrites("@blob\"\"",
                 BlobRepr.empty(),
                 WamlWriterOptions.compact());
  }

  @Test
  public void writeNonEmptyBlobs() {
    assertWrites("@blob \"AAAA\"",
                 BlobRepr.parseBase64("AAAA").getNonNullUnchecked(),
                 WamlWriterOptions.readable());
    assertWrites("@blob\"AAAA\"",
                 BlobRepr.parseBase64("AAAA").getNonNullUnchecked(),
                 WamlWriterOptions.compact());
    assertWrites("@blob \"AAA=\"",
                 BlobRepr.parseBase64("AAA=").getNonNullUnchecked(),
                 WamlWriterOptions.readable());
    assertWrites("@blob\"AAA=\"",
                 BlobRepr.parseBase64("AAA=").getNonNullUnchecked(),
                 WamlWriterOptions.compact());
    assertWrites("@blob \"AA==\"",
                 BlobRepr.parseBase64("AA==").getNonNullUnchecked(),
                 WamlWriterOptions.readable());
    assertWrites("@blob\"AA==\"",
                 BlobRepr.parseBase64("AA==").getNonNullUnchecked(),
                 WamlWriterOptions.compact());
    assertWrites("@blob \"ABCDabcd12/+\"",
                 BlobRepr.parseBase64("ABCDabcd12/+").getNonNullUnchecked(),
                 WamlWriterOptions.readable());
    assertWrites("@blob\"ABCDabcd12/+\"",
                 BlobRepr.parseBase64("ABCDabcd12/+").getNonNullUnchecked(),
                 WamlWriterOptions.compact());
    assertWrites("@blob \"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789/+\"",
                 BlobRepr.parseBase64("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789/+").getNonNullUnchecked(),
                 WamlWriterOptions.readable());
    assertWrites("@blob\"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789/+\"",
                 BlobRepr.parseBase64("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789/+").getNonNullUnchecked(),
                 WamlWriterOptions.compact());
  }

  @Test
  public void writeEmptyArrays() {
    assertWrites("[]",
                 ArrayRepr.empty());
  }

  @Test
  public void writeUnaryArrays() {
    assertWrites("[1]",
                 ArrayRepr.of(Repr.of(1)));
  }

  @Test
  public void writeNonEmptyArrays() {
    assertWrites("[1, 2, \"3\", true]",
                 ArrayRepr.of(Repr.of(1), Repr.of(2), Repr.of("3"), Repr.of(true)),
                 WamlWriterOptions.readable());
    assertWrites("[1,2,\"3\",true]",
                 ArrayRepr.of(Repr.of(1), Repr.of(2), Repr.of("3"), Repr.of(true)),
                 WamlWriterOptions.compact());
  }

  @Test
  public void writeNestedArrays() {
    assertWrites("[[1, 2], [3, 4]]",
                 ArrayRepr.of(ArrayRepr.of(Repr.of(1), Repr.of(2)), ArrayRepr.of(Repr.of(3), Repr.of(4))),
                 WamlWriterOptions.readable());
    assertWrites("[[1,2],[3,4]]",
                 ArrayRepr.of(ArrayRepr.of(Repr.of(1), Repr.of(2)), ArrayRepr.of(Repr.of(3), Repr.of(4))),
                 WamlWriterOptions.compact());
  }

  @Test
  public void writeEmptyMarkup() {
    assertWrites("<<>>",
                 ArrayRepr.empty().asMarkup());
  }

  @Test
  public void writeNonEmptyMarkup() {
    assertWrites("<<Hello, world!>>",
                 ArrayRepr.of(Repr.of("Hello, world!")).asMarkup());
  }

  @Test
  public void writeNestedMarkup() {
    assertWrites("<<Hello, <<world>>!>>",
                 ArrayRepr.of(Repr.of("Hello, "), ArrayRepr.of(Repr.of("world")).asMarkup(), Repr.of("!")).asMarkup());
  }

  @Test
  public void writeEmptyObjects() {
    assertWrites("{}",
                 ObjectRepr.empty());
  }

  @Test
  public void writeUnaryObjects() {
    assertWrites("{a: 1}",
                 ObjectRepr.of("a", Repr.of(1)),
                 WamlWriterOptions.readable());
    assertWrites("{a:1}",
                 ObjectRepr.of("a", Repr.of(1)),
                 WamlWriterOptions.compact());
  }

  @Test
  public void writeNonEmptyObjects() {
    assertWrites("{a: 1, b: 2, c: \"3\", d: true}",
                 ObjectRepr.of("a", Repr.of(1), "b", Repr.of(2), "c", Repr.of("3"), "d", Repr.of(true)),
                 WamlWriterOptions.readable());
    assertWrites("{a:1,b:2,c:\"3\",d:true}",
                 ObjectRepr.of("a", Repr.of(1), "b", Repr.of(2), "c", Repr.of("3"), "d", Repr.of(true)),
                 WamlWriterOptions.compact());
  }

  @Test
  public void writeNestedObjects() {
    assertWrites("{a: {b: 2, c: \"3\"}, d: {e: true}}",
                 ObjectRepr.of("a", ObjectRepr.of("b", Repr.of(2), "c", Repr.of("3")), "d", ObjectRepr.of("e", Repr.of(true))),
                 WamlWriterOptions.readable());
    assertWrites("{a:{b:2,c:\"3\"},d:{e:true}}",
                 ObjectRepr.of("a", ObjectRepr.of("b", Repr.of(2), "c", Repr.of("3")), "d", ObjectRepr.of("e", Repr.of(true))),
                 WamlWriterOptions.compact());
  }

  @Test
  public void writeAttrsWithUnitParams() {
    assertWrites("@answer",
                 Repr.unit().withAttr("answer"));
  }

  @Test
  public void writeAttrsWithUndefinedParams() {
    assertWrites("@answer()",
                 Repr.unit().withAttr("answer", Repr.undefined()));
  }

  @Test
  public void writeAttrsWithQuotedNames() {
    assertWrites("@\"@at\"",
                 Repr.unit().withAttr("@at"));
    assertWrites("@\"@at\"()",
                 Repr.unit().withAttr("@at", Repr.undefined()));
  }

  @Test
  public void writeAttrsWithSingleParams() {
    assertWrites("@answer({})",
                 Repr.unit().withAttr("answer", ObjectRepr.empty()));
    assertWrites("@answer(\"42\")",
                 Repr.unit().withAttr("answer", StringRepr.of("42")));
    assertWrites("@answer(42)",
                 Repr.unit().withAttr("answer", NumberRepr.of(42)));
    assertWrites("@answer(true)",
                 Repr.unit().withAttr("answer", BooleanRepr.of(true)));
  }

  @Test
  public void writeAttrsWithMultipleParams() {
    assertWrites("@answer(42, true)",
                 Repr.unit().withAttr("answer", TupleRepr.of(null, Repr.of(42), null, Repr.of(true))),
                 WamlWriterOptions.readable());
    assertWrites("@answer(42,true)",
                 Repr.unit().withAttr("answer", TupleRepr.of(null, Repr.of(42), null, Repr.of(true))),
                 WamlWriterOptions.compact());
  }

  @Test
  public void writeAttrsWithNamedParams() {
    assertWrites("@answer(number: 42)",
                 Repr.unit().withAttr("answer", TupleRepr.of("number", Repr.of(42))),
                 WamlWriterOptions.readable());
    assertWrites("@answer(number:42)",
                 Repr.unit().withAttr("answer", TupleRepr.of("number", Repr.of(42))),
                 WamlWriterOptions.compact());
  }

  @Test
  public void writeMultipleAttrs() {
    assertWrites("@foo @bar",
                 Repr.unit().withAttr("foo").withAttr("bar"),
                 WamlWriterOptions.readable());
    assertWrites("@foo@bar",
                 Repr.unit().withAttr("foo").withAttr("bar"),
                 WamlWriterOptions.compact());
  }

  @Test
  public void writeAttributedBooleans() {
    assertWrites("@answer false",
                 BooleanRepr.of(false).withAttr("answer"));
    assertWrites("@answer true",
                 BooleanRepr.of(true).withAttr("answer"));
    assertWrites("@foo@bar true",
                 BooleanRepr.of(true).withAttr("foo").withAttr("bar"),
                 WamlWriterOptions.compact());
    assertWrites("@foo @bar true",
                 BooleanRepr.of(true).withAttr("foo").withAttr("bar"),
                 WamlWriterOptions.readable());
  }

  @Test
  public void writeAttributedIntegers() {
    assertWrites("@answer 42",
                 NumberRepr.of(42).withAttr("answer"));
    assertWrites("@foo @bar 42",
                 NumberRepr.of(42).withAttr("foo").withAttr("bar"),
                 WamlWriterOptions.readable());
    assertWrites("@foo@bar 42",
                 NumberRepr.of(42).withAttr("foo").withAttr("bar"),
                 WamlWriterOptions.compact());
  }

  @Test
  public void writeAttributedDecimals() {
    assertWrites("@answer 3.14",
                 NumberRepr.of(3.14).withAttr("answer"));
    assertWrites("@foo @bar 3.14",
                 NumberRepr.of(3.14).withAttr("foo").withAttr("bar"),
                 WamlWriterOptions.readable());
    assertWrites("@foo@bar 3.14",
                 NumberRepr.of(3.14).withAttr("foo").withAttr("bar"),
                 WamlWriterOptions.compact());
  }

  @Test
  public void writeAttributedStrings() {
    assertWrites("@hello \"\"",
                 StringRepr.empty().withAttr("hello"),
                 WamlWriterOptions.readable());
    assertWrites("@hello\"\"",
                 StringRepr.empty().withAttr("hello"),
                 WamlWriterOptions.compact());
    assertWrites("@hello \"world!\"",
                 StringRepr.of("world!").withAttr("hello"),
                 WamlWriterOptions.readable());
    assertWrites("@hello\"world!\"",
                 StringRepr.of("world!").withAttr("hello"),
                 WamlWriterOptions.compact());
  }

  @Test
  public void writeAttributedBlobs() {
    assertWrites("@hello @blob \"\"",
                 BlobRepr.empty().withAttr("hello"),
                 WamlWriterOptions.readable());
    assertWrites("@hello@blob\"\"",
                 BlobRepr.empty().withAttr("hello"),
                 WamlWriterOptions.compact());
  }

  @Test
  public void writeAttributedArrays() {
    assertWrites("@hello []",
                 ArrayRepr.empty().withAttr("hello"),
                 WamlWriterOptions.readable());
    assertWrites("@hello[]",
                 ArrayRepr.empty().withAttr("hello"),
                 WamlWriterOptions.compact());
  }

  @Test
  public void writeAttributedMarkup() {
    assertWrites("@hello <<>>",
                 ArrayRepr.empty().asMarkup().withAttr("hello"),
                 WamlWriterOptions.readable());
    assertWrites("@hello<<>>",
                 ArrayRepr.empty().asMarkup().withAttr("hello"),
                 WamlWriterOptions.compact());
  }

  @Test
  public void writeAttributedObjects() {
    assertWrites("@hello {}",
                 ObjectRepr.empty().withAttr("hello"),
                 WamlWriterOptions.readable());
    assertWrites("@hello{}",
                 ObjectRepr.empty().withAttr("hello"),
                 WamlWriterOptions.compact());
  }

  @Test
  public void writeMarkupInAttributeParameters() {
    assertWrites("@msg(<<Hello, @em<<world>>!>>)",
                 Repr.unit().withAttr("msg", ArrayRepr.of(Repr.of("Hello, "), ArrayRepr.of(Repr.of("world")).withAttr("em").asMarkup(), Repr.of("!")).asMarkup()));
  }

  @Test
  public void writeNestedAttributedMarkup() {
    assertWrites("<<Hello, @em<<world>>!>>",
                 ArrayRepr.of(Repr.of("Hello, "), ArrayRepr.of(Repr.of("world")).withAttr("em").asMarkup(), Repr.of("!")).asMarkup());
    assertWrites("<<Hello, @em(class: \"subject\")<<world>>!>>",
                 ArrayRepr.of(Repr.of("Hello, "), ArrayRepr.of(Repr.of("world")).withAttr("em", TupleRepr.of("class", Repr.of("subject"))).asMarkup(), Repr.of("!")).asMarkup(),
                 WamlWriterOptions.readable());
    assertWrites("<<Hello, @em(class:\"subject\")<<world>>!>>",
                 ArrayRepr.of(Repr.of("Hello, "), ArrayRepr.of(Repr.of("world")).withAttr("em", TupleRepr.of("class", Repr.of("subject"))).asMarkup(), Repr.of("!")).asMarkup(),
                 WamlWriterOptions.compact());
    assertWrites("<<X @p<<Y @q<<Z>>.>>.>>",
                 ArrayRepr.of(Repr.of("X "), ArrayRepr.of(Repr.of("Y "), ArrayRepr.of(Repr.of("Z")).withAttr("q").asMarkup(), Repr.of(".")).withAttr("p").asMarkup(), Repr.of(".")).asMarkup());
  }

  @Test
  public void writeMarkupEmbeddedValues() {
    assertWrites("<<Hello, {6}>>",
                 ArrayRepr.of(Repr.of("Hello, "), Repr.of(6)).asMarkup());
    assertWrites("<<Hello, {6}!>>",
                 ArrayRepr.of(Repr.of("Hello, "), Repr.of(6), Repr.of("!")).asMarkup());
    assertWrites("<<Hello, {6, 7}!>>",
                 ArrayRepr.of(Repr.of("Hello, "), Repr.of(6), Repr.of(7), Repr.of("!")).asMarkup(),
                 WamlWriterOptions.readable());
    assertWrites("<<Hello, {6,7}!>>",
                 ArrayRepr.of(Repr.of("Hello, "), Repr.of(6), Repr.of(7), Repr.of("!")).asMarkup(),
                 WamlWriterOptions.compact());
  }

  @Test
  public void writeMarkupEmbeddedObjects() {
    assertWrites("<<Hello, {{}}!>>",
                 ArrayRepr.of(Repr.of("Hello, "), ObjectRepr.empty(), Repr.of("!")).asMarkup());
    assertWrites("<<Hello, {{a: 1}}!>>",
                 ArrayRepr.of(Repr.of("Hello, "), ObjectRepr.of("a", Repr.of(1)), Repr.of("!")).asMarkup(),
                 WamlWriterOptions.readable());
    assertWrites("<<Hello, {{a:1}}!>>",
                 ArrayRepr.of(Repr.of("Hello, "), ObjectRepr.of("a", Repr.of(1)), Repr.of("!")).asMarkup(),
                 WamlWriterOptions.compact());
    assertWrites("<<Hello, {{a: 1, b: 2}}!>>",
                 ArrayRepr.of(Repr.of("Hello, "), ObjectRepr.of("a", Repr.of(1), "b", Repr.of(2)), Repr.of("!")).asMarkup(),
                 WamlWriterOptions.readable());
    assertWrites("<<Hello, {{a:1,b:2}}!>>",
                 ArrayRepr.of(Repr.of("Hello, "), ObjectRepr.of("a", Repr.of(1), "b", Repr.of(2)), Repr.of("!")).asMarkup(),
                 WamlWriterOptions.compact());
  }

  @Test
  public void writeMarkupEmbeddedAttributedValues() {
    assertWrites("<<Hello, {@number 6}!>>",
                 ArrayRepr.of(Repr.of("Hello, "), NumberRepr.of(6).withAttr("number"), Repr.of("!")).asMarkup());
  }

  @Test
  public void writeMarkupEmbeddedAttributedObjects() {
    assertWrites("<<Hello, {@choice {a: \"Earth\", b: \"Mars\"}}!>>",
                 ArrayRepr.of(Repr.of("Hello, "), ObjectRepr.of("a", Repr.of("Earth"), "b", Repr.of("Mars")).withAttr("choice"), Repr.of("!")).asMarkup(),
                 WamlWriterOptions.readable());
    assertWrites("<<Hello, {@choice{a:\"Earth\",b:\"Mars\"}}!>>",
                 ArrayRepr.of(Repr.of("Hello, "), ObjectRepr.of("a", Repr.of("Earth"), "b", Repr.of("Mars")).withAttr("choice"), Repr.of("!")).asMarkup(),
                 WamlWriterOptions.compact());
  }

  public static void assertWrites(String expected, Repr value, WamlWriterOptions options) {
    WamlAssertions.assertWrites(expected, () -> WamlReprs.valueFormat().write(value, options));
  }

  public static void assertWrites(String expected, Repr value) {
    WamlAssertions.assertWrites(expected, () -> WamlReprs.valueFormat().write(value, WamlWriterOptions.readable()));
    WamlAssertions.assertWrites(expected, () -> WamlReprs.valueFormat().write(value, WamlWriterOptions.compact()));
  }

}
