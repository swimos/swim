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
import swim.util.Builder;

public abstract class CsvParser<T, R, C> {
  public abstract boolean isDelimiter(int c);

  public abstract CsvHeader<C> header();

  public abstract Builder<R, T> tableBuilder();

  public abstract Builder<C, R> rowBuilder();

  public Parser<T> parseTable(Input input) {
    return TableParser.parse(input, this);
  }

  public Parser<CsvHeader<C>> parseHeader(Input input) {
    return HeaderParser.parse(input, this);
  }

  public Parser<T> parseBody(Input input, CsvHeader<C> header) {
    return BodyParser.parse(input, this, header);
  }

  public Parser<R> parseRow(Input input, CsvHeader<C> header) {
    return RowParser.parse(input, this, header);
  }

  public Parser<T> tableParser() {
    return new TableParser<T, R, C>(this);
  }

  public Parser<CsvHeader<C>> headerParser() {
    return new HeaderParser<T, R, C>(this);
  }

  public Parser<T> bodyParser(CsvHeader<C> header) {
    return new BodyParser<T, R, C>(this, header);
  }

  public Parser<R> rowParser(CsvHeader<C> header) {
    return new RowParser<T, R, C>(this, header);
  }

  public T parseTableString(String string) {
    final Input input = Unicode.stringInput(string);
    Parser<T> parser = parseTable(input);
    if (input.isCont() && !parser.isError()) {
      parser = Parser.error(Diagnostic.unexpected(input));
    } else if (input.isError()) {
      parser = Parser.error(input.trap());
    }
    return parser.bind();
  }

  public T parseBodyString(String string, CsvHeader<C> header) {
    final Input input = Unicode.stringInput(string);
    Parser<T> parser = parseBody(input, header);
    if (input.isCont() && !parser.isError()) {
      parser = Parser.error(Diagnostic.unexpected(input));
    } else if (input.isError()) {
      parser = Parser.error(input.trap());
    }
    return parser.bind();
  }

  public R parseRowString(String string, CsvHeader<C> header) {
    final Input input = Unicode.stringInput(string);
    Parser<R> parser = parseRow(input, header);
    if (input.isCont() && !parser.isError()) {
      parser = Parser.error(Diagnostic.unexpected(input));
    } else if (input.isError()) {
      parser = Parser.error(input.trap());
    }
    return parser.bind();
  }
}
