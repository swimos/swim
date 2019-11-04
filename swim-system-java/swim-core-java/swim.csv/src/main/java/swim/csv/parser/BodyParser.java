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
import swim.csv.schema.CsvHeader;
import swim.util.Builder;

final class BodyParser<T, R, C> extends Parser<T> {
  final CsvParser csv;
  final CsvHeader<T, R, C> header;
  final Builder<R, T> tableBuilder;
  final Parser<R> rowParser;
  final int step;

  BodyParser(CsvParser csv, CsvHeader<T, R, C> header,
             Builder<R, T> tableBuilder, Parser<R> rowParser, int step) {
    this.csv = csv;
    this.header = header;
    this.rowParser = rowParser;
    this.tableBuilder = tableBuilder;
    this.step = step;
  }

  BodyParser(CsvParser csv, CsvHeader<T, R, C> header) {
    this(csv, header, null, null, 1);
  }

  @Override
  public Parser<T> feed(Input input) {
    return parse(input, this.csv, this.header, this.tableBuilder, this.rowParser, this.step);
  }

  static <T, R, C> Parser<T> parse(Input input, CsvParser csv, CsvHeader<T, R, C> header,
                                   Builder<R, T> tableBuilder, Parser<R> rowParser, int step) {
    int c = 0;
    do {
      if (step == 1) {
        if (input.isCont()) {
          step = 2;
        } else if (input.isDone()) {
          if (tableBuilder == null) {
            tableBuilder = header.tableBuilder();
          }
          return done(tableBuilder.bind());
        }
      }
      if (step == 2) {
        if (rowParser == null) {
          rowParser = csv.parseRow(header, input);
        }
        while (rowParser.isCont() && !input.isEmpty()) {
          rowParser = rowParser.feed(input);
        }
        if (rowParser.isDone()) {
          if (tableBuilder == null) {
            tableBuilder = header.tableBuilder();
          }
          tableBuilder.add(rowParser.bind());
          rowParser = null;
          step = 3;
        } else if (rowParser.isError()) {
          return rowParser.asError();
        }
      }
      if (step == 3) {
        if (input.isCont()) {
          c = input.head();
          if (c == '\r') {
            input = input.step();
            step = 4;
          } else if (c == '\n') {
            input = input.step();
            step = 1;
            continue;
          } else {
            return error(Diagnostic.expected("carriage return or line feed", input));
          }
        } else if (input.isDone()) {
          step = 1;
          continue;
        }
      }
      if (step == 4) {
        if (input.isCont() && input.head() == '\n') {
          input = input.step();
          step = 1;
          continue;
        } else if (!input.isEmpty()) {
          step = 1;
          continue;
        }
      }
      break;
    } while (true);
    if (input.isError()) {
      return error(input.trap());
    }
    return new BodyParser<T, R, C>(csv, header, tableBuilder, rowParser, step);
  }

  static <T, R, C> Parser<T> parse(Input input, CsvParser csv, CsvHeader<T, R, C> header) {
    return parse(input, csv, header, null, null, 1);
  }
}
