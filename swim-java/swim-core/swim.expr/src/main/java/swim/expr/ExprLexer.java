// Copyright 2015-2022 Swim.inc
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

package swim.expr;

import swim.annotations.Public;
import swim.annotations.Since;

/**
 * Lexical definitions used by expression parsers and writers.
 */
@Public
@Since("5.0")
public class ExprLexer {

  protected ExprLexer() {
    // nop
  }

  public boolean isSpace(int c) {
    return c == 0x20 || c == 0x9;
  }

  public boolean isNewline(int c) {
    return c == 0xA || c == 0xD;
  }

  public boolean isWhitespace(int c) {
    return this.isSpace(c) || this.isNewline(c);
  }

  public boolean isIdentifierStartChar(int c) {
    return (c >= 'A' && c <= 'Z')
        || c == '_'
        || (c >= 'a' && c <= 'z')
        || (c >= 0xC0 && c <= 0xD6)
        || (c >= 0xD8 && c <= 0xF6)
        || (c >= 0xF8 && c <= 0x2FF)
        || (c >= 0x370 && c <= 0x37D)
        || (c >= 0x37F && c <= 0x1FFF)
        || (c >= 0x200C && c <= 0x200D)
        || (c >= 0x2070 && c <= 0x218F)
        || (c >= 0x2C00 && c <= 0x2FEF)
        || (c >= 0x3001 && c <= 0xD7FF)
        || (c >= 0xF900 && c <= 0xFDCF)
        || (c >= 0xFDF0 && c <= 0xFFFD)
        || (c >= 0x10000 && c <= 0xEFFFF);
  }

  public boolean isIdentifierChar(int c) {
    return (c >= '0' && c <= '9')
        || (c >= 'A' && c <= 'Z')
        || c == '_'
        || (c >= 'a' && c <= 'z')
        || c == 0xB7
        || (c >= 0xC0 && c <= 0xD6)
        || (c >= 0xD8 && c <= 0xF6)
        || (c >= 0xF8 && c <= 0x37D)
        || (c >= 0x37F && c <= 0x1FFF)
        || (c >= 0x200C && c <= 0x200D)
        || (c >= 0x203F && c <= 0x2040)
        || (c >= 0x2070 && c <= 0x218F)
        || (c >= 0x2C00 && c <= 0x2FEF)
        || (c >= 0x3001 && c <= 0xD7FF)
        || (c >= 0xF900 && c <= 0xFDCF)
        || (c >= 0xFDF0 && c <= 0xFFFD)
        || (c >= 0x10000 && c <= 0xEFFFF);
  }

  public boolean isIdentifier(String value) {
    final int n = value.length();
    if (n == 0 || !this.isIdentifierStartChar(value.codePointAt(0))) {
      return false;
    }
    for (int i = value.offsetByCodePoints(0, 1); i < n; i = value.offsetByCodePoints(i, 1)) {
      if (!this.isIdentifierChar(value.codePointAt(i))) {
        return false;
      }
    }
    return true;
  }

  public boolean isKeyword(String value) {
    switch (value) {
      case "undefined":
      case "null":
      case "false":
      case "true":
        return true;
      default:
        return false;
    }
  }

}
