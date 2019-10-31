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
import swim.codec.Unicode;

final class HeaderParser<T, R, C> extends Parser<CsvHeader<C>> {
  final CsvParser<T, R, C> csv;
  final CsvHeader<C> header;
  final Parser<String> nameParser;
  final int head;
  final int step;

  HeaderParser(CsvParser<T, R, C> csv, CsvHeader<C> header,
               Parser<String> nameParser, int head, int step) {
    this.csv = csv;
    this.header = header;
    this.nameParser = nameParser;
    this.head = head;
    this.step = step;
  }

  HeaderParser(CsvParser<T, R, C> csv) {
    this(csv, null, null, -1, 1);
  }

  @Override
  public Parser<CsvHeader<C>> feed(Input input) {
    return parse(input, this.csv, this.header, this.nameParser, this.head, this.step);
  }

  static <T, R, C> Parser<CsvHeader<C>> parse(Input input, CsvParser<T, R, C> csv, CsvHeader<C> header,
                                              Parser<String> nameParser, int head, int step) {
    int c = 0;
    do {
      if (step == 1) {
        if (input.isCont() && input.head() == '"') {
          input = input.step();
          step = 3;
        } else if (!input.isEmpty()) {
          step = 2;
        }
      }
      if (step == 2) {
        final Input cellInput = new CsvInput(csv, input);
        if (nameParser == null) {
          nameParser = Unicode.parseString(cellInput);
        }
        while (nameParser.isCont() && !cellInput.isEmpty()) {
          nameParser = nameParser.feed(cellInput);
        }
        if (nameParser.isDone()) {
          if (header == null) {
            header = csv.header();
          }
          header = header.col(nameParser.bind());
          nameParser = null;
          step = 4;
        } else if (nameParser.isError()) {
          return nameParser.asError();
        }
      }
      if (step == 3) {
        final Input cellInput = new CsvQuotedInput('"', input, head);
        if (nameParser == null) {
          nameParser = Unicode.parseString(cellInput);
        }
        while (nameParser.isCont() && !cellInput.isEmpty()) {
          nameParser = nameParser.feed(cellInput);
        }
        if (cellInput instanceof CsvQuotedInput) {
          head = ((CsvQuotedInput) cellInput).next();
        }
        if (head == -4) {
          return error(Diagnostic.expected('"', input));
        } else if (nameParser.isDone()) {
          if (header == null) {
            header = csv.header();
          }
          header = header.col(nameParser.bind());
          nameParser = null;
          head = -1;
          step = 4;
        } else if (nameParser.isError()) {
          return nameParser.asError();
        }
      }
      if (step == 4) {
        if (input.isCont()) {
          c = input.head();
          if (c == '\r' || c == '\n') {
            if (header == null) {
              header = csv.header();
            }
            return done(header);
          } else if (csv.isDelimiter(c)) {
            input = input.step();
            step = 1;
            continue;
          } else {
            return error(Diagnostic.expected("delimiter or line break", input));
          }
        } else if (input.isDone()) {
          return error(Diagnostic.expected("delimiter", input));
        }
      }
      break;
    } while (true);
    if (input.isError()) {
      return error(input.trap());
    }
    return new HeaderParser<T, R, C>(csv, header, nameParser, head, step);
  }

  static <T, R, C> Parser<CsvHeader<C>> parse(Input input, CsvParser<T, R, C> csv) {
    return parse(input, csv, null, null, -1, 1);
  }
}
