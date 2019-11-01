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

public class RowParserSpec {
  @Test
  public void parseEmptyRow() {
    assertParses("", Record.empty(), Csv.header());
  }

  @Test
  public void parseOneUnquotedCell() {
    assertParses("", Record.of(""), Csv.header().textCol());
    assertParses("test", Record.of("test"), Csv.header().textCol());
  }

  @Test
  public void parseManyUnquotedCells() {
    assertParses(",", Record.of("", ""), Csv.header().textCol().textCol());
    assertParses("foo,bar", Record.of("foo", "bar"), Csv.header().textCol().textCol());
    assertParses("a,b,c", Record.of("a", "b", "c"), Csv.header().textCol().textCol().textCol());
  }

  @Test
  public void parseOneQuotedCell() {
    assertParses("\"\"", Record.of(""), Csv.header().textCol());
    assertParses("\"test\"", Record.of("test"), Csv.header().textCol());
  }

  @Test
  public void parsManyQuotedCells() {
    assertParses("\"\",\"\"", Record.of("", ""), Csv.header().textCol().textCol());
    assertParses("\"foo\",\"bar\"", Record.of("foo", "bar"), Csv.header().textCol().textCol());
    assertParses("\"a\",\"b\",\"c\"", Record.of("a", "b", "c"), Csv.header().textCol().textCol().textCol());
  }

  @Test
  public void parseQuotedCellWithEscapes() {
    assertParses("\"Hello, \"\"world\"\"!\"", Record.of("Hello, \"world\"!"), Csv.header().textCol());
  }

  @Test
  public void parsRowsWithDifferentDelimiters() {
    assertParses("^", Record.of("", ""), Csv.header().textCol().textCol(), '^');
    assertParses("foo^bar", Record.of("foo", "bar"), Csv.header().textCol().textCol(), '^');
    assertParses("a^b^c", Record.of("a", "b", "c"), Csv.header().textCol().textCol().textCol(), '^');
  }

  @Test
  public void parsRowsWithNestedCsvCells() {
    assertParses("1,2^3,4", Record.of(Slot.of("a", 1), Slot.of("b", Record.of(Slot.of("c", 2), Slot.of("d", 3))), Slot.of("e", 4)),
                 Csv.header().numberCol("a")
                             .itemCol("b", Csv.rowParser(Csv.header().numberCol("c").numberCol("d"), '^'))
                             .numberCol("e"));
  }

  @Test
  public void parsRowsWithOptionalCells() {
    assertParses(",,,", Record.empty(),
                 Csv.header().textCol("a").optional(true)
                             .textCol("b").optional(true)
                             .numberCol("c").optional(true)
                             .numberCol("d").optional(true));
    assertParses("1,,3,", Record.of(Slot.of("a", "1"), Slot.of("c", 3)),
                 Csv.header().textCol("a").optional(true)
                             .textCol("b").optional(true)
                             .numberCol("c").optional(true)
                             .numberCol("d").optional(true));
    assertParses(",2,,4", Record.of(Slot.of("b", "2"), Slot.of("d", 4)),
                 Csv.header().textCol("a").optional(true)
                             .textCol("b").optional(true)
                             .numberCol("c").optional(true)
                             .numberCol("d").optional(true));
    assertParses("1,2,3,4", Record.of(Slot.of("a", "1"), Slot.of("b", "2"), Slot.of("c", 3), Slot.of("d", 4)),
                 Csv.header().textCol("a").optional(true)
                             .textCol("b").optional(true)
                             .numberCol("c").optional(true)
                             .numberCol("d").optional(true));
  }

  @Test
  public void parseTooFewCells() {
    assertParses("foo", Record.of("foo"), Csv.header().textCol().textCol());
    assertParses("a,b", Record.of("a", "b"), Csv.header().textCol().textCol().textCol());
    assertParses("\"foo\"", Record.of("foo"), Csv.header().textCol().textCol());
    assertParses("\"a\",\"b\"", Record.of("a", "b"), Csv.header().textCol().textCol().textCol());
  }

  @Test
  public void parseTooManyCellsFails() {
    assertParseFails("foo,bar", Csv.header().textCol());
    assertParseFails("a,b,c", Csv.header().textCol().textCol());
    assertParseFails("\"foo\",\"bar\"", Csv.header().textCol());
    assertParseFails("\"a\",\"b\",\"c\"", Csv.header().textCol().textCol());
  }

  @Test
  public void parseUnclosedQuotedCellsFails() {
    assertParseFails("\"test", Csv.header().textCol());
    assertParseFails("foo,\"bar", Csv.header().textCol().textCol());
  }

  @Test
  public void parseQuoteInUnquotedCellsFails() {
    assertParseFails("test\"", Csv.header().textCol());
  }

  public static void assertParses(String csvString, Value expected, CsvHeader<Item> header) {
    assertParses(csvString, expected, header, ',');
  }

  public static void assertParses(String csvString, Value expected, CsvHeader<Item> header, int delimiter) {
    Assertions.assertParses(Csv.rowParser(header, delimiter), csvString, expected);
  }

  public static void assertParseFails(String csvString, CsvHeader<Item> header) {
    assertParseFails(csvString, header, ',');
  }

  public static void assertParseFails(final String csvString, CsvHeader<Item> header, final int delimiter) {
    assertThrows(ParserException.class, new ThrowingRunnable() {
      @Override
      public void run() throws Throwable {
        Csv.parseRow(csvString, header, delimiter);
      }
    });
  }
}
