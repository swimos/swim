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

package swim.http.header;

import java.util.Iterator;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.codec.Diagnostic;
import swim.codec.Parse;
import swim.codec.ParseException;
import swim.codec.StringInput;
import swim.codec.StringOutput;
import swim.collections.FingerTrieList;
import swim.http.Http;
import swim.http.HttpCookie;
import swim.http.HttpException;
import swim.http.HttpHeader;
import swim.http.HttpHeaderType;
import swim.http.HttpStatus;
import swim.util.Notation;
import swim.util.ToSource;

@Public
@Since("5.0")
public final class CookieHeader extends HttpHeader {

  @Nullable FingerTrieList<HttpCookie> cookies;

  CookieHeader(String name, String value,
               @Nullable FingerTrieList<HttpCookie> cookies) {
    super(name, value);
    this.cookies = cookies;
  }

  public FingerTrieList<HttpCookie> cookies() throws HttpException {
    if (this.cookies == null) {
      this.cookies = CookieHeader.parseValue(this.value);
    }
    return this.cookies;
  }

  @Override
  public CookieHeader withValue(String newValue) {
    return CookieHeader.of(this.name, newValue);
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("CookieHeader", "of")
            .appendArgument(this.value)
            .endInvoke();
  }

  public static final String NAME = "Cookie";

  public static final HttpHeaderType<CookieHeader, FingerTrieList<HttpCookie>> TYPE = new CookieHeaderType();

  public static CookieHeader of(String name, String value) {
    return new CookieHeader(name, value, null);
  }

  public static CookieHeader of(String name, FingerTrieList<HttpCookie> cookies) {
    final String value = CookieHeader.writeValue(cookies.iterator());
    return new CookieHeader(name, value, cookies);
  }

  public static CookieHeader of(FingerTrieList<HttpCookie> cookies) {
    return CookieHeader.of(NAME, cookies);
  }

  public static CookieHeader of(HttpCookie... cookies) {
    return CookieHeader.of(NAME, FingerTrieList.of(cookies));
  }

  public static CookieHeader of(String value) {
    return CookieHeader.of(NAME, value);
  }

  private static FingerTrieList<HttpCookie> parseValue(String value) throws HttpException {
    final StringInput input = new StringInput(value);
    FingerTrieList<HttpCookie> cookies = FingerTrieList.empty();
    do {
      if (input.isCont() && Http.isTokenChar(input.head())) {
        final Parse<HttpCookie> parseCookie = HttpCookie.parse(input);
        if (parseCookie.isDone()) {
          cookies = cookies.appended(parseCookie.getNonNull());
        } else if (parseCookie.isError()) {
          throw new HttpException(HttpStatus.BAD_REQUEST, "Malformed Cookie: " + value, parseCookie.getError());
        } else {
          throw new HttpException(HttpStatus.BAD_REQUEST, "Malformed Cookie: " + value);
        }
      } else {
        break;
      }
      if (input.isCont() && input.head() == ';') {
        input.step();
      } else {
        break;
      }
      if (input.isCont() && input.head() == ' ') {
        input.step();
        continue;
      } else {
        throw new HttpException(HttpStatus.BAD_REQUEST, "Malformed Cookie: " + value,
                                new ParseException(Diagnostic.expected(' ', input)));
      }
    } while (true);
    if (input.isError()) {
      throw new HttpException(HttpStatus.BAD_REQUEST, "Malformed Cookie: " + value, input.getError());
    } else if (!input.isDone()) {
      throw new HttpException(HttpStatus.BAD_REQUEST, "Malformed Cookie: " + value);
    }
    return cookies;
  }

  private static String writeValue(Iterator<HttpCookie> cookies) {
    final StringOutput output = new StringOutput();
    HttpCookie cookie = null;
    do {
      if (cookie != null) {
        output.write(';').write(' ');
      }
      cookie = cookies.next();
      cookie.write(output).checkDone();
    } while (cookies.hasNext());
    return output.get();
  }

}

final class CookieHeaderType implements HttpHeaderType<CookieHeader, FingerTrieList<HttpCookie>>, ToSource {

  @Override
  public String name() {
    return CookieHeader.NAME;
  }

  @Override
  public FingerTrieList<HttpCookie> getValue(CookieHeader header) throws HttpException {
    return header.cookies();
  }

  @Override
  public CookieHeader of(String name, String value) {
    return CookieHeader.of(name, value);
  }

  @Override
  public CookieHeader of(String name, FingerTrieList<HttpCookie> cookies) {
    return CookieHeader.of(name, cookies);
  }

  @Override
  public @Nullable CookieHeader cast(HttpHeader header) {
    if (header instanceof CookieHeader) {
      return (CookieHeader) header;
    } else {
      return null;
    }
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.append("CookieHeader").append('.').append("TYPE");
  }

  @Override
  public String toString() {
    return this.toSource();
  }

}
