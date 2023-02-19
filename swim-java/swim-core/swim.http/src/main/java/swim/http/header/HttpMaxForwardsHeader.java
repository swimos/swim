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

import swim.annotations.Public;
import swim.annotations.Since;
import swim.codec.Base10;
import swim.codec.Diagnostic;
import swim.codec.ParseException;
import swim.codec.StringInput;
import swim.http.HttpHeader;
import swim.http.HttpHeaderType;
import swim.util.Notation;
import swim.util.ToSource;

@Public
@Since("5.0")
public final class HttpMaxForwardsHeader extends HttpHeader {

  int count;

  HttpMaxForwardsHeader(String name, String value, int count) {
    super(name, value);
    this.count = count;
  }

  public int count() {
    if (this.count < 0) {
      this.count = HttpMaxForwardsHeader.parseValue(this.value);
    }
    return this.count;
  }

  @Override
  public HttpMaxForwardsHeader withValue(String newValue) {
    return HttpMaxForwardsHeader.of(this.name, newValue);
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("HttpMaxForwardsHeader", "of")
            .appendArgument(this.count())
            .endInvoke();
  }

  public static final String NAME = "Max-Forwards";

  public static final HttpHeaderType<Integer> TYPE = new HttpMaxForwardsHeaderType();

  public static HttpMaxForwardsHeader of(String name, String value) {
    return new HttpMaxForwardsHeader(name, value, -1);
  }

  public static HttpMaxForwardsHeader of(String name, int count) {
    final String value = Integer.toString(count);
    if (count < 0) {
      throw new IllegalArgumentException(value);
    }
    return new HttpMaxForwardsHeader(name, value, count);
  }

  public static HttpMaxForwardsHeader of(int count) {
    return HttpMaxForwardsHeader.of(NAME, count);
  }

  private static int parseValue(String value) {
    final StringInput input = new StringInput(value);
    int count = 0;
    int c = 0;
    if (input.isCont()) {
      c = input.head();
      if (Base10.isDigit(c)) {
        input.step();
        count = Base10.decodeDigit(c);
      } else {
        throw new ParseException(Diagnostic.expected("digit", input));
      }
    } else if (input.isDone()) {
      throw new ParseException(Diagnostic.expected("digit", input));
    }
    while (input.isCont()) {
      c = input.head();
      if (Base10.isDigit(c)) {
        input.step();
        count = 10 * count + Base10.decodeDigit(c);
        if (count < 0) {
          throw new ParseException(Diagnostic.message("max-forwards overflow", input));
        }
      } else {
        break;
      }
    }
    if (input.isError()) {
      throw new ParseException(input.getError());
    } else if (!input.isDone()) {
      throw new ParseException(Diagnostic.unexpected(input));
    }
    return count;
  }

}

final class HttpMaxForwardsHeaderType implements HttpHeaderType<Integer>, ToSource {

  @Override
  public String name() {
    return HttpMaxForwardsHeader.NAME;
  }

  @Override
  public Integer getValue(HttpHeader header) {
    return ((HttpMaxForwardsHeader) header).count();
  }

  @Override
  public HttpHeader of(String name, String value) {
    return HttpMaxForwardsHeader.of(name, value);
  }

  @Override
  public HttpHeader of(String name, Integer count) {
    return HttpMaxForwardsHeader.of(name, count);
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.append("HttpMaxForwardsHeader").append('.').append("TYPE");
  }

  @Override
  public String toString() {
    return this.toSource();
  }

}
