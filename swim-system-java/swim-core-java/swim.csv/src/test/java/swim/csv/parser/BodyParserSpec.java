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

package swim.csv.parser;

import org.testng.annotations.Test;
import swim.codec.ParserException;
import swim.csv.Assertions;
import swim.csv.Csv;
import swim.csv.schema.CsvHeader;
import swim.csv.structure.CsvStructure;
import swim.structure.Item;
import swim.structure.Record;
import swim.structure.Slot;
import swim.structure.Value;
import static org.testng.Assert.ThrowingRunnable;
import static org.testng.Assert.assertThrows;

public class BodyParserSpec {
  @Test
  public void parseBodyWithPredefinedHeader() {
    assertParses("2,3\n5,7\n",
                 Record.of(Record.of(Slot.of("x", "2"), Slot.of("y", "3")),
                           Record.of(Slot.of("x", "5"), Slot.of("y", "7"))),
                 CsvStructure.header(CsvStructure.stringCol("x"),
                                     CsvStructure.stringCol("y")));
  }

  @Test
  public void parseBodyWithNestedCsvCells() {
    assertParses("1,2^3,4\n5,6^7,8\n",
                 Record.of(Record.of(Slot.of("a", 1), Slot.of("b", Record.of(Slot.of("c", 2), Slot.of("d", 3))), Slot.of("e", 4)),
                           Record.of(Slot.of("a", 5), Slot.of("b", Record.of(Slot.of("c", 6), Slot.of("d", 7))), Slot.of("e", 8))),
                 CsvStructure.header(CsvStructure.numberCol("a"),
                                     CsvStructure.parsedCol("b", Csv.rowParser('^', CsvStructure.header(CsvStructure.numberCol("c"),
                                                                                                        CsvStructure.numberCol("d")))),
                                     CsvStructure.numberCol("e")));
  }

  public static void assertParses(String csvString, Record expected, CsvHeader<Record, Value, Item> header) {
    assertParses(',', csvString, expected, header);
  }

  public static void assertParses(int delimiter, String csvString, Record expected, CsvHeader<Record, Value, Item> header) {
    Assertions.assertParses(Csv.bodyParser(delimiter, header), csvString, expected);
  }

  public static void assertParseFails(final String csvString, CsvHeader<Record, Value, Item> header) {
    assertParseFails(',', csvString, header);
  }

  public static void assertParseFails(final int delimiter, final String csvString, CsvHeader<Record, Value, Item> header) {
    assertThrows(ParserException.class, new ThrowingRunnable() {
      @Override
      public void run() throws Throwable {
        Csv.parseBody(delimiter, csvString, header);
      }
    });
  }
}
