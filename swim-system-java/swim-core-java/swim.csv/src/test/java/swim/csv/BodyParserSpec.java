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

package swim.csv;

import org.testng.annotations.Test;
import swim.codec.ParserException;
import swim.structure.Item;
import swim.structure.Record;
import swim.structure.Slot;
import swim.structure.Value;
import static org.testng.Assert.ThrowingRunnable;
import static org.testng.Assert.assertThrows;

public class BodyParserSpec {
  @Test
  public void parseBodyWithPredefinedRows() {
    assertParses("2,3\n5,7\n",
                 Record.of(Record.of(Slot.of("x", "2"), Slot.of("y", "3")),
                           Record.of(Slot.of("x", "5"), Slot.of("y", "7"))),
                 Csv.header().textCol("x").textCol("y"));
  }

  @Test
  public void parseBodyWithNestedCsvCells() {
    assertParses("1,2^3,4\n5,6^7,8\n",
                 Record.of(Record.of(Slot.of("a", 1), Slot.of("b", Record.of(Slot.of("c", 2), Slot.of("d", 3))), Slot.of("e", 4)),
                           Record.of(Slot.of("a", 5), Slot.of("b", Record.of(Slot.of("c", 6), Slot.of("d", 7))), Slot.of("e", 8))),
                 Csv.header().numberCol("a")
                             .itemCol("b", Csv.rowParser('^', Csv.header().numberCol("c").numberCol("d")))
                             .numberCol("e"));
  }

  public static void assertParses(String csv, Value expected, CsvHeader<Item> header) {
    assertParses(',', csv, expected, header);
  }

  public static void assertParses(int delimiter, String csv, Value expected, CsvHeader<Item> header) {
    Assertions.assertParses(Csv.bodyParser(delimiter, header), csv, expected);
  }

  public static void assertParseFails(final String csv, CsvHeader<Item> header) {
    assertParseFails(',', csv, header);
  }

  public static void assertParseFails(final int delimiter, final String csv, CsvHeader<Item> header) {
    assertThrows(ParserException.class, new ThrowingRunnable() {
      @Override
      public void run() throws Throwable {
        Csv.parse(delimiter, csv, header);
      }
    });
  }
}
