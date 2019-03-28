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
import swim.codec.ParserException;
import swim.structure.Attr;
import swim.structure.Bool;
import swim.structure.Data;
import swim.structure.Num;
import swim.structure.Record;
import swim.structure.Slot;
import swim.structure.Text;
import swim.structure.Value;
import static org.testng.Assert.ThrowingRunnable;
import static org.testng.Assert.assertThrows;

public class AnyParserSpec {
  public static void assertParses(String any, Value expected) {
    Assertions.assertParses(Decipher.structureParser().anyParser(), any, expected);
    Assertions.assertParses(Decipher.structureParser().anyParser(), " " + any + " ", expected);
  }

  public static void assertParseFails(final String any) {
    assertThrows(ParserException.class, new ThrowingRunnable() {
      @Override
      public void run() throws Throwable {
        Decipher.structureParser().parseAnyString(any);
      }
    });
  }

  @Test
  public void parseAnyXml() {
    assertParses("<test/>", Record.of(Attr.of("test")));
    assertParses("<!DOCTYPE html><test/>",
                 Record.of(Attr.of("xml:doctype", "html"), Attr.of("test")));
  }

  @Test
  public void parseAnyJson() {
    assertParses("{}", Record.empty());
    assertParses("{\"a\":1,\"b\":2}", Record.of(Slot.of("a", 1), Slot.of("b", 2)));
  }

  @Test
  public void parseAnyRecon() {
    assertParses("%", Data.empty());
    assertParses("%ABCDabcd12/+", Data.fromBase64("ABCDabcd12/+"));
    assertParses("\"\"", Text.empty());
    assertParses("''", Text.empty());
    assertParses("\"test\"", Text.from("test"));
    assertParses("'test'", Text.from("test"));
    assertParses("test", Text.from("test"));
    assertParses("3.14", Num.from(3.14));
    assertParses("-0.5", Num.from(-0.5));
    assertParses("true", Bool.from(true));
    assertParses("false", Bool.from(false));
    assertParses("{}", Record.empty());
    assertParses("[]", Record.empty());
    assertParses("@test", Record.of(Attr.of("test")));
    assertParses("1,2,3,4", Record.of(1, 2, 3, 4));
    assertParses("{1,2,3,4}", Record.of(1, 2, 3, 4));
  }
}
