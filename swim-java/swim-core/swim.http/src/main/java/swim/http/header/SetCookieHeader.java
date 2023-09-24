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

package swim.http.header;

import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.codec.Parse;
import swim.codec.StringInput;
import swim.http.HttpCookieState;
import swim.http.HttpException;
import swim.http.HttpHeader;
import swim.http.HttpHeaderType;
import swim.http.HttpStatus;
import swim.util.Notation;
import swim.util.WriteSource;

@Public
@Since("5.0")
public final class SetCookieHeader extends HttpHeader {

  @Nullable HttpCookieState cookie;

  SetCookieHeader(String name, String value, @Nullable HttpCookieState cookie) {
    super(name, value);
    this.cookie = cookie;
  }

  public HttpCookieState cookie() throws HttpException {
    if (this.cookie == null) {
      this.cookie = SetCookieHeader.parseValue(this.value);
    }
    return this.cookie;
  }

  @Override
  public SetCookieHeader withValue(String newValue) {
    return SetCookieHeader.of(this.name, newValue);
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("SetCookieHeader", "of")
            .appendArgument(this.value)
            .endInvoke();
  }

  public static final String NAME = "Set-Cookie";

  public static final HttpHeaderType<SetCookieHeader, HttpCookieState> TYPE = new SetCookieHeaderType();

  public static SetCookieHeader of(String name, String value) {
    return new SetCookieHeader(name, value, null);
  }

  public static SetCookieHeader of(String name, HttpCookieState cookie) {
    final String value = cookie.toString();
    return new SetCookieHeader(name, value, cookie);
  }

  public static SetCookieHeader of(HttpCookieState cookie) {
    return SetCookieHeader.of(NAME, cookie);
  }

  public static SetCookieHeader of(String value) {
    return SetCookieHeader.of(NAME, value);
  }

  static HttpCookieState parseValue(String value) throws HttpException {
    final StringInput input = new StringInput(value);
    final Parse<HttpCookieState> parseCookieState = HttpCookieState.parse(input);
    if (parseCookieState.isDone()) {
      return parseCookieState.getNonNullUnchecked();
    } else if (parseCookieState.isError()) {
      throw new HttpException(HttpStatus.BAD_REQUEST, "malformed Set-Cookie: " + value, parseCookieState.getError());
    } else {
      throw new HttpException(HttpStatus.BAD_REQUEST, "malformed Set-Cookie: " + value);
    }
  }

}

final class SetCookieHeaderType implements HttpHeaderType<SetCookieHeader, HttpCookieState>, WriteSource {

  @Override
  public String name() {
    return SetCookieHeader.NAME;
  }

  @Override
  public HttpCookieState getValue(SetCookieHeader header) throws HttpException {
    return header.cookie();
  }

  @Override
  public SetCookieHeader of(String name, String value) {
    return SetCookieHeader.of(name, value);
  }

  @Override
  public SetCookieHeader of(String name, HttpCookieState cookie) {
    return SetCookieHeader.of(name, cookie);
  }

  @Override
  public @Nullable SetCookieHeader cast(HttpHeader header) {
    if (header instanceof SetCookieHeader) {
      return (SetCookieHeader) header;
    } else {
      return null;
    }
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.append("SetCookieHeader").append('.').append("TYPE");
  }

  @Override
  public String toString() {
    return WriteSource.toString(this);
  }

}
