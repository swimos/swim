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

import java.nio.ByteBuffer;
import swim.codec.Binary;
import swim.codec.Diagnostic;
import swim.codec.Input;
import swim.codec.Parser;
import swim.codec.Unicode;
import swim.codec.Utf8;
import swim.csv.schema.CsvCol;
import swim.csv.schema.CsvHeader;

public class CsvParser {
  protected final int delimiter;

  public CsvParser(int delimiter) {
    this.delimiter = delimiter;
  }

  public final int delimiter() {
    return this.delimiter;
  }

  public boolean isDelimiter(int c) {
    return c == delimiter;
  }

  public <T, R, C> Parser<T> parseTable(CsvHeader<T, R, C> header, Input input) {
    return TableParser.parse(input, this, header);
  }

  public <T, R, C> Parser<CsvHeader<T, R, C>> parseHeader(CsvHeader<T, R, C> header, Input input) {
    return HeaderParser.parse(input, this, header);
  }

  public <T, R, C> Parser<T> parseBody(CsvHeader<T, R, C> header, Input input) {
    return BodyParser.parse(input, this, header);
  }

  public <T, R, C> Parser<R> parseRow(CsvHeader<T, R, C> header, Input input) {
    return RowParser.parse(input, this, header);
  }

  public <C> Parser<C> parseCell(CsvCol<C> col, Input input) {
    return col.parseCell(input);
  }

  public <T, R, C> Parser<T> tableParser(CsvHeader<T, R, C> header) {
    return new TableParser<T, R, C>(this, header);
  }

  public <T, R, C> Parser<CsvHeader<T, R, C>> headerParser(CsvHeader<T, R, C> header) {
    return new HeaderParser<T, R, C>(this, header);
  }

  public <T, R, C> Parser<T> bodyParser(CsvHeader<T, R, C> header) {
    return new BodyParser<T, R, C>(this, header);
  }

  public <T, R, C> Parser<R> rowParser(CsvHeader<T, R, C> header) {
    return new RowParser<T, R, C>(this, header);
  }

  public <T, R, C> T parseTableString(CsvHeader<T, R, C> header, String string) {
    final Input input = Unicode.stringInput(string);
    Parser<T> parser = parseTable(header, input);
    if (input.isCont() && !parser.isError()) {
      parser = Parser.error(Diagnostic.unexpected(input));
    } else if (input.isError()) {
      parser = Parser.error(input.trap());
    }
    return parser.bind();
  }

  public <T, R, C> T parseTableData(CsvHeader<T, R, C> header, byte[] data) {
    final Input input = Utf8.decodedInput(Binary.inputBuffer(data));
    Parser<T> parser = parseTable(header, input);
    if (input.isCont() && !parser.isError()) {
      parser = Parser.error(Diagnostic.unexpected(input));
    } else if (input.isError()) {
      parser = Parser.error(input.trap());
    }
    return parser.bind();
  }

  public <T, R, C> T parseTableBuffer(CsvHeader<T, R, C> header, ByteBuffer buffer) {
    final Input input = Utf8.decodedInput(Binary.inputBuffer(buffer));
    Parser<T> parser = parseTable(header, input);
    if (input.isCont() && !parser.isError()) {
      parser = Parser.error(Diagnostic.unexpected(input));
    } else if (input.isError()) {
      parser = Parser.error(input.trap());
    }
    return parser.bind();
  }

  public <T, R, C> T parseBodyString(CsvHeader<T, R, C> header, String string) {
    final Input input = Unicode.stringInput(string);
    Parser<T> parser = parseBody(header, input);
    if (input.isCont() && !parser.isError()) {
      parser = Parser.error(Diagnostic.unexpected(input));
    } else if (input.isError()) {
      parser = Parser.error(input.trap());
    }
    return parser.bind();
  }

  public <T, R, C> T parseBodyData(CsvHeader<T, R, C> header, byte[] data) {
    final Input input = Utf8.decodedInput(Binary.inputBuffer(data));
    Parser<T> parser = parseBody(header, input);
    if (input.isCont() && !parser.isError()) {
      parser = Parser.error(Diagnostic.unexpected(input));
    } else if (input.isError()) {
      parser = Parser.error(input.trap());
    }
    return parser.bind();
  }

  public <T, R, C> T parseBodyBuffer(CsvHeader<T, R, C> header, ByteBuffer buffer) {
    final Input input = Utf8.decodedInput(Binary.inputBuffer(buffer));
    Parser<T> parser = parseBody(header, input);
    if (input.isCont() && !parser.isError()) {
      parser = Parser.error(Diagnostic.unexpected(input));
    } else if (input.isError()) {
      parser = Parser.error(input.trap());
    }
    return parser.bind();
  }

  public <T, R, C> R parseRowString(CsvHeader<T, R, C> header, String string) {
    Input input = Unicode.stringInput(string);
    Parser<R> parser = parseRow(header, input);
    if (parser.isDone()) {
      while (input.isCont()) {
        final int c = input.head();
        if (c == '\r' || c == '\n') {
          input = input.step();
        }
      }
    }
    if (input.isCont() && !parser.isError()) {
      parser = Parser.error(Diagnostic.unexpected(input));
    } else if (input.isError()) {
      parser = Parser.error(input.trap());
    }
    return parser.bind();
  }

  public <T, R, C> R parseRowData(CsvHeader<T, R, C> header, byte[] data) {
    Input input = Utf8.decodedInput(Binary.inputBuffer(data));
    Parser<R> parser = parseRow(header, input);
    if (parser.isDone()) {
      while (input.isCont()) {
        final int c = input.head();
        if (c == '\r' || c == '\n') {
          input = input.step();
        }
      }
    }
    if (input.isCont() && !parser.isError()) {
      parser = Parser.error(Diagnostic.unexpected(input));
    } else if (input.isError()) {
      parser = Parser.error(input.trap());
    }
    return parser.bind();
  }

  public <T, R, C> R parseRowBuffer(CsvHeader<T, R, C> header, ByteBuffer buffer) {
    Input input = Utf8.decodedInput(Binary.inputBuffer(buffer));
    Parser<R> parser = parseRow(header, input);
    if (parser.isDone()) {
      while (input.isCont()) {
        final int c = input.head();
        if (c == '\r' || c == '\n') {
          input = input.step();
        }
      }
    }
    if (input.isCont() && !parser.isError()) {
      parser = Parser.error(Diagnostic.unexpected(input));
    } else if (input.isError()) {
      parser = Parser.error(input.trap());
    }
    return parser.bind();
  }
}
