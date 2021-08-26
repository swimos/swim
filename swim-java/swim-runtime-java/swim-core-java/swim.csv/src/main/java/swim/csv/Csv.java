// Copyright 2015-2021 Swim Inc.
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
import swim.codec.Parser;
import swim.csv.parser.CsvParser;
import swim.csv.schema.CsvHeader;
import swim.csv.structure.CsvStructure;
import swim.structure.Item;
import swim.structure.Record;
import swim.structure.Value;

/**
 * Factory for constructing CSV parsers and writers.
 */
public final class Csv {

  private Csv() {
    // static
  }

  private static CsvParser parser;

  public static CsvParser parser() {
    if (Csv.parser == null) {
      Csv.parser = new CsvParser(',');
    }
    return Csv.parser;
  }

  public static CsvParser parser(int delimiter) {
    if (delimiter == ',') {
      return Csv.parser();
    } else {
      return new CsvParser(delimiter);
    }
  }

  public static Record parseTable(String csvString) {
    return Csv.parser().parseTableString(CsvStructure.header(), csvString);
  }

  public static Record parseTable(int delimiter, String csvString) {
    return Csv.parser(delimiter).parseTableString(CsvStructure.header(), csvString);
  }

  public static Record parseTable(byte[] csvData) {
    return Csv.parser().parseTableData(CsvStructure.header(), csvData);
  }

  public static Record parseTable(int delimiter, byte[] csvData) {
    return Csv.parser(delimiter).parseTableData(CsvStructure.header(), csvData);
  }

  public static Record parseTable(ByteBuffer csvBuffer) {
    return Csv.parser().parseTableBuffer(CsvStructure.header(), csvBuffer);
  }

  public static Record parseTable(int delimiter, ByteBuffer csvBuffer) {
    return Csv.parser(delimiter).parseTableBuffer(CsvStructure.header(), csvBuffer);
  }

  public static <T, R, C> T parseTable(String csvString, CsvHeader<T, R, C> header) {
    return Csv.parser().parseTableString(header, csvString);
  }

  public static <T, R, C> T parseTable(int delimiter, String csvString, CsvHeader<T, R, C> header) {
    return Csv.parser(delimiter).parseTableString(header, csvString);
  }

  public static <T, R, C> T parseTable(byte[] csvData, CsvHeader<T, R, C> header) {
    return Csv.parser().parseTableData(header, csvData);
  }

  public static <T, R, C> T parseTable(int delimiter, byte[] csvData, CsvHeader<T, R, C> header) {
    return Csv.parser(delimiter).parseTableData(header, csvData);
  }

  public static <T, R, C> T parseTable(ByteBuffer csvBuffer, CsvHeader<T, R, C> header) {
    return Csv.parser().parseTableBuffer(header, csvBuffer);
  }

  public static <T, R, C> T parseTable(int delimiter, ByteBuffer csvBuffer, CsvHeader<T, R, C> header) {
    return Csv.parser(delimiter).parseTableBuffer(header, csvBuffer);
  }

  public static <T, R, C> T parseBody(String csvString, CsvHeader<T, R, C> header) {
    return Csv.parser().parseBodyString(header, csvString);
  }

  public static <T, R, C> T parseBody(int delimiter, String csvString, CsvHeader<T, R, C> header) {
    return Csv.parser(delimiter).parseBodyString(header, csvString);
  }

  public static <T, R, C> T parseBody(byte[] csvData, CsvHeader<T, R, C> header) {
    return Csv.parser().parseBodyData(header, csvData);
  }

  public static <T, R, C> T parseBody(int delimiter, byte[] csvData, CsvHeader<T, R, C> header) {
    return Csv.parser(delimiter).parseBodyData(header, csvData);
  }

  public static <T, R, C> T parseBody(ByteBuffer csvBuffer, CsvHeader<T, R, C> header) {
    return Csv.parser().parseBodyBuffer(header, csvBuffer);
  }

  public static <T, R, C> T parseBody(int delimiter, ByteBuffer csvBuffer, CsvHeader<T, R, C> header) {
    return Csv.parser(delimiter).parseBodyBuffer(header, csvBuffer);
  }

  public static <T, R, C> R parseRow(String csvString, CsvHeader<T, R, C> header) {
    return Csv.parser().parseRowString(header, csvString);
  }

  public static <T, R, C> R parseRow(int delimiter, String csvString, CsvHeader<T, R, C> header) {
    return Csv.parser(delimiter).parseRowString(header, csvString);
  }

  public static <T, R, C> R parseRow(byte[] csvData, CsvHeader<T, R, C> header) {
    return Csv.parser().parseRowData(header, csvData);
  }

  public static <T, R, C> R parseRow(int delimiter, byte[] csvData, CsvHeader<T, R, C> header) {
    return Csv.parser(delimiter).parseRowData(header, csvData);
  }

  public static <T, R, C> R parseRow(ByteBuffer csvBuffer, CsvHeader<T, R, C> header) {
    return Csv.parser().parseRowBuffer(header, csvBuffer);
  }

  public static <T, R, C> R parseRow(int delimiter, ByteBuffer csvBuffer, CsvHeader<T, R, C> header) {
    return Csv.parser(delimiter).parseRowBuffer(header, csvBuffer);
  }

  public static Parser<Record> tableParser() {
    return Csv.parser().tableParser(CsvStructure.header());
  }

  public static Parser<Record> tableParser(int delimiter) {
    return Csv.parser(delimiter).tableParser(CsvStructure.header());
  }

  public static <T, R, C> Parser<T> tableParser(CsvHeader<T, R, C> header) {
    return Csv.parser().tableParser(header);
  }

  public static <T, R, C> Parser<T> tableParser(int delimiter, CsvHeader<T, R, C> header) {
    return Csv.parser(delimiter).tableParser(header);
  }

  public static Parser<CsvHeader<Record, Value, Item>> headerParser() {
    return Csv.parser().headerParser(CsvStructure.header());
  }

  public static Parser<CsvHeader<Record, Value, Item>> headerParser(int delimiter) {
    return Csv.parser(delimiter).headerParser(CsvStructure.header());
  }

  public static <T, R, C> Parser<CsvHeader<T, R, C>> headerParser(CsvHeader<T, R, C> header) {
    return Csv.parser().headerParser(header);
  }

  public static <T, R, C> Parser<CsvHeader<T, R, C>> headerParser(int delimiter, CsvHeader<T, R, C> header) {
    return Csv.parser(delimiter).headerParser(header);
  }

  public static <T, R, C> Parser<T> bodyParser(CsvHeader<T, R, C> header) {
    return Csv.parser().bodyParser(header);
  }

  public static <T, R, C> Parser<T> bodyParser(int delimiter, CsvHeader<T, R, C> header) {
    return Csv.parser(delimiter).bodyParser(header);
  }

  public static <T, R, C> Parser<R> rowParser(CsvHeader<T, R, C> header) {
    return Csv.parser().rowParser(header);
  }

  public static <T, R, C> Parser<R> rowParser(int delimiter, CsvHeader<T, R, C> header) {
    return Csv.parser(delimiter).rowParser(header);
  }

}
