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

import swim.codec.Diagnostic;
import swim.codec.Input;
import swim.codec.Parser;
import swim.csv.schema.CsvCol;
import swim.csv.schema.CsvHeader;
import swim.util.Builder;

final class RowParser<T, R, C> extends Parser<R> {
  final CsvParser csv;
  final CsvHeader<T, R, C> header;
  final Builder<C, R> rowBuilder;
  final Parser<? extends C> cellParser;
  final int index;
  final int head;
  final int step;

  RowParser(CsvParser csv, CsvHeader<T, R, C> header, Builder<C, R> rowBuilder,
            Parser<? extends C> cellParser, int index, int head, int step) {
    this.csv = csv;
    this.header = header;
    this.rowBuilder = rowBuilder;
    this.cellParser = cellParser;
    this.index = index;
    this.head = head;
    this.step = step;
  }

  RowParser(CsvParser csv, CsvHeader<T, R, C> header) {
    this(csv, header, null, null, 0, -1, 1);
  }

  @Override
  public Parser<R> feed(Input input) {
    return parse(input, this.csv, this.header, this.rowBuilder,
                 this.cellParser, this.index, this.head, this.step);
  }

  @SuppressWarnings("unchecked")
  static <T, R, C> Parser<R> parse(Input input, CsvParser csv, CsvHeader<T, R, C> header,
                                   Builder<C, R> rowBuilder, Parser<? extends C> cellParser,
                                   int index, int head, int step) {
    int c = 0;
    do {
      if (step == 1) {
        if (input.isCont()) {
          c = input.head();
          if (c == '\r' || c == '\n') {
            if (rowBuilder == null) {
              rowBuilder = header.rowBuilder();
            }
            return done(rowBuilder.bind());
          } else if (c == '"') {
            input = input.step();
            step = 3;
          } else {
            step = 2;
          }
        } else if (input.isDone()) {
          step = 2;
        }
      }
      if (step == 2) {
        final Input cellInput = new CsvInput(csv, input);
        CsvCol<C> col = null;
        if (cellParser == null) {
          if (index < header.colCount()) {
            col = (CsvCol<C>) header.getCol(index);
          } else {
            col = (CsvCol<C>) header.overflowCol();
          }
          cellParser = csv.parseCell(col, cellInput);
        }
        while (cellParser.isCont() && !cellInput.isEmpty()) {
          cellParser = cellParser.feed(cellInput);
        }
        if (cellParser.isDone()) {
          if (col == null) {
            if (index < header.colCount()) {
              col = (CsvCol<C>) header.getCol(index);
            } else {
              col = (CsvCol<C>) header.overflowCol();
            }
          }
          if (rowBuilder == null) {
            rowBuilder = header.rowBuilder();
          }
          col.addCell(cellParser.bind(), rowBuilder);
          cellParser = null;
          index += 1;
          step = 4;
        } else if (cellParser.isError()) {
          return cellParser.asError();
        }
      }
      if (step == 3) {
        final Input cellInput = new CsvQuotedInput('"', input, head);
        CsvCol<C> col = null;
        if (cellParser == null) {
          if (index < header.colCount()) {
            col = (CsvCol<C>) header.getCol(index);
          } else {
            col = (CsvCol<C>) header.overflowCol();
          }
          cellParser = csv.parseCell(col, cellInput);
        }
        while (cellParser.isCont() && !cellInput.isEmpty()) {
          cellParser = cellParser.feed(cellInput);
        }
        if (cellInput instanceof CsvQuotedInput) {
          head = ((CsvQuotedInput) cellInput).next();
        }
        if (head == -4) {
          return error(Diagnostic.expected('"', input));
        } else if (cellParser.isDone()) {
          if (col == null) {
            if (index < header.colCount()) {
              col = (CsvCol<C>) header.getCol(index);
            } else {
              col = (CsvCol<C>) header.overflowCol();
            }
          }
          if (rowBuilder == null) {
            rowBuilder = header.rowBuilder();
          }
          col.addCell(cellParser.bind(), rowBuilder);
          cellParser = null;
          head = -1;
          index += 1;
          step = 4;
        } else if (cellParser.isError()) {
          return cellParser.asError();
        }
      }
      if (step == 4) {
        if (input.isCont()) {
          c = input.head();
          if (c == '\r' || c == '\n') {
            if (rowBuilder == null) {
              rowBuilder = header.rowBuilder();
            }
            return done(rowBuilder.bind());
          } else if (csv.isDelimiter(c)) {
            input = input.step();
            step = 1;
            continue;
          } else {
            return error(Diagnostic.expected("delimiter", input));
          }
        } else if (input.isDone()) {
          if (rowBuilder == null) {
            rowBuilder = header.rowBuilder();
          }
          return done(rowBuilder.bind());
        }
      }
      break;
    } while (true);
    if (input.isError()) {
      return error(input.trap());
    }
    return new RowParser<T, R, C>(csv, header, rowBuilder, cellParser, index, head, step);
  }

  static <T, R, C> Parser<R> parse(Input input, CsvParser csv, CsvHeader<T, R, C> header) {
    return parse(input, csv, header, null, null, 0, -1, 1);
  }
}
