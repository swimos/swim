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

final class TableParser<T, R, C> extends Parser<T> {
  final CsvParser csv;
  final CsvHeader<T, R, C> header;
  final Parser<CsvHeader<T, R, C>> headerParser;
  final int step;

  TableParser(CsvParser csv, CsvHeader<T, R, C> header,
              Parser<CsvHeader<T, R, C>> headerParser, int step) {
    this.csv = csv;
    this.header = header;
    this.headerParser = headerParser;
    this.step = step;
  }

  TableParser(CsvParser csv, CsvHeader<T, R, C> header) {
    this(csv, header, null, 1);
  }

  @Override
  public Parser<T> feed(Input input) {
    return parse(input, this.csv, this.header, this.headerParser, this.step);
  }

  static <T, R, C> Parser<T> parse(Input input, CsvParser csv, CsvHeader<T, R, C> header,
                                   Parser<CsvHeader<T, R, C>> headerParser, int step) {
    int c = 0;
    if (step == 1) {
      if (headerParser == null) {
        headerParser = csv.parseHeader(header, input);
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
          return csv.parseBody(headerParser.bind(), input);
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
        return csv.parseBody(headerParser.bind(), input);
      } else if (!input.isEmpty()) {
        return csv.parseBody(headerParser.bind(), input);
      }
    }
    if (input.isError()) {
      return error(input.trap());
    }
    return new TableParser<T, R, C>(csv, header, headerParser, step);
  }

  static <T, R, C> Parser<T> parse(Input input, CsvParser csv, CsvHeader<T, R, C> header) {
    return parse(input, csv, header, null, 1);
  }
}
