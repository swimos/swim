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
import swim.codec.Diagnostic;
import swim.codec.Input;
import swim.codec.Parser;
import swim.codec.ParserException;
import swim.codec.Unicode;
import swim.collections.FingerTrieSeq;
import swim.structure.Item;
import swim.structure.Record;
import swim.structure.Slot;
import swim.structure.Value;
import static org.testng.Assert.ThrowingRunnable;
import static org.testng.Assert.assertThrows;

@SuppressWarnings("unchecked")
public class RowParserSpec {
  @Test
  public void parseEmptyRow() {
    assertParses("", Record.empty());
  }

  @Test
  public void parseOneUnquotedCell() {
    assertParses("", Record.of(""), Csv.textCellParser());
    assertParses("test", Record.of("test"), Csv.textCellParser());
  }

  @Test
  public void parseManyUnquotedCells() {
    assertParses(",", Record.of("", ""), Csv.textCellParser(), Csv.textCellParser());
    assertParses("foo,bar", Record.of("foo", "bar"), Csv.textCellParser(), Csv.textCellParser());
    assertParses("a,b,c", Record.of("a", "b", "c"), Csv.textCellParser(), Csv.textCellParser(), Csv.textCellParser());
  }

  @Test
  public void parseOneQuotedCell() {
    assertParses("\"\"", Record.of(""), Csv.textCellParser());
    assertParses("\"test\"", Record.of("test"), Csv.textCellParser());
  }

  @Test
  public void parsManyQuotedCells() {
    assertParses("\"\",\"\"", Record.of("", ""), Csv.textCellParser(), Csv.textCellParser());
    assertParses("\"foo\",\"bar\"", Record.of("foo", "bar"), Csv.textCellParser(), Csv.textCellParser());
    assertParses("\"a\",\"b\",\"c\"", Record.of("a", "b", "c"), Csv.textCellParser(), Csv.textCellParser(), Csv.textCellParser());
  }

  @Test
  public void parseQuotedCellWithEscapes() {
    assertParses("\"Hello, \"\"world\"\"!\"", Record.of("Hello, \"world\"!"), Csv.textCellParser());
  }

  @Test
  public void parsRowsWithDifferentDelimiters() {
    assertParses('^', "^", Record.of("", ""), Csv.textCellParser(), Csv.textCellParser());
    assertParses('^', "foo^bar", Record.of("foo", "bar"), Csv.textCellParser(), Csv.textCellParser());
    assertParses('^', "a^b^c", Record.of("a", "b", "c"), Csv.textCellParser(), Csv.textCellParser(), Csv.textCellParser());
  }

  @Test
  public void parsRowsWithNestedCsvCells() {
    assertParses("1,2^3,4", Record.of(Slot.of("a", 1), Slot.of("b", Record.of(Slot.of("c", 2), Slot.of("d", 3))), Slot.of("e", 4)),
                 Csv.numberCellParser("a"),
                 Csv.itemCellParser("b", Csv.structureParser('^').rowParser(FingerTrieSeq.of(Csv.numberCellParser("c"), Csv.numberCellParser("d")))),
                 Csv.numberCellParser("e"));
  }

  @Test
  public void parsRowsWithOptionalCells() {
    assertParses(",,,", Record.empty(),
                 Csv.optionalTextCellParser("a"), Csv.optionalTextCellParser("b"),
                 Csv.optionalNumberCellParser("c"), Csv.optionalNumberCellParser("d"));
    assertParses("1,,3,", Record.of(Slot.of("a", "1"), Slot.of("c", 3)),
                 Csv.optionalTextCellParser("a"), Csv.optionalTextCellParser("b"),
                 Csv.optionalNumberCellParser("c"), Csv.optionalNumberCellParser("d"));
    assertParses(",2,,4", Record.of(Slot.of("b", "2"), Slot.of("d", 4)),
                 Csv.optionalTextCellParser("a"), Csv.optionalTextCellParser("b"),
                 Csv.optionalNumberCellParser("c"), Csv.optionalNumberCellParser("d"));
    assertParses("1,2,3,4", Record.of(Slot.of("a", "1"), Slot.of("b", "2"), Slot.of("c", 3), Slot.of("d", 4)),
                 Csv.optionalTextCellParser("a"), Csv.optionalTextCellParser("b"),
                 Csv.optionalNumberCellParser("c"), Csv.optionalNumberCellParser("d"));
  }

  @Test
  public void parseUnclosedQuotedCellsFails() {
    assertParseFails("\"test", Csv.textCellParser());
    assertParseFails("foo,\"bar", Csv.textCellParser(), Csv.textCellParser());
  }

  @Test
  public void parseQuoteInUnquotedCellsFails() {
    assertParseFails("test\"", Csv.textCellParser());
  }

  @Test
  public void parseTooFewCellsFails() {
    assertParseFails("foo", Csv.textCellParser(), Csv.textCellParser());
    assertParseFails("a,b", Csv.textCellParser(), Csv.textCellParser(), Csv.textCellParser());
    assertParseFails("\"foo\"", Csv.textCellParser(), Csv.textCellParser());
    assertParseFails("\"a\",\"b\"", Csv.textCellParser(), Csv.textCellParser(), Csv.textCellParser());
  }

  @Test
  public void parseTooManyCellsFails() {
    assertParseFails("foo,bar", Csv.textCellParser());
    assertParseFails("a,b,c", Csv.textCellParser(), Csv.textCellParser());
    assertParseFails("\"foo\",\"bar\"", Csv.textCellParser());
    assertParseFails("\"a\",\"b\",\"c\"", Csv.textCellParser(), Csv.textCellParser());
  }

  public static void assertParses(String csv, Value expected, Parser<Item>... cellParsers) {
    assertParses(',', csv, expected, cellParsers);
  }

  public static void assertParses(int delimiter, String csv, Value expected, Parser<Item>... cellParsers) {
    Assertions.assertParses(Csv.structureParser(delimiter).rowParser(FingerTrieSeq.of(cellParsers)), csv, expected);
  }

  public static void assertParseFails(String csv, Parser<Item>... cellParsers) {
    assertParseFails(',', csv, cellParsers);
  }

  public static void assertParseFails(final int delimiter, final String csv, Parser<Item>... cellParsers) {
    assertThrows(ParserException.class, new ThrowingRunnable() {
      @Override
      public void run() throws Throwable {
        final Input input = Unicode.stringInput(csv);
        Parser<Item> parser = Csv.structureParser(delimiter).parseRow(input, FingerTrieSeq.of(cellParsers));
        if (input.isCont() && !parser.isError()) {
          parser = Parser.error(Diagnostic.unexpected(input));
        } else if (input.isError()) {
          parser = Parser.error(input.trap());
        }
        parser.bind();
      }
    });
  }
}
