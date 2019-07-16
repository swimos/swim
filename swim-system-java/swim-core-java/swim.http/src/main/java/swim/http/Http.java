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

package swim.http;

public final class Http {
  private Http() {
    // stub
  }

  private static HttpParser standardParser;
  private static HttpWriter standardWriter;

  public static HttpParser standardParser() {
    if (standardParser == null) {
      standardParser = new HttpParser();
    }
    return standardParser;
  }

  public static HttpWriter standardWriter() {
    if (standardWriter == null) {
      standardWriter = new HttpWriter();
    }
    return standardWriter;
  }

  public static boolean isSpace(int c) {
    return c == 0x20 || c == 0x09;
  }

  public static boolean isAlpha(int c) {
    return c >= 'A' && c <= 'Z' || c >= 'a' && c <= 'z';
  }

  public static boolean isVisibleChar(int c) {
    return c >= 0x21 && c <= 0x7e;
  }

  public static boolean isFieldChar(int c) {
    return c >= 0x21 && c <= 0xff;
  }

  public static boolean isPhraseChar(int c) {
    return isSpace(c) || isVisibleChar(c);
  }

  public static boolean isTokenChar(int c) {
    return c == '!' || c == '#'
        || c == '$' || c == '%'
        || c == '&' || c == '\''
        || c == '*' || c == '+'
        || c == '-' || c == '.'
        || c >= '0' && c <= '9'
        || c >= 'A' && c <= 'Z'
        || c == '^' || c == '_'
        || c == '`'
        || c >= 'a' && c <= 'z'
        || c == '|' || c == '~';
  }

  public static boolean isCommentChar(int c) {
    return c == 0x09 || c == 0x20
        || c >= 0x21 && c <= 0x27
        || c >= 0x2a && c <= 0x5b
        || c >= 0x5d && c <= 0x7e
        || c >= 0x80 && c <= 0xff;
  }

  public static boolean isQuotedChar(int c) {
    return c == 0x09 || c == 0x20 || c == 0x21
        || c >= 0x23 && c <= 0x5b
        || c >= 0x5d && c <= 0x7e
        || c >= 0x80 && c <= 0xff;
  }

  public static boolean isEscapeChar(int c) {
    return c == 0x09 || c == 0x20
        || c >= 0x21 && c <= 0x7e
        || c >= 0x80 && c <= 0xff;
  }

  public static boolean isToken(String token) {
    final int n = token.length();
    if (n == 0) {
      return false;
    }
    for (int i = 0; i < n; i += 1) {
      if (!isTokenChar(token.charAt(i))) {
        return false;
      }
    }
    return true;
  }
}
