// Copyright 2015-2019 SWIM.AI inc.
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

import java.nio.charset.Charset;
import java.util.AbstractMap;
import java.util.Map;
import org.testng.TestException;
import org.testng.annotations.Test;
import swim.codec.Binary;
import swim.codec.OutputBuffer;
import swim.codec.Utf8;
import swim.codec.Writer;
import swim.structure.Attr;
import swim.structure.Bool;
import swim.structure.Data;
import swim.structure.Field;
import swim.structure.Item;
import swim.structure.Num;
import swim.structure.Record;
import swim.structure.Slot;
import swim.structure.Text;
import swim.structure.Value;
import static org.testng.Assert.assertEquals;
import static org.testng.Assert.assertFalse;
import static org.testng.Assert.assertTrue;

public class JsonWriterSpec {
  public static void assertWrites(Item item, byte... expected) {
    for (int i = 0, n = expected.length; i <= n; i += 1) {
      final byte[] actual = new byte[n];
      OutputBuffer<?> buffer = Binary.outputBuffer(actual);
      buffer = buffer.limit(i);
      Writer<?, ?> writer = Json.write(item, Utf8.decodedOutput(buffer).isPart(true));
      buffer = buffer.limit(buffer.capacity());
      writer = writer.pull(Utf8.decodedOutput(buffer).isPart(false));
      if (writer.isError()) {
        throw new TestException(writer.trap());
      }
      assertFalse(writer.isCont());
      assertTrue(writer.isDone());
      assertEquals(actual, expected);
    }
  }

  public static void assertWrites(Item item, String expected) {
    assertWrites(item, expected.getBytes(Charset.forName("UTF-8")));
  }

  @Test
  public void writeAbsent() {
    assertWrites(Value.absent(), "undefined");
  }

  @Test
  public void writeExtant() {
    assertWrites(Value.extant(), "null");
  }

  @Test
  public void writeBooleans() {
    assertWrites(Bool.from(true), "true");
    assertWrites(Bool.from(false), "false");
  }

  @Test
  public void writeNumbers() {
    assertWrites(Num.from(0), "0");
    assertWrites(Num.from(1), "1");
    assertWrites(Num.from(-1), "-1");
    assertWrites(Num.from(15), "15");
    assertWrites(Num.from(-20), "-20");
    assertWrites(Num.from(3.14), "3.14");
    assertWrites(Num.from(-0.5), "-0.5");
    assertWrites(Num.from(6.02E23), "6.02E23");
    assertWrites(Num.from(2147483647), "2147483647");
    assertWrites(Num.from(-2147483648), "-2147483648");
    assertWrites(Num.from(9223372036854775807L), "9223372036854775807");
    assertWrites(Num.from(-9223372036854775808L), "-9223372036854775808");
  }

  @Test
  public void writeEmptyData() {
    assertWrites(Data.empty(), "\"\"");
  }

  @Test
  public void writeNonEmptyData() {
    assertWrites(Data.fromBase64("AAAA"), "\"AAAA\"");
    assertWrites(Data.fromBase64("AAA="), "\"AAA=\"");
    assertWrites(Data.fromBase64("AA=="), "\"AA==\"");
    assertWrites(Data.fromBase64("ABCDabcd12/+"), "\"ABCDabcd12/+\"");
    assertWrites(Data.fromBase64("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789/+"),
                 "\"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789/+\"");
  }

  @Test
  public void writeEmptyStrings() {
    assertWrites(Text.empty(), "\"\"");
  }

  @Test
  public void writeNonEmptyStrings() {
    assertWrites(Text.from("test"), "\"test\"");
    assertWrites(Text.from("Hello, world!"), "\"Hello, world!\"");
  }

  @Test
  public void writeStringsWithEscapes() {
    assertWrites(Text.from("\"\\\b\f\n\r\t"), "\"\\\"\\\\\\b\\f\\n\\r\\t\"");
  }

  @Test
  public void writeStringsWithUnicodeEscapes() {
    assertWrites(Text.from("\0"), "\"\\u0000\"");
    assertWrites(Text.from("\u001F"), "\"\\u001F\"");
  }

  @Test
  public void writeEmptyRecords() {
    assertWrites(Record.empty(), "[]");
  }

  @Test
  public void writeNonEmptyArrays() {
    assertWrites(Record.of(1), "[1]");
    assertWrites(Record.of(1, 2, "3", true), "[1,2,\"3\",true]");
  }

  @Test
  public void writeNonEmptyObjects() {
    assertWrites(Record.of(Slot.of("a", 1)), "{\"a\":1}");
    assertWrites(Record.of(Slot.of("a", 1), Slot.of("b", "2")), "{\"a\":1,\"b\":\"2\"}");
  }

  @Test
  public void writeRecordsWithAttributes() {
    assertWrites(Record.of(Attr.of("a", 1)), "{\"@a\":1}");
    assertWrites(Record.of(Attr.of("a", 1), Attr.of("b", "2")), "{\"@a\":1,\"@b\":\"2\"}");
  }

  @Test
  public void writePartiallyKeyedRecords() {
    assertWrites(Record.of(Slot.of("a", 1), false, Slot.of("c", 3)), "{\"a\":1,\"$1\":false,\"c\":3}");
    assertWrites(Record.of(Attr.of("a", 1), 2, Attr.of("c", 3)), "{\"@a\":1,\"$1\":2,\"@c\":3}");
  }

  @Test
  public void writeRecordsWithNonStringKeys() {
    assertWrites(Record.of(Slot.of(Num.from(1), "a")), "{\"$0\":{\"$key\":1,\"$value\":\"a\"}}");
    assertWrites(Record.of(Slot.of(Num.from(1), "a"), Slot.of(Record.empty(), "b")),
                 "{\"$0\":{\"$key\":1,\"$value\":\"a\"},\"$1\":{\"$key\":[],\"$value\":\"b\"}}");
  }

  @Test
  public void writeNestedArrays() {
    assertWrites(Record.of(1, Record.of(2, 3), 4), "[1,[2,3],4]");
  }

  @Test
  public void writeNestedObjects() {
    assertWrites(Record.of(Slot.of("a", Record.of(Slot.of("b", 2)))), "{\"a\":{\"b\":2}}");
  }

  @Test
  public void writeNestedRecords() {
    assertWrites(Record.of(1, Record.of(Attr.of("b", 2), 3), Slot.of("d", 4)),
                 "{\"$0\":1,\"$1\":{\"@b\":2,\"$1\":3},\"d\":4}");
  }
  
  @Test
  public void writeAttributes() {
    assertWrites(Attr.of("foo", 1), "\"@foo\":1");
    assertWrites(Attr.of("bar", 2), "\"@bar\":2");
    assertWrites(Attr.of("baz", 3), "\"@baz\":3");
  }
  
  @Test
  public void writeFields() {
    Map.Entry<Integer, String> entry = new AbstractMap.SimpleEntry<>(42, "foo");
    assertWrites(Field.of(entry), "{\"$key\":42,\"$value\":\"foo\"}");
    
    entry = new AbstractMap.SimpleEntry<>(13, "bar");
    assertWrites(Field.of(entry), "{\"$key\":13,\"$value\":\"bar\"}");
  }
}
