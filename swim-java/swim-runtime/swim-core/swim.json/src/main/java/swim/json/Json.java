// Copyright 2015-2023 Nstream, inc.
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

package swim.json;

import swim.codec.Decoder;
import swim.codec.Encoder;
import swim.codec.Output;
import swim.codec.Parser;
import swim.codec.Unicode;
import swim.codec.Utf8;
import swim.codec.Writer;
import swim.structure.Data;
import swim.structure.Form;
import swim.structure.Item;
import swim.structure.Value;

/**
 * Factory for constructing JSON parsers and writers.
 */
public final class Json {

  private Json() {
    // static
  }

  private static JsonParser<Item, Value> structureParser;

  public static JsonParser<Item, Value> structureParser() {
    if (Json.structureParser == null) {
      Json.structureParser = new JsonStructureParser();
    }
    return Json.structureParser;
  }

  private static JsonWriter<Item, Value> structureWriter;

  public static JsonWriter<Item, Value> structureWriter() {
    if (Json.structureWriter == null) {
      Json.structureWriter = new JsonStructureWriter();
    }
    return Json.structureWriter;
  }

  public static Value parse(String json) {
    return Json.structureParser().parseValueString(json);
  }

  public static Parser<Value> parser() {
    return Json.structureParser().valueParser();
  }

  public static Writer<?, ?> write(Output<?> output, Item item) {
    return Json.structureWriter().writeItem(output, item);
  }

  public static String toString(Item item) {
    Output<String> output = Unicode.stringOutput();
    final Writer<?, ?> writer = Json.write(output, item);
    if (!writer.isDone()) {
      output = Output.error(writer.trap());
    }
    return output.bind();
  }

  public static Data toData(Item item) {
    Output<Data> output = Utf8.encodedOutput(Data.output());
    final Writer<?, ?> writer = Json.write(output, item);
    if (!writer.isDone()) {
      output = Output.error(writer.trap());
    }
    return output.bind();
  }

  public static <T> Parser<T> formParser(Form<T> form) {
    return new JsonFormParser<T>(Json.structureParser(), form);
  }

  public static <T> Decoder<T> formDecoder(Form<T> form) {
    return Utf8.decodedParser(Json.formParser(form));
  }

  public static <T> Writer<T, T> formWriter(Form<T> form) {
    return new JsonFormWriter<T>(Json.structureWriter(), form);
  }

  public static <T> Encoder<T, T> formEncoder(Form<T> form) {
    return Utf8.encodedWriter(Json.formWriter(form));
  }

  static boolean isSpace(int c) {
    return c == 0x20 || c == 0x9;
  }

  static boolean isNewline(int c) {
    return c == 0xa || c == 0xd;
  }

  static boolean isWhitespace(int c) {
    return Json.isSpace(c) || Json.isNewline(c);
  }

  static boolean isIdentStartChar(int c) {
    return c >= 'A' && c <= 'Z'
        || c == '_'
        || c >= 'a' && c <= 'z'
        || c >= 0xc0 && c <= 0xd6
        || c >= 0xd8 && c <= 0xf6
        || c >= 0xf8 && c <= 0x2ff
        || c >= 0x370 && c <= 0x37d
        || c >= 0x37f && c <= 0x1fff
        || c >= 0x200c && c <= 0x200d
        || c >= 0x2070 && c <= 0x218f
        || c >= 0x2c00 && c <= 0x2fef
        || c >= 0x3001 && c <= 0xd7ff
        || c >= 0xf900 && c <= 0xfdcf
        || c >= 0xfdf0 && c <= 0xfffd
        || c >= 0x10000 && c <= 0xeffff;
  }

  static boolean isIdentChar(int c) {
    return c == '-'
        || c >= '0' && c <= '9'
        || c >= 'A' && c <= 'Z'
        || c == '_'
        || c >= 'a' && c <= 'z'
        || c == 0xb7
        || c >= 0xc0 && c <= 0xd6
        || c >= 0xd8 && c <= 0xf6
        || c >= 0xf8 && c <= 0x37d
        || c >= 0x37f && c <= 0x1fff
        || c >= 0x200c && c <= 0x200d
        || c >= 0x203f && c <= 0x2040
        || c >= 0x2070 && c <= 0x218f
        || c >= 0x2c00 && c <= 0x2fef
        || c >= 0x3001 && c <= 0xd7ff
        || c >= 0xf900 && c <= 0xfdcf
        || c >= 0xfdf0 && c <= 0xfffd
        || c >= 0x10000 && c <= 0xeffff;
  }

}
