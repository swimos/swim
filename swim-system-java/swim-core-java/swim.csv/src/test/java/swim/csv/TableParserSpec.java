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
import swim.codec.Parser;
import swim.codec.ParserException;
import swim.collections.FingerTrieSeq;
import swim.structure.Item;
import swim.structure.Record;
import swim.structure.Slot;
import swim.structure.Value;
import static org.testng.Assert.ThrowingRunnable;
import static org.testng.Assert.assertThrows;

@SuppressWarnings("unchecked")
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
  public void parseTableWithPredefinedRows() {
    assertParses("2,3\n5,7\n",
                 Record.of(Record.of(Slot.of("x", "2"), Slot.of("y", "3")),
                           Record.of(Slot.of("x", "5"), Slot.of("y", "7"))),
                 Csv.textCellParser("x"), Csv.textCellParser("y"));
  }

  @Test
  public void parseTableWithNestedCsvCells() {
    assertParses("1,2^3,4\n5,6^7,8\n",
                 Record.of(Record.of(Slot.of("a", 1), Slot.of("b", Record.of(Slot.of("c", 2), Slot.of("d", 3))), Slot.of("e", 4)),
                           Record.of(Slot.of("a", 5), Slot.of("b", Record.of(Slot.of("c", 6), Slot.of("d", 7))), Slot.of("e", 8))),
                 Csv.numberCellParser("a"),
                 Csv.itemCellParser("b", Csv.structureParser('^').rowParser(FingerTrieSeq.of(Csv.numberCellParser("c"), Csv.numberCellParser("d")))),
                 Csv.numberCellParser("e"));
  }

  public static void assertParses(String csv, Value expected) {
    assertParses(',', csv, expected);
  }

  public static void assertParses(int delimiter, String csv, Value expected) {
    Assertions.assertParses(Csv.structureParser(delimiter).tableParser(), csv, expected);
  }

  public static void assertParseFails(final String csv) {
    assertParseFails(',', csv);
  }

  public static void assertParseFails(final int delimiter, final String csv) {
    assertThrows(ParserException.class, new ThrowingRunnable() {
      @Override
      public void run() throws Throwable {
        Csv.structureParser(delimiter).parseTableString(csv);
      }
    });
  }

  public static void assertParses(String csv, Value expected, Parser<Item>... cellParsers) {
    assertParses(',', csv, expected, cellParsers);
  }

  public static void assertParses(int delimiter, String csv, Value expected, Parser<Item>... cellParsers) {
    Assertions.assertParses(Csv.structureParser(delimiter).tableParser(FingerTrieSeq.of(cellParsers)), csv, expected);
  }

  public static void assertParseFails(final String csv, Parser<Item>... cellParsers) {
    assertParseFails(',', csv, cellParsers);
  }

  public static void assertParseFails(final int delimiter, final String csv, Parser<Item>... cellParsers) {
    assertThrows(ParserException.class, new ThrowingRunnable() {
      @Override
      public void run() throws Throwable {
        Csv.structureParser(delimiter).parseTableString(csv, FingerTrieSeq.of(cellParsers));
      }
    });
  }
}
