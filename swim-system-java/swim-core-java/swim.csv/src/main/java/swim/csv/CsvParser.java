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
import swim.collections.FingerTrieSeq;
import swim.util.Builder;

public abstract class CsvParser<T, R, C> {
  public abstract boolean isDelimiter(int c);

  public abstract Builder<R, T> tableBuilder();

  public abstract Builder<C, R> rowBuilder();

  public abstract Parser<C> cellParser(String name, int index);

  public Parser<T> parseTable(Input input) {
    return TableParser.parse(input, this);
  }

  public Parser<T> parseTable(Input input, FingerTrieSeq<Parser<C>> cellParsers) {
    return TableParser.parse(input, this, cellParsers);
  }

  public Parser<FingerTrieSeq<Parser<C>>> parseHeader(Input input) {
    return HeaderParser.parse(input, this);
  }

  public Parser<R> parseRow(Input input, FingerTrieSeq<Parser<C>> cellParsers) {
    return RowParser.parse(input, this, cellParsers);
  }

  public Parser<T> tableParser() {
    return new TableParser<T, R, C>(this);
  }

  public Parser<T> tableParser(FingerTrieSeq<Parser<C>> cellParsers) {
    return new TableParser<T, R, C>(this, cellParsers);
  }

  public Parser<FingerTrieSeq<Parser<C>>> headerParser() {
    return new HeaderParser<T, R, C>(this);
  }

  public Parser<R> rowParser(FingerTrieSeq<Parser<C>> cellParsers) {
    return new RowParser<T, R, C>(this, cellParsers);
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

  public T parseTableString(String string, FingerTrieSeq<Parser<C>> cellParsers) {
    final Input input = Unicode.stringInput(string);
    Parser<T> parser = parseTable(input, cellParsers);
    if (input.isCont() && !parser.isError()) {
      parser = Parser.error(Diagnostic.unexpected(input));
    } else if (input.isError()) {
      parser = Parser.error(input.trap());
    }
    return parser.bind();
  }
}
