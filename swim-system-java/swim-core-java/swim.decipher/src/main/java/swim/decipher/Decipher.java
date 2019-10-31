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

package swim.decipher;

import swim.codec.Decoder;
import swim.codec.Parser;
import swim.structure.Item;
import swim.structure.Value;

/**
 * Factory for constructing format-detecting parsers and decoders.
 */
public final class Decipher {
  private Decipher() {
    // static
  }

  static boolean isSpace(int c) {
    return c == 0x20 || c == 0x9;
  }

  static boolean isNewline(int c) {
    return c == 0xa || c == 0xd;
  }

  static boolean isWhitespace(int c) {
    return isSpace(c) || isNewline(c);
  }

  private static DecipherDecoder<Item, Value> structureDecoder;
  private static DecipherParser<Item, Value> structureParser;

  public static DecipherDecoder<Item, Value> structureDecoder() {
    if (structureDecoder == null) {
      structureDecoder = new DecipherStructureDecoder();
    }
    return structureDecoder;
  }

  public static DecipherParser<Item, Value> structureParser() {
    if (structureParser == null) {
      structureParser = new DecipherStructureParser();
    }
    return structureParser;
  }

  public static Value parse(String any) {
    return structureParser().parseAnyString(any);
  }

  public static Parser<Value> parser() {
    return structureParser().anyParser();
  }

  public static Decoder<Value> decoder() {
    return structureDecoder().anyDecoder();
  }
}
