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

  public static void assertParses(String csv, Value expected) {
    assertParses(',', csv, expected);
  }

  public static void assertParses(int delimiter, String csv, Value expected) {
    Assertions.assertParses(Csv.parser(delimiter), csv, expected);
  }

  public static void assertParseFails(final String csv) {
    assertParseFails(',', csv);
  }

  public static void assertParseFails(final int delimiter, final String csv) {
    assertThrows(ParserException.class, new ThrowingRunnable() {
      @Override
      public void run() throws Throwable {
        Csv.parse(delimiter, csv);
      }
    });
  }
}
