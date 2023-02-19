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

import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.http.HttpCookieState;
import swim.http.HttpHeader;
import swim.http.HttpHeaderType;
import swim.util.Notation;
import swim.util.ToSource;

@Public
@Since("5.0")
public final class HttpSetCookieHeader extends HttpHeader {

  @Nullable HttpCookieState cookie;

  HttpSetCookieHeader(String name, String value, @Nullable HttpCookieState cookie) {
    super(name, value);
    this.cookie = cookie;
  }

  public HttpCookieState cookie() {
    if (this.cookie == null) {
      this.cookie = HttpCookieState.parse(this.value);
    }
    return this.cookie;
  }

  @Override
  public HttpSetCookieHeader withValue(String newValue) {
    return HttpSetCookieHeader.of(this.name, newValue);
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("HttpSetCookieHeader", "of")
            .appendArgument(this.cookie())
            .endInvoke();
  }

  public static final String NAME = "Set-Cookie";

  public static final HttpHeaderType<HttpCookieState> TYPE = new HttpSetCookieHeaderType();

  public static HttpSetCookieHeader of(String name, String value) {
    return new HttpSetCookieHeader(name, value, null);
  }

  public static HttpSetCookieHeader of(String name, HttpCookieState cookie) {
    final String value = cookie.toString();
    return new HttpSetCookieHeader(name, value, cookie);
  }

  public static HttpSetCookieHeader of(HttpCookieState cookie) {
    return HttpSetCookieHeader.of(NAME, cookie);
  }

}

final class HttpSetCookieHeaderType implements HttpHeaderType<HttpCookieState>, ToSource {

  @Override
  public String name() {
    return HttpSetCookieHeader.NAME;
  }

  @Override
  public HttpCookieState getValue(HttpHeader header) {
    return ((HttpSetCookieHeader) header).cookie();
  }

  @Override
  public HttpHeader of(String name, String value) {
    return HttpSetCookieHeader.of(name, value);
  }

  @Override
  public HttpHeader of(String name, HttpCookieState cookie) {
    return HttpSetCookieHeader.of(name, cookie);
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.append("HttpSetCookieHeader").append('.').append("TYPE");
  }

  @Override
  public String toString() {
    return this.toSource();
  }

}
