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

import org.junit.jupiter.api.Test;
import swim.repr.ArrayRepr;
import swim.repr.BlobRepr;
import swim.repr.BooleanRepr;
import swim.repr.NumberRepr;
import swim.repr.ObjectRepr;
import swim.repr.Repr;
import swim.repr.StringRepr;

public class JsonReprWriterTests {

  @Test
  public void writeUndefined() {
    assertWrites("undefined", Repr.undefined());
  }

  @Test
  public void writeNull() {
    assertWrites("null", Repr.unit());
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
  }

  @Test
  public void writeEmptyStrings() {
    assertWrites("\"\"",
                  StringRepr.empty());
  }

  @Test
  public void writeNonEmptyStrings() {
    assertWrites("\"test\"",
                 StringRepr.of("test"));
    assertWrites("\"Hello, world!\"",
                 StringRepr.of("Hello, world!"));
  }

  @Test
  public void writeStringsWithEscapes() {
    assertWrites("\"\\\"\\\\\\b\\f\\n\\r\\t\"",
                 StringRepr.of("\"\\\b\f\n\r\t"));
  }

  @Test
  public void writeStringsWithUnicodeEscapes() {
    assertWrites("\"\\u0000\"",
                 StringRepr.of("\0"));
    assertWrites("\"\\u001F\"",
                 StringRepr.of("\u001F"));
  }

  @Test
  public void writeEmptyBlobs() {
    assertWrites("\"\"",
                 BlobRepr.empty());
  }

  @Test
  public void writeNonEmptyBobs() {
    assertWrites("\"AAAA\"",
                 BlobRepr.fromBase64("AAAA"));
    assertWrites("\"AAA=\"",
                 BlobRepr.fromBase64("AAA="));
    assertWrites("\"AA==\"",
                 BlobRepr.fromBase64("AA=="));
    assertWrites("\"ABCDabcd12/+\"",
                 BlobRepr.fromBase64("ABCDabcd12/+"));
    assertWrites("\"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789/+\"",
                 BlobRepr.fromBase64("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789/+"));
  }

  @Test
  public void writeEmptyArrays() {
    assertWrites("[]",
                 ArrayRepr.empty());
  }

  @Test
  public void writeUnaryArrays() {
    assertWrites("[1]",
                 ArrayRepr.of(1));
  }

  @Test
  public void writeNonEmptyArrays() {
    assertWrites("[1, 2, \"3\", true]",
                 ArrayRepr.of(1, 2, "3", true),
                 JsonWriterOptions.readable());
    assertWrites("[1,2,\"3\",true]",
                 ArrayRepr.of(1, 2, "3", true),
                 JsonWriterOptions.compact());
  }

  @Test
  public void writeNestedArrays() {
    assertWrites("[1, [2, 3], 4]",
                 ArrayRepr.of(1, ArrayRepr.of(2, 3), 4),
                 JsonWriterOptions.readable());
    assertWrites("[1,[2,3],4]",
                 ArrayRepr.of(1, ArrayRepr.of(2, 3), 4),
                 JsonWriterOptions.compact());
  }

  @Test
  public void writeEmptyObjects() {
    assertWrites("{}",
                 ObjectRepr.empty());
  }

  @Test
  public void writeUnaryObjects() {
    assertWrites("{a: 1}",
                 ObjectRepr.of("a", 1),
                 JsonWriterOptions.readable());
    assertWrites("{\"a\":1}",
                 ObjectRepr.of("a", 1),
                 JsonWriterOptions.compact());
  }

  @Test
  public void writeNonEmptyObjects() {
    assertWrites("{a: 1, b: \"2\"}",
                 ObjectRepr.of("a", 1, "b", "2"),
                 JsonWriterOptions.readable());
    assertWrites("{\"a\":1,\"b\":\"2\"}",
                 ObjectRepr.of("a", 1, "b", "2"),
                 JsonWriterOptions.compact());
  }

  @Test
  public void writeNestedObjects() {
    assertWrites("{a: {b: 2}}",
                 ObjectRepr.of("a", ObjectRepr.of("b", 2)),
                 JsonWriterOptions.readable());
    assertWrites("{\"a\":{\"b\":2}}",
                 ObjectRepr.of("a", ObjectRepr.of("b", 2)),
                 JsonWriterOptions.compact());
  }

  public static void assertWrites(String expected, Repr value, JsonWriterOptions options) {
    JsonAssertions.assertWrites(expected, () -> Json.forType(Repr.class).write(value, Json.writer(options)));
  }

  public static void assertWrites(String expected, Repr value) {
    JsonAssertions.assertWrites(expected, () -> Json.forType(Repr.class).write(value, Json.writer(JsonWriterOptions.readable())));
    JsonAssertions.assertWrites(expected, () -> Json.forType(Repr.class).write(value, Json.writer(JsonWriterOptions.compact())));
  }

}
