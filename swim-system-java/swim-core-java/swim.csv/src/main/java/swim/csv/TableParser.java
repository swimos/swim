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

final class TableParser<T, R, C> extends Parser<T> {
  final CsvParser<T, R, C> csv;
  final Parser<CsvHeader<C>> headerParser;
  final int step;

  TableParser(CsvParser<T, R, C> csv, Parser<CsvHeader<C>> headerParser, int step) {
    this.csv = csv;
    this.headerParser = headerParser;
    this.step = step;
  }

  TableParser(CsvParser<T, R, C> csv) {
    this(csv, null, 1);
  }

  @Override
  public Parser<T> feed(Input input) {
    return parse(input, this.csv, this.headerParser, this.step);
  }

  static <T, R, C> Parser<T> parse(Input input, CsvParser<T, R, C> csv,
                                   Parser<CsvHeader<C>> headerParser, int step) {
    int c = 0;
    if (step == 1) {
      if (headerParser == null) {
        headerParser = csv.parseHeader(input);
      }
      while (headerParser.isCont() && !input.isEmpty()) {
        headerParser = headerParser.feed(input);
      }
      if (headerParser.isDone()) {
        step = 2;
      } else if (headerParser.isError()) {
        return headerParser.asError();
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
          return csv.parseBody(input, headerParser.bind());
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
        return csv.parseBody(input, headerParser.bind());
      } else if (!input.isEmpty()) {
        return csv.parseBody(input, headerParser.bind());
      }
    }
    if (input.isError()) {
      return error(input.trap());
    }
    return new TableParser<T, R, C>(csv, headerParser, step);
  }

  static <T, R, C> Parser<T> parse(Input input, CsvParser<T, R, C> csv) {
    return parse(input, csv, null, 1);
  }
}
