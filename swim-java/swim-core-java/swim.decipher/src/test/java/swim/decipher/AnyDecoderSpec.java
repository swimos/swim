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

package swim.decipher;

import org.testng.annotations.Test;
import swim.structure.Attr;
import swim.structure.Bool;
import swim.structure.Data;
import swim.structure.Num;
import swim.structure.Record;
import swim.structure.Slot;
import swim.structure.Text;
import swim.structure.Value;

public class AnyDecoderSpec {
  public static void assertDecodes(Data data, Value value) {
    Assertions.assertDecodes(Decipher.structureDecoder().anyDecoder(), data, value);
  }

  public static void assertDecodes(String text, Value value) {
    Assertions.assertDecodes(Decipher.structureDecoder().anyDecoder(), Data.fromUtf8(text), value);
  }

  @Test
  public void decodeAnyXml() {
    assertDecodes("<test/>", Record.of(Attr.of("test")));
    assertDecodes("<!DOCTYPE html><test/>",
                  Record.of(Attr.of("xml:doctype", "html"), Attr.of("test")));
  }

  @Test
  public void decodeAnyJson() {
    assertDecodes("{}", Record.empty());
    assertDecodes("{\"a\":1,\"b\":2}", Record.of(Slot.of("a", 1), Slot.of("b", 2)));
  }

  @Test
  public void decodeAnyRecon() {
    assertDecodes("%", Data.empty());
    assertDecodes("%ABCDabcd12/+", Data.fromBase64("ABCDabcd12/+"));
    assertDecodes("\"\"", Text.empty());
    assertDecodes("''", Text.empty());
    assertDecodes("\"test\"", Text.from("test"));
    assertDecodes("'test'", Text.from("test"));
    assertDecodes("test", Text.from("test"));
    assertDecodes("3.14", Num.from(3.14));
    assertDecodes("-0.5", Num.from(-0.5));
    assertDecodes("true", Bool.from(true));
    assertDecodes("false", Bool.from(false));
    assertDecodes("{}", Record.empty());
    assertDecodes("[]", Record.empty());
    assertDecodes("@test", Record.of(Attr.of("test")));
    assertDecodes("1,2,3,4", Record.of(1, 2, 3, 4));
    assertDecodes("{1,2,3,4}", Record.of(1, 2, 3, 4));
  }

  @Test
  public void decodeAnyProtobuf() {
    assertDecodes(Data.fromBase16("089601"), Record.of(Slot.of(Num.from(1), 150)));
    assertDecodes(Data.fromBase16("120774657374696E67"),
                  Record.of(Slot.of(Num.from(2), "testing")));
    assertDecodes(Data.fromBase16("1A03089601"),
                  Record.of(Slot.of(Num.from(3), Record.of(Slot.of(Num.from(1), 150)))));
  }

  @Test
  public void decodeAnyText() {
    assertDecodes("The quick brown fox jumps over the lazy dog",
                  Text.from("The quick brown fox jumps over the lazy dog"));
    assertDecodes("<nothtml> The quick brown fox jumps over the lazy dog",
                  Text.from("<nothtml> The quick brown fox jumps over the lazy dog"));
    assertDecodes("{notjson: true} The quick brown fox jumps over the lazy dog",
                  Text.from("{notjson: true} The quick brown fox jumps over the lazy dog"));
    assertDecodes("@notrecon The quick brown fox jumps over the lazy dog",
                  Text.from("@notrecon The quick brown fox jumps over the lazy dog"));
  }

  @Test
  public void decodeAnyData() {
    assertDecodes(Data.fromBase16("00"), Data.fromBase16("00"));
    assertDecodes(Data.fromBase16("FFFF"), Data.fromBase16("FFFF"));
    assertDecodes(Data.fromBase16("FFFFFFFF"), Data.fromBase16("FFFFFFFF"));
    assertDecodes(Data.fromBase16("0123456789ABCDEF"), Data.fromBase16("0123456789ABCDEF"));
    assertDecodes(Data.fromBase16("FEDCBA9876543210"), Data.fromBase16("FEDCBA9876543210"));
  }
}
