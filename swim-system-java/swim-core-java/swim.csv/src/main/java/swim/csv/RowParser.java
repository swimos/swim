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
import swim.collections.FingerTrieSeq;
import swim.util.Builder;

final class RowParser<T, R, C> extends Parser<R> {
  final CsvParser<T, R, C> csv;
  final FingerTrieSeq<Parser<C>> cellParsers;
  final Parser<C> cellParser;
  final Builder<C, R> builder;
  final int index;
  final int head;
  final int step;

  RowParser(CsvParser<T, R, C> csv, FingerTrieSeq<Parser<C>> cellParsers,
            Parser<C> cellParser, Builder<C, R> builder, int index, int head, int step) {
    this.csv = csv;
    this.cellParsers = cellParsers;
    this.cellParser = cellParser;
    this.builder = builder;
    this.index = index;
    this.head = head;
    this.step = step;
  }

  RowParser(CsvParser<T, R, C> csv, FingerTrieSeq<Parser<C>> cellParsers) {
    this(csv, cellParsers, null, null, 0, -1, 1);
  }

  @Override
  public Parser<R> feed(Input input) {
    return parse(input, this.csv, this.cellParsers, this.cellParser,
                 this.builder, this.index, this.head, this.step);
  }

  static <T, R, C> Parser<R> parse(Input input, CsvParser<T, R, C> csv, FingerTrieSeq<Parser<C>> cellParsers,
                                   Parser<C> cellParser, Builder<C, R> builder, int index, int head, int step) {
    do {
      if (step == 1) {
        if (index >= cellParsers.size()) {
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
        if (cellParser == null) {
          cellParser = cellParsers.get(index).feed(cellInput);
          index += 1;
        }
        while (cellParser.isCont() && !cellInput.isEmpty()) {
          cellParser = cellParser.feed(cellInput);
        }
        if (cellParser.isDone()) {
          if (builder == null) {
            builder = csv.rowBuilder();
          }
          final C cell = cellParser.bind();
          if (cell != null) {
            builder.add(cell);
          }
          cellParser = null;
          step = 4;
        } else if (cellParser.isError()) {
          return cellParser.asError();
        }
      }
      if (step == 3) {
        final Input cellInput = new CsvQuotedInput('"', input, head);
        if (cellParser == null) {
          cellParser = cellParsers.get(index).feed(cellInput);
          index += 1;
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
          if (builder == null) {
            builder = csv.rowBuilder();
          }
          final C cell = cellParser.bind();
          if (cell != null) {
            builder.add(cell);
          }
          cellParser = null;
          head = -1;
          step = 4;
        } else if (cellParser.isError()) {
          return cellParser.asError();
        }
      }
      if (step == 4) {
        if (index >= cellParsers.size()) {
          if (builder == null) {
            builder = csv.rowBuilder();
          }
          return done(builder.bind());
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
    return new RowParser<T, R, C>(csv, cellParsers, cellParser, builder, index, head, step);
  }

  static <T, R, C> Parser<R> parse(Input input, CsvParser<T, R, C> csv,
                                   FingerTrieSeq<Parser<C>> cellParsers) {
    return parse(input, csv, cellParsers, null, null, 0, -1, 1);
  }
}
