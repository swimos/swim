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

final class TableParser<T, R, C> extends Parser<T> {
  final CsvParser<T, R, C> csv;
  final FingerTrieSeq<Parser<C>> cellParsers;
  final Parser<?> rowParser;
  final Builder<R, T> builder;
  final int step;

  TableParser(CsvParser<T, R, C> csv, FingerTrieSeq<Parser<C>> cellParsers,
              Parser<?> rowParser, Builder<R, T> builder, int step) {
    this.csv = csv;
    this.cellParsers = cellParsers;
    this.rowParser = rowParser;
    this.builder = builder;
    this.step = step;
  }

  TableParser(CsvParser<T, R, C> csv, FingerTrieSeq<Parser<C>> cellParsers) {
    this(csv, cellParsers, null, null, 4);
  }

  TableParser(CsvParser<T, R, C> csv) {
    this(csv, null, null, null, 1);
  }

  @Override
  public Parser<T> feed(Input input) {
    return parse(input, this.csv, this.cellParsers, this.rowParser, this.builder, this.step);
  }

  @SuppressWarnings("unchecked")
  static <T, R, C> Parser<T> parse(Input input, CsvParser<T, R, C> csv, FingerTrieSeq<Parser<C>> cellParsers,
                                   Parser<?> rowParser, Builder<R, T> builder, int step) {
    int c = 0;
    if (step == 1) {
      if (rowParser == null) {
        rowParser = csv.parseHeader(input);
      }
      while (rowParser.isCont() && !input.isEmpty()) {
        rowParser = rowParser.feed(input);
      }
      if (rowParser.isDone()) {
        cellParsers = (FingerTrieSeq<Parser<C>>) rowParser.bind();
        rowParser = null;
        step = 2;
      } else if (rowParser.isError()) {
        return rowParser.asError();
      }
    }
    if (step == 2) {
      if (input.isCont()) {
        c = input.head();
        if (c == '\r') {
          input = input.step();
          step = 3;
        } else if (c == '\n') {
          input = input.step();
          step = 4;
        } else {
          return error(Diagnostic.expected("carriage return or line feed", input));
        }
      } else if (!input.isEmpty()) {
        return error(Diagnostic.expected("carriage return or line feed", input));
      }
    }
    if (step == 3) {
      if (input.isCont() && input.head() == '\n') {
        input = input.step();
        step = 4;
      } else if (!input.isEmpty()) {
        step = 4;
      }
    }
    do {
      if (step == 4) {
        if (input.isCont()) {
          step = 5;
        } else if (input.isDone()) {
          if (builder == null) {
            builder = csv.tableBuilder();
          }
          return done(builder.bind());
        }
      }
      if (step == 5) {
        if (rowParser == null) {
          rowParser = csv.parseRow(input, cellParsers);
        }
        while (rowParser.isCont() && !input.isEmpty()) {
          rowParser = rowParser.feed(input);
        }
        if (rowParser.isDone()) {
          if (builder == null) {
            builder = csv.tableBuilder();
          }
          builder.add((R) rowParser.bind());
          rowParser = null;
          step = 5;
        } else if (rowParser.isError()) {
          return rowParser.asError();
        }
      }
      if (step == 5) {
        if (input.isCont()) {
          c = input.head();
          if (c == '\r') {
            input = input.step();
            step = 6;
          } else if (c == '\n') {
            input = input.step();
            step = 4;
            continue;
          } else {
            return error(Diagnostic.expected("carriage return or line feed", input));
          }
        } else if (input.isDone()) {
          step = 4;
          continue;
        }
      }
      if (step == 6) {
        if (input.isCont() && input.head() == '\n') {
          input = input.step();
          step = 4;
          continue;
        } else if (!input.isEmpty()) {
          step = 4;
          continue;
        }
      }
      break;
    } while (true);
    if (input.isError()) {
      return error(input.trap());
    }
    return new TableParser<T, R, C>(csv, cellParsers, rowParser, builder, step);
  }

  static <T, R, C> Parser<T> parse(Input input, CsvParser<T, R, C> csv) {
    return parse(input, csv, null, null, null, 1);
  }

  static <T, R, C> Parser<T> parse(Input input, CsvParser<T, R, C> csv, FingerTrieSeq<Parser<C>> cellParsers) {
    return parse(input, csv, cellParsers, null, null, 4);
  }
}
