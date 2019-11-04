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

public class TableParserSpec {
  @Test
  public void parseTableWithNoRows() {
    assertParses("foo,bar\r\n", Record.empty());
  }

  @Test
  public void parseTableWithOneRow() {
    assertParses("x,y\r\n2,3", Record.of(Record.of(Slot.of("x", "2"), Slot.of("y", "3"))));
    assertParses("x,y\r\n2,3\r\n", Record.of(Record.of(Slot.of("x", "2"), Slot.of("y", "3"))));
  }

  @Test
  public void parseTableWithManyRows() {
    assertParses("x,y\r\n2,3\r\n5,7", Record.of(Record.of(Slot.of("x", "2"), Slot.of("y", "3")),
                                                Record.of(Slot.of("x", "5"), Slot.of("y", "7"))));
    assertParses("x,y\r\n2,3\r\n5,7\r\n", Record.of(Record.of(Slot.of("x", "2"), Slot.of("y", "3")),
                                                    Record.of(Slot.of("x", "5"), Slot.of("y", "7"))));
    assertParses("x,y\r2,3\r5,7", Record.of(Record.of(Slot.of("x", "2"), Slot.of("y", "3")),
                                            Record.of(Slot.of("x", "5"), Slot.of("y", "7"))));
    assertParses("x,y\r2,3\r5,7\r", Record.of(Record.of(Slot.of("x", "2"), Slot.of("y", "3")),
                                              Record.of(Slot.of("x", "5"), Slot.of("y", "7"))));
    assertParses("x,y\n2,3\n5,7", Record.of(Record.of(Slot.of("x", "2"), Slot.of("y", "3")),
                                            Record.of(Slot.of("x", "5"), Slot.of("y", "7"))));
    assertParses("x,y\n2,3\n5,7\n", Record.of(Record.of(Slot.of("x", "2"), Slot.of("y", "3")),
                                              Record.of(Slot.of("x", "5"), Slot.of("y", "7"))));
  }

  @Test
  public void parseTableWithQuotedCells() {
    assertParses("title,author\r\n\"Moby Dick\",\"Herman Melville\"",
                 Record.of(Record.of(Slot.of("title", "Moby Dick"), Slot.of("author", "Herman Melville"))));
    assertParses("title,author\r\n\"Moby Dick\",\"Herman Melville\"\r\n",
                 Record.of(Record.of(Slot.of("title", "Moby Dick"), Slot.of("author", "Herman Melville"))));
  }

  @Test
  public void parseTableWithPredefinedHeader() {
    assertParses("X,Y\n2,3\n5,7\n",
                 Record.of(Record.of(Slot.of("x", 2), Slot.of("y", 3)),
                           Record.of(Slot.of("x", 5), Slot.of("y", 7))),
                 CsvStructure.header(CsvStructure.numberCol("x"),
                                     CsvStructure.numberCol("y")));
  }

  @Test
  public void parseTableWithExtendedPredefinedHeader() {
    assertParses("x,y,z\n2,3,5\n7,9,11\n",
                 Record.of(Record.of(Slot.of("x", "2"), Slot.of("y", "3"), Slot.of("z", "5")),
                           Record.of(Slot.of("x", "7"), Slot.of("y", "9"), Slot.of("z", "11"))),
                 CsvStructure.header(CsvStructure.stringCol("x"),
                                     CsvStructure.stringCol("y")));
  }

  public static void assertParses(String csvString, Record expected) {
    assertParses(',', csvString, expected, CsvStructure.header());
  }

  public static void assertParses(String csvString, Record expected, CsvHeader<Record, Value, Item> header) {
    assertParses(',', csvString, expected, header);
  }

  public static void assertParses(int delimiter, String csvString, Record expected, CsvHeader<Record, Value, Item> header) {
    Assertions.assertParses(Csv.tableParser(delimiter, header), csvString, expected);
  }

  public static void assertParseFails(final String csvString) {
    assertParseFails(',', csvString, CsvStructure.header());
  }

  public static void assertParseFails(final String csvString, final CsvHeader<Record, Value, Item> header) {
    assertParseFails(',', csvString, header);
  }

  public static void assertParseFails(final int delimiter, final String csvString, final CsvHeader<Record, Value, Item> header) {
    assertThrows(ParserException.class, new ThrowingRunnable() {
      @Override
      public void run() throws Throwable {
        Csv.parseTable(delimiter, csvString, header);
      }
    });
  }
}
