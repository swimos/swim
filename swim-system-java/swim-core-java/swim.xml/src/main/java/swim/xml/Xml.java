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

package swim.xml;

import swim.codec.Parser;
import swim.structure.Item;
import swim.structure.Value;

/**
 * Factory for constructing XML parsers and writers.
 */
public final class Xml {
  private Xml() {
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

  static boolean isChar(int c) {
    return c >= 0x1 && c <= 0xd7ff
        || c >= 0xe000 && c <= 0xfffd
        || c >= 0x10000 && c <= 0x10ffff;
  }

  static boolean isRestrictedChar(int c) {
    return c >= 0x1 && c <= 0x8
        || c >= 0xb && c <= 0xc
        || c >= 0xe && c <= 0x1f
        || c >= 0x7f && c <= 0x84
        || c >= 0x86 && c <= 0x9f;
  }

  static boolean isNameStartChar(int c) {
    return c == ':'
        || c >= 'A' && c <= 'Z'
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

  static boolean isNameChar(int c) {
    return c == '-' || c == '.'
        || c >= '0' && c <= '9'
        || c == ':'
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

  static boolean isPubidChar(int c) {
    return c == 0xa || c == 0xd || c == 0x20
        || c == '!' || c == '#' || c == '$' || c == '%' || c == '\''
        || c == '(' || c == ')' || c == '*' || c == '+' || c == ','
        || c == '-' || c == '.' || c == '/'
        || c >= '0' && c <= '9'
        || c == ':' || c == ';' || c == '=' || c == '?' || c == '@'
        || c >= 'A' && c <= 'Z'
        || c == '_'
        || c >= 'a' && c <= 'z';
  }

  private static XmlParser<Item, Value> structureParser;
  //private static XmlWriter<Item, Value> structureWriter;

  public static XmlParser<Item, Value> structureParser() {
    if (structureParser == null) {
      structureParser = new XmlStructureParser();
    }
    return structureParser;
  }

  //public static XmlWriter<Item, Value> structureWriter() {
  //  if (structureWriter == null) {
  //    structureWriter = new XmlStructureWriter();
  //  }
  //  return structureWriter;
  //}

  public static Value parse(String xml) {
    return structureParser().parseDocumentString(xml);
  }

  public static Value parseFragment(String xml) {
    return structureParser().parseFragmentString(xml);
  }

  public static Parser<Value> parser() {
    return structureParser().documentParser();
  }
}
