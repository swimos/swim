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

package swim.http;

import swim.annotations.Public;
import swim.annotations.Since;

@Public
@Since("5.0")
public final class Http {

  private Http() {
    // static
  }

  public static boolean isSpace(int c) {
    return c == 0x20 || c == 0x09;
  }

  public static boolean isAlpha(int c) {
    return (c >= 'A' && c <= 'Z')
        || (c >= 'a' && c <= 'z');
  }

  public static boolean isVisibleChar(int c) {
    return c >= 0x21 && c <= 0x7E;
  }

  public static boolean isFieldChar(int c) {
    return c >= 0x21 && c <= 0xFF;
  }

  public static boolean isPhraseChar(int c) {
    return Http.isSpace(c) || Http.isVisibleChar(c);
  }

  public static boolean isTokenChar(int c) {
    return c == '!' || c == '#'
        || c == '$' || c == '%'
        || c == '&' || c == '\''
        || c == '*' || c == '+'
        || c == '-' || c == '.'
        || (c >= '0' && c <= '9')
        || (c >= 'A' && c <= 'Z')
        || c == '^' || c == '_'
        || c == '`'
        || (c >= 'a' && c <= 'z')
        || c == '|' || c == '~';
  }

  public static boolean isCookieChar(int c) {
    return c == 0x21
        || (c >= 0x23 && c <= 0x2B)
        || (c >= 0x2D && c <= 0x3A)
        || (c >= 0x3C && c <= 0x5B)
        || (c >= 0x5D && c <= 0x7E);
  }

  public static boolean isCommentChar(int c) {
    return c == 0x09 || c == 0x20
        || (c >= 0x21 && c <= 0x27)
        || (c >= 0x2A && c <= 0x5B)
        || (c >= 0x5D && c <= 0x7E)
        || (c >= 0x80 && c <= 0xFF);
  }

  public static boolean isQuotedChar(int c) {
    return c == 0x09 || c == 0x20 || c == 0x21
        || (c >= 0x23 && c <= 0x5B)
        || (c >= 0x5D && c <= 0x7E)
        || (c >= 0x80 && c <= 0xFF);
  }

  public static boolean isEscapeChar(int c) {
    return c == 0x09 || c == 0x20
        || (c >= 0x21 && c <= 0x7E)
        || (c >= 0x80 && c <= 0xFF);
  }

  public static boolean isToken(String token) {
    final int n = token.length();
    if (n == 0) {
      return false;
    }
    for (int i = 0; i < n; i += 1) {
      if (!Http.isTokenChar(token.charAt(i))) {
        return false;
      }
    }
    return true;
  }

}
