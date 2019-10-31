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

import swim.codec.Output;
import swim.codec.Parser;
import swim.codec.Unicode;
import swim.codec.Utf8;
import swim.codec.Writer;
import swim.collections.FingerTrieSeq;
import swim.structure.Data;
import swim.structure.Item;
import swim.structure.Text;
import swim.structure.Value;

/**
 * Factory for constructing CSV parsers and writers.
 */
public final class Csv {
  private Csv() {
    // static
  }

  private static CsvParser<Value, Item, Item> structureParser;
  private static CsvWriter<Value, Item, Item> structureWriter;

  public static CsvParser<Value, Item, Item> structureParser() {
    if (structureParser == null) {
      structureParser = new CsvStructureParser(',');
    }
    return structureParser;
  }

  public static CsvParser<Value, Item, Item> structureParser(int delimiter) {
    if (delimiter == ',') {
      return structureParser();
    } else {
      return new CsvStructureParser(delimiter);
    }
  }

  public static CsvWriter<Value, Item, Item> structureWriter() {
    if (structureWriter == null) {
      structureWriter = new CsvStructureWriter(',');
    }
    return structureWriter;
  }

  public static CsvWriter<Value, Item, Item> structureWriter(int delimiter) {
    if (delimiter == ',') {
      return structureWriter();
    } else {
      return new CsvStructureWriter(delimiter);
    }
  }

  public static Parser<Item> numberCellParser(Value key) {
    return new NumberCellParser(key);
  }

  public static Parser<Item> numberCellParser(String key) {
    return new NumberCellParser(Text.from(key));
  }

  public static Parser<Item> numberCellParser() {
    return new NumberCellParser(Value.absent());
  }

  public static Parser<Item> optionaNumberCellParser(Value key) {
    return new OptionalNumberCellParser(key);
  }

  public static Parser<Item> optionalNumberCellParser(String key) {
    return new OptionalNumberCellParser(Text.from(key));
  }

  public static Parser<Item> textCellParser(Value key) {
    return new TextCellParser(key);
  }

  public static Parser<Item> textCellParser(String key) {
    return new TextCellParser(Text.from(key));
  }

  public static Parser<Item> textCellParser() {
    return new TextCellParser(Value.absent());
  }

  public static Parser<Item> optionalTextCellParser(Value key) {
    return new OptionalTextCellParser(key);
  }

  public static Parser<Item> optionalTextCellParser(String key) {
    return new OptionalTextCellParser(Text.from(key));
  }

  public static Parser<Item> itemCellParser(Value key, Parser<Item> itemParser) {
    return new ItemCellParser(key, itemParser);
  }

  public static Parser<Item> itemCellParser(String key, Parser<Item> itemParser) {
    return new ItemCellParser(Text.from(key), itemParser);
  }

  public static Parser<Item> itemCellParser(Parser<Item> itemParser) {
    return new ItemCellParser(Value.absent(), itemParser);
  }

  public static Value parse(String csv) {
    return structureParser().parseTableString(csv);
  }

  public static Value parse(String csv, int delimiter) {
    return structureParser(delimiter).parseTableString(csv);
  }

  public static Value parse(String csv, FingerTrieSeq<Parser<Item>> cellParsers) {
    return structureParser().parseTableString(csv, cellParsers);
  }

  public static Value parse(String csv, FingerTrieSeq<Parser<Item>> cellParsers, int delimiter) {
    return structureParser(delimiter).parseTableString(csv, cellParsers);
  }

  public static Parser<Value> parser() {
    return structureParser().tableParser();
  }

  public static Parser<Value> parser(int delimiter) {
    return structureParser(delimiter).tableParser();
  }

  public static Parser<Value> parser(FingerTrieSeq<Parser<Item>> cellParsers) {
    return structureParser().tableParser(cellParsers);
  }

  public static Parser<Value> parser(FingerTrieSeq<Parser<Item>> cellParsers, int delimiter) {
    return structureParser(delimiter).tableParser(cellParsers);
  }

  public static Writer<?, ?> write(Value table, Output<?> output) {
    return structureWriter().writeTable(table, output);
  }

  public static Writer<?, ?> write(Value table, Output<?> output, int delimiter) {
    return structureWriter(delimiter).writeTable(table, output);
  }

  public static String toString(Value table) {
    final Output<String> output = Unicode.stringOutput();
    write(table, output);
    return output.bind();
  }

  public static String toString(Value table, int delimiter) {
    final Output<String> output = Unicode.stringOutput();
    write(table, output, delimiter);
    return output.bind();
  }

  public static Data toData(Value table) {
    final Output<Data> output = Utf8.encodedOutput(Data.output());
    write(table, output);
    return output.bind();
  }

  public static Data toData(Value table, int delimiter) {
    final Output<Data> output = Utf8.encodedOutput(Data.output());
    write(table, output, delimiter);
    return output.bind();
  }
}
