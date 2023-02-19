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
import swim.codec.ParseException;
import swim.codec.StringInput;
import swim.codec.StringOutput;
import swim.collections.FingerTrieList;
import swim.http.Http;
import swim.http.HttpCookie;
import swim.http.HttpHeader;
import swim.http.HttpHeaderType;
import swim.util.Notation;
import swim.util.ToSource;

@Public
@Since("5.0")
public final class HttpCookieHeader extends HttpHeader {

  @Nullable FingerTrieList<HttpCookie> cookies;

  HttpCookieHeader(String name, String value,
                   @Nullable FingerTrieList<HttpCookie> cookies) {
    super(name, value);
    this.cookies = cookies;
  }

  public FingerTrieList<HttpCookie> cookies() {
    if (this.cookies == null) {
      this.cookies = HttpCookieHeader.parseValue(this.value);
    }
    return this.cookies;
  }

  @Override
  public HttpCookieHeader withValue(String newValue) {
    return HttpCookieHeader.of(this.name, newValue);
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("HttpCookieHeader", "of")
            .appendArgument(this.cookies())
            .endInvoke();
  }

  public static final String NAME = "Cookie";

  public static final HttpHeaderType<FingerTrieList<HttpCookie>> TYPE = new HttpCookieHeaderType();

  public static HttpCookieHeader of(String name, String value) {
    return new HttpCookieHeader(name, value, null);
  }

  public static HttpCookieHeader of(String name, FingerTrieList<HttpCookie> cookies) {
    final String value = HttpCookieHeader.writeValue(cookies.iterator());
    return new HttpCookieHeader(name, value, cookies);
  }

  public static HttpCookieHeader of(FingerTrieList<HttpCookie> cookies) {
    return HttpCookieHeader.of(NAME, cookies);
  }

  public static HttpCookieHeader of(HttpCookie... cookies) {
    return HttpCookieHeader.of(NAME, FingerTrieList.of(cookies));
  }

  private static FingerTrieList<HttpCookie> parseValue(String value) {
    FingerTrieList<HttpCookie> cookies = FingerTrieList.empty();
    final StringInput input = new StringInput(value);
    do {
      if (input.isCont() && Http.isTokenChar(input.head())) {
        final HttpCookie cookie = HttpCookie.parse(input).getNonNull();
        cookies = cookies.appended(cookie);
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
        throw new ParseException(Diagnostic.expected(' ', input));
      }
    } while (true);
    if (input.isError()) {
      throw new ParseException(input.getError());
    } else if (!input.isDone()) {
      throw new ParseException(Diagnostic.unexpected(input));
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

final class HttpCookieHeaderType implements HttpHeaderType<FingerTrieList<HttpCookie>>, ToSource {

  @Override
  public String name() {
    return HttpCookieHeader.NAME;
  }

  @Override
  public FingerTrieList<HttpCookie> getValue(HttpHeader header) {
    return ((HttpCookieHeader) header).cookies();
  }

  @Override
  public HttpHeader of(String name, String value) {
    return HttpCookieHeader.of(name, value);
  }

  @Override
  public HttpHeader of(String name, FingerTrieList<HttpCookie> cookies) {
    return HttpCookieHeader.of(name, cookies);
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.append("HttpCookieHeader").append('.').append("TYPE");
  }

  @Override
  public String toString() {
    return this.toSource();
  }

}
