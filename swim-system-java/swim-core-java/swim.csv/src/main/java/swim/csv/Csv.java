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

import java.nio.ByteBuffer;
import swim.codec.Output;
import swim.codec.Parser;
import swim.codec.Unicode;
import swim.codec.Utf8;
import swim.codec.Writer;
import swim.structure.Data;
import swim.structure.Item;
import swim.structure.Num;
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
      structureParser = new CsvStructureParser(CsvStructureHeader.empty(), ',');
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

  public static CsvParser<Value, Item, Item> structureParser(CsvHeader<Item> header) {
    if (header == CsvStructureHeader.empty()) {
      return structureParser();
    } else {
      return new CsvStructureParser(header, ',');
    }
  }

  public static CsvParser<Value, Item, Item> structureParser(CsvHeader<Item> header, int delimiter) {
    if (header == CsvStructureHeader.empty() && delimiter == ',') {
      return structureParser();
    } else {
      return new CsvStructureParser(header, delimiter);
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

  public static CsvStructureHeader header() {
    return CsvStructureHeader.empty();
  }

  public static CsvStructureCol<Text> textCol(Value key) {
    return new TextCol(key, key.stringValue(""), false);
  }

  public static CsvStructureCol<Text> textCol(String key) {
    return new TextCol(Text.from(key), key, false);
  }

  public static CsvStructureCol<Text> textCol() {
    return new TextCol(Value.absent(), "", false);
  }

  public static CsvStructureCol<Num> numberCol(Value key) {
    return new NumberCol(key, key.stringValue(""), false);
  }

  public static CsvStructureCol<Num> numberCol(String key) {
    return new NumberCol(Text.from(key), key, false);
  }

  public static CsvStructureCol<Num> numberCol() {
    return new NumberCol(Value.absent(), "", false);
  }

  public static CsvStructureCol<Item> itemCol(Value key, Parser<? extends Item> itemParser) {
    return new ItemCol(key, key.stringValue(""), false, itemParser);
  }

  public static CsvStructureCol<Item> itemCol(String key, Parser<? extends Item> itemParser) {
    return new ItemCol(Text.from(key), key, false, itemParser);
  }

  public static CsvStructureCol<Item> itemCol(Parser<? extends Item> itemParser) {
    return new ItemCol(Value.absent(), "", false, itemParser);
  }

  public static Value parseTable(String csvString) {
    return structureParser().parseTableString(csvString);
  }

  public static Value parseTable(String csvString, int delimiter) {
    return structureParser(delimiter).parseTableString(csvString);
  }

  public static Value parseTable(String csvString, CsvHeader<Item> header) {
    return structureParser(header).parseTableString(csvString);
  }

  public static Value parseTable(String csvString, CsvHeader<Item> header, int delimiter) {
    return structureParser(header, delimiter).parseTableString(csvString);
  }

  public static Value parseTable(byte[] csvData) {
    return structureParser().parseTableData(csvData);
  }

  public static Value parseTable(byte[] csvData, int delimiter) {
    return structureParser(delimiter).parseTableData(csvData);
  }

  public static Value parseTable(byte[] csvData, CsvHeader<Item> header) {
    return structureParser(header).parseTableData(csvData);
  }

  public static Value parseTable(byte[] csvData, CsvHeader<Item> header, int delimiter) {
    return structureParser(header, delimiter).parseTableData(csvData);
  }

  public static Value parseTable(ByteBuffer csvBuffer) {
    return structureParser().parseTableBuffer(csvBuffer);
  }

  public static Value parseTable(ByteBuffer csvBuffer, int delimiter) {
    return structureParser(delimiter).parseTableBuffer(csvBuffer);
  }

  public static Value parseTable(ByteBuffer csvBuffer, CsvHeader<Item> header) {
    return structureParser(header).parseTableBuffer(csvBuffer);
  }

  public static Value parseTable(ByteBuffer csvBuffer, CsvHeader<Item> header, int delimiter) {
    return structureParser(header, delimiter).parseTableBuffer(csvBuffer);
  }

  public static Value parseBody(String csvString, CsvHeader<Item> header) {
    return structureParser().parseBodyString(csvString, header);
  }

  public static Value parseBody(String csvString, CsvHeader<Item> header, int delimiter) {
    return structureParser(delimiter).parseBodyString(csvString, header);
  }

  public static Value parseBody(byte[] csvData, CsvHeader<Item> header) {
    return structureParser().parseBodyData(csvData, header);
  }

  public static Value parseBody(byte[] csvData, CsvHeader<Item> header, int delimiter) {
    return structureParser(delimiter).parseBodyData(csvData, header);
  }

  public static Value parseBody(ByteBuffer csvBuffer, CsvHeader<Item> header) {
    return structureParser().parseBodyBuffer(csvBuffer, header);
  }

  public static Value parseBody(ByteBuffer csvBuffer, CsvHeader<Item> header, int delimiter) {
    return structureParser(delimiter).parseBodyBuffer(csvBuffer, header);
  }

  public static Item parseRow(String csvString, CsvHeader<Item> header) {
    return structureParser().parseRowString(csvString, header);
  }

  public static Item parseRow(String csvString, CsvHeader<Item> header, int delimiter) {
    return structureParser(delimiter).parseRowString(csvString, header);
  }

  public static Item parseRow(byte[] csvData, CsvHeader<Item> header) {
    return structureParser().parseRowData(csvData, header);
  }

  public static Item parseRow(byte[] csvData, CsvHeader<Item> header, int delimiter) {
    return structureParser(delimiter).parseRowData(csvData, header);
  }

  public static Item parseRow(ByteBuffer csvBuffer, CsvHeader<Item> header) {
    return structureParser().parseRowBuffer(csvBuffer, header);
  }

  public static Item parseRow(ByteBuffer csvBuffer, CsvHeader<Item> header, int delimiter) {
    return structureParser(delimiter).parseRowBuffer(csvBuffer, header);
  }

  public static Parser<Value> tableParser() {
    return structureParser().tableParser();
  }

  public static Parser<Value> tableParser(int delimiter) {
    return structureParser(delimiter).tableParser();
  }

  public static Parser<CsvHeader<Item>> headerParser() {
    return structureParser().headerParser();
  }

  public static Parser<CsvHeader<Item>> headerParser(int delimiter) {
    return structureParser(delimiter).headerParser();
  }

  public static Parser<Value> bodyParser(CsvHeader<Item> header) {
    return structureParser().bodyParser(header);
  }

  public static Parser<Value> bodyParser(CsvHeader<Item> header, int delimiter) {
    return structureParser(delimiter).bodyParser(header);
  }

  public static Parser<Item> rowParser(CsvHeader<Item> header) {
    return structureParser().rowParser(header);
  }

  public static Parser<Item> rowParser(CsvHeader<Item> header, int delimiter) {
    return structureParser(delimiter).rowParser(header);
  }

  public static Writer<?, ?> writeTable(Value table, Output<?> output) {
    return structureWriter().writeTable(table, output);
  }

  public static Writer<?, ?> writeTable(Value table, Output<?> output, int delimiter) {
    return structureWriter(delimiter).writeTable(table, output);
  }

  public static String toString(Value table) {
    final Output<String> output = Unicode.stringOutput();
    writeTable(table, output);
    return output.bind();
  }

  public static String toString(Value table, int delimiter) {
    final Output<String> output = Unicode.stringOutput();
    writeTable(table, output, delimiter);
    return output.bind();
  }

  public static Data toData(Value table) {
    final Output<Data> output = Utf8.encodedOutput(Data.output());
    writeTable(table, output);
    return output.bind();
  }

  public static Data toData(Value table, int delimiter) {
    final Output<Data> output = Utf8.encodedOutput(Data.output());
    writeTable(table, output, delimiter);
    return output.bind();
  }
}
