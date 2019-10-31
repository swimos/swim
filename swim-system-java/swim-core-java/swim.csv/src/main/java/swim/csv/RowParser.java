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

import swim.codec.Diagnostic;
import swim.codec.Input;
import swim.codec.Parser;
import swim.util.Builder;

final class RowParser<T, R, C> extends Parser<R> {
  final CsvParser<T, R, C> csv;
  final CsvHeader<C> header;
  final Parser<?> valueParser;
  final Builder<C, R> rowBuilder;
  final int index;
  final int head;
  final int step;

  RowParser(CsvParser<T, R, C> csv, CsvHeader<C> header, Parser<?> valueParser,
            Builder<C, R> rowBuilder, int index, int head, int step) {
    this.csv = csv;
    this.header = header;
    this.valueParser = valueParser;
    this.rowBuilder = rowBuilder;
    this.index = index;
    this.head = head;
    this.step = step;
  }

  RowParser(CsvParser<T, R, C> csv, CsvHeader<C> header) {
    this(csv, header, null, null, 0, -1, 1);
  }

  @Override
  public Parser<R> feed(Input input) {
    return parse(input, this.csv, this.header, this.valueParser,
                 this.rowBuilder, this.index, this.head, this.step);
  }

  static <T, R, C> Parser<R> parse(Input input, CsvParser<T, R, C> csv, CsvHeader<C> header,
                                   Parser<?> valueParser, Builder<C, R> rowBuilder,
                                   int index, int head, int step) {
    do {
      if (step == 1) {
        if (index >= header.size()) {
          step = 4;
        } else if (input.isCont() && input.head() == '"') {
          input = input.step();
          step = 3;
        } else if (!input.isEmpty()) {
          step = 2;
        }
      }
      if (step == 2) {
        final Input cellInput = new CsvInput(csv, input);
        if (valueParser == null) {
          if (rowBuilder == null) {
            rowBuilder = csv.rowBuilder();
          }
          valueParser = header.get(index).parseCell(cellInput, rowBuilder);
          index += 1;
        }
        while (valueParser.isCont() && !cellInput.isEmpty()) {
          valueParser = valueParser.feed(cellInput);
        }
        if (valueParser.isDone()) {
          valueParser = null;
          step = 4;
        } else if (valueParser.isError()) {
          return valueParser.asError();
        }
      }
      if (step == 3) {
        final Input cellInput = new CsvQuotedInput('"', input, head);
        if (valueParser == null) {
          if (rowBuilder == null) {
            rowBuilder = csv.rowBuilder();
          }
          valueParser = header.get(index).parseCell(cellInput, rowBuilder);
          index += 1;
        }
        while (valueParser.isCont() && !cellInput.isEmpty()) {
          valueParser = valueParser.feed(cellInput);
        }
        if (cellInput instanceof CsvQuotedInput) {
          head = ((CsvQuotedInput) cellInput).next();
        }
        if (head == -4) {
          return error(Diagnostic.expected('"', input));
        } else if (valueParser.isDone()) {
          valueParser = null;
          head = -1;
          step = 4;
        } else if (valueParser.isError()) {
          return valueParser.asError();
        }
      }
      if (step == 4) {
        if (index >= header.size()) {
          if (rowBuilder == null) {
            rowBuilder = csv.rowBuilder();
          }
          return done(rowBuilder.bind());
        } else if (input.isCont() && csv.isDelimiter(input.head())) {
          input = input.step();
          step = 1;
          continue;
        } else if (!input.isEmpty()) {
          return error(Diagnostic.expected("delimiter", input));
        }
      }
      break;
    } while (true);
    if (input.isError()) {
      return error(input.trap());
    }
    return new RowParser<T, R, C>(csv, header, valueParser, rowBuilder, index, head, step);
  }

  static <T, R, C> Parser<R> parse(Input input, CsvParser<T, R, C> csv, CsvHeader<C> header) {
    return parse(input, csv, header, null, null, 0, -1, 1);
  }
}
