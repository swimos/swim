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

public class RowParserSpec {
  @Test
  public void parseEmptyRow() {
    assertParses("", Record.empty(), CsvStructure.header());
  }

  @Test
  public void parseOneUnquotedCell() {
    assertParses("", Record.of(""),
                 CsvStructure.header(CsvStructure.stringCol()));
    assertParses("test", Record.of("test"),
                 CsvStructure.header(CsvStructure.stringCol()));
  }

  @Test
  public void parseManyUnquotedCells() {
    assertParses(",", Record.of("", ""),
                 CsvStructure.header(CsvStructure.stringCol(),
                                     CsvStructure.stringCol()));
    assertParses("foo,bar", Record.of("foo", "bar"),
                 CsvStructure.header(CsvStructure.stringCol(),
                                     CsvStructure.stringCol()));
    assertParses("a,b,c", Record.of("a", "b", "c"),
                 CsvStructure.header(CsvStructure.stringCol(),
                                     CsvStructure.stringCol(),
                                     CsvStructure.stringCol()));
  }

  @Test
  public void parseOneQuotedCell() {
    assertParses("\"\"", Record.of(""),
                 CsvStructure.header(CsvStructure.stringCol()));
    assertParses("\"test\"", Record.of("test"),
                 CsvStructure.header(CsvStructure.stringCol()));
  }

  @Test
  public void parsManyQuotedCells() {
    assertParses("\"\",\"\"", Record.of("", ""),
                 CsvStructure.header(CsvStructure.stringCol(),
                                     CsvStructure.stringCol()));
    assertParses("\"foo\",\"bar\"", Record.of("foo", "bar"),
                 CsvStructure.header(CsvStructure.stringCol(),
                                     CsvStructure.stringCol()));
    assertParses("\"a\",\"b\",\"c\"", Record.of("a", "b", "c"),
                 CsvStructure.header(CsvStructure.stringCol(),
                                     CsvStructure.stringCol(),
                                     CsvStructure.stringCol()));
  }

  @Test
  public void parseQuotedCellWithEscapes() {
    assertParses("\"Hello, \"\"world\"\"!\"", Record.of("Hello, \"world\"!"),
                 CsvStructure.header(CsvStructure.stringCol()));
  }

  @Test
  public void parseQuotedCellWithLineBreaks() {
    assertParses("\"Hello,\rworld!\"", Record.of("Hello,\rworld!"),
                 CsvStructure.header(CsvStructure.stringCol()));
    assertParses("\"Hello,\nworld!\"", Record.of("Hello,\nworld!"),
                 CsvStructure.header(CsvStructure.stringCol()));
    assertParses("\"Hello,\r\nworld!\"", Record.of("Hello,\r\nworld!"),
                 CsvStructure.header(CsvStructure.stringCol()));
  }

  @Test
  public void parsRowsWithDifferentDelimiters() {
    assertParses('^', "^", Record.of("", ""),
                 CsvStructure.header(CsvStructure.stringCol(),
                                     CsvStructure.stringCol()));
    assertParses('^', "foo^bar", Record.of("foo", "bar"),
                 CsvStructure.header(CsvStructure.stringCol(),
                                     CsvStructure.stringCol()));
    assertParses('^', "a^b^c", Record.of("a", "b", "c"),
                 CsvStructure.header(CsvStructure.stringCol(),
                                     CsvStructure.stringCol(),
                                     CsvStructure.stringCol()));
  }

  @Test
  public void parseParticularCells() {
    assertParses("2,3,5", Record.of(3),
                 CsvStructure.header(CsvStructure.nullCol(),
                                     CsvStructure.numberCol(),
                                     CsvStructure.nullCol()));
    assertParses("2,3,5", Record.of(3),
                 CsvStructure.header(CsvStructure.nullCol(),
                                     CsvStructure.numberCol()));
  }

  @Test
  public void parseArrayRows() {
    assertParses("2,3,5", Record.of(2, 3, 5),
                 CsvStructure.array(CsvStructure.numberCol()));
    assertParses("2,3,5,7,11", Record.of(2, 3, 5, 7, 11),
                 CsvStructure.array(CsvStructure.numberCol()));
  }

  @Test
  public void parsRowsWithNestedRows() {
    assertParses("1,2^3,4", Record.of(Slot.of("a", 1), Slot.of("b", Record.of(Slot.of("c", 2), Slot.of("d", 3))), Slot.of("e", 4)),
                 CsvStructure.header(CsvStructure.numberCol("a"),
                                     CsvStructure.parsedCol("b", Csv.rowParser('^', CsvStructure.header(CsvStructure.numberCol("c"),
                                                                                                        CsvStructure.numberCol("d")))),
                                     CsvStructure.numberCol("e")));
  }

  @Test
  public void parsRowsWithNestedRowsWithTooFewCells() {
    assertParses("1,2^3,4", Record.of(Slot.of("a", 1), Slot.of("b", Record.of(Slot.of("c", 2), Slot.of("d", 3))), Slot.of("f", 4)),
                 CsvStructure.header(CsvStructure.numberCol("a"),
                                     CsvStructure.parsedCol("b", Csv.rowParser('^', CsvStructure.header(CsvStructure.numberCol("c"),
                                                                                                        CsvStructure.numberCol("d"),
                                                                                                        CsvStructure.numberCol("e")))),
                                     CsvStructure.numberCol("f")));
  }

  @Test
  public void parsRowsWithNestedArrayRows() {
    assertParses("1,2;3,4", Record.of(Slot.of("a", 1), Slot.of("b", Record.of(2, 3)), Slot.of("e", 4)),
                 CsvStructure.header(CsvStructure.numberCol("a"),
                                     CsvStructure.parsedCol("b", Csv.rowParser(';', CsvStructure.array(CsvStructure.numberCol()))),
                                     CsvStructure.numberCol("e")));
  }

  @Test
  public void parsRowsWithOptionalCells() {
    assertParses(",,,", Record.empty(),
                 CsvStructure.header(CsvStructure.stringCol("a").optional(true),
                                     CsvStructure.stringCol("b").optional(true),
                                     CsvStructure.numberCol("c").optional(true),
                                     CsvStructure.numberCol("d").optional(true)));
    assertParses("1,,3,", Record.of(Slot.of("a", "1"), Slot.of("c", 3)),
                 CsvStructure.header(CsvStructure.stringCol("a").optional(true),
                                     CsvStructure.stringCol("b").optional(true),
                                     CsvStructure.numberCol("c").optional(true),
                                     CsvStructure.numberCol("d").optional(true)));
    assertParses(",2,,4", Record.of(Slot.of("b", "2"), Slot.of("d", 4)),
                 CsvStructure.header(CsvStructure.stringCol("a").optional(true),
                                     CsvStructure.stringCol("b").optional(true),
                                     CsvStructure.numberCol("c").optional(true),
                                     CsvStructure.numberCol("d").optional(true)));
    assertParses("1,2,3,4", Record.of(Slot.of("a", "1"), Slot.of("b", "2"), Slot.of("c", 3), Slot.of("d", 4)),
                 CsvStructure.header(CsvStructure.stringCol("a").optional(true),
                                     CsvStructure.stringCol("b").optional(true),
                                     CsvStructure.numberCol("c").optional(true),
                                     CsvStructure.numberCol("d").optional(true)));
  }

  @Test
  public void parseUnderflowRows() {
    assertParses("foo", Record.of("foo"),
                 CsvStructure.header(CsvStructure.stringCol(),
                                     CsvStructure.stringCol()));
    assertParses("a,b", Record.of("a", "b"),
                 CsvStructure.header(CsvStructure.stringCol(),
                                     CsvStructure.stringCol(),
                                     CsvStructure.stringCol()));
    assertParses("\"foo\"", Record.of("foo"),
                 CsvStructure.header(CsvStructure.stringCol(),
                                     CsvStructure.stringCol()));
    assertParses("\"a\",\"b\"", Record.of("a", "b"),
                 CsvStructure.header(CsvStructure.stringCol(),
                                     CsvStructure.stringCol(),
                                     CsvStructure.stringCol()));
  }

  @Test
  public void parseOverflowRows() {
    assertParses("foo,bar", Record.of("foo"),
                 CsvStructure.header(CsvStructure.stringCol()));
    assertParses("1,2,3", Record.of(1, 2),
                 CsvStructure.header(CsvStructure.numberCol(),
                                     CsvStructure.numberCol()));
    assertParses("\"foo\",\"bar\"", Record.of("foo"),
                 CsvStructure.header(CsvStructure.stringCol()));
    assertParses("\"a\",\"b\",\"c\"", Record.of("a", "b"),
                 CsvStructure.header(CsvStructure.stringCol(),
                                     CsvStructure.stringCol()));
  }

  @Test
  public void parseUnclosedQuotedCellsFails() {
    assertParseFails("\"test",
                     CsvStructure.header(CsvStructure.stringCol()));
    assertParseFails("foo,\"bar",
                     CsvStructure.header(CsvStructure.stringCol(),
                                         CsvStructure.stringCol()));
  }

  @Test
  public void parseQuoteInUnquotedCellsFails() {
    assertParseFails("test\"",
                     CsvStructure.header(CsvStructure.stringCol()));
  }

  public static void assertParses(String csvString, Value expected, CsvHeader<Record, Value, Item> header) {
    assertParses(',', csvString, expected, header);
  }

  public static void assertParses(int delimiter, String csvString, Value expected, CsvHeader<Record, Value, Item> header) {
    Assertions.assertParses(Csv.rowParser(delimiter, header), csvString, expected);
  }

  public static void assertParseFails(String csvString, CsvHeader<Record, Value, Item> header) {
    assertParseFails(',', csvString, header);
  }

  public static void assertParseFails(final int delimiter, final String csvString, CsvHeader<Record, Value, Item> header) {
    assertThrows(ParserException.class, new ThrowingRunnable() {
      @Override
      public void run() throws Throwable {
        Csv.parseRow(delimiter, csvString, header);
      }
    });
  }
}
