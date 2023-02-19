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
import swim.http.HttpHeader;
import swim.http.HttpHeaderType;
import swim.http.HttpMethod;
import swim.util.Notation;
import swim.util.ToSource;

@Public
@Since("5.0")
public final class HttpAllowHeader extends HttpHeader {

  @Nullable FingerTrieList<HttpMethod> methods;

  HttpAllowHeader(String name, String value,
                  @Nullable FingerTrieList<HttpMethod> methods) {
    super(name, value);
    this.methods = methods;
  }

  public FingerTrieList<HttpMethod> methods() {
    if (this.methods == null) {
      this.methods = HttpAllowHeader.parseValue(this.value);
    }
    return this.methods;
  }

  @Override
  public HttpAllowHeader withValue(String newValue) {
    return HttpAllowHeader.of(this.name, newValue);
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("HttpAllowHeader", "of")
            .appendArgument(this.methods())
            .endInvoke();
  }

  public static final String NAME = "Allow";

  public static final HttpHeaderType<FingerTrieList<HttpMethod>> TYPE = new HttpAllowHeaderType();

  public static HttpAllowHeader of(String name, String value) {
    return new HttpAllowHeader(name, value, null);
  }

  public static HttpAllowHeader of(String name, FingerTrieList<HttpMethod> methods) {
    final String value = HttpAllowHeader.writeValue(methods.iterator());
    return new HttpAllowHeader(name, value, methods);
  }

  public static HttpAllowHeader of(FingerTrieList<HttpMethod> methods) {
    return HttpAllowHeader.of(NAME, methods);
  }

  public static HttpAllowHeader of(HttpMethod... methods) {
    return HttpAllowHeader.of(NAME, FingerTrieList.of(methods));
  }

  private static FingerTrieList<HttpMethod> parseValue(String value) {
    FingerTrieList<HttpMethod> methods = FingerTrieList.empty();
    final StringInput input = new StringInput(value);
    int c = 0;
    do {
      while (input.isCont()) {
        c = input.head();
        if (Http.isSpace(c)) {
          input.step();
        } else {
          break;
        }
      }
      if (input.isCont() && Http.isTokenChar(c)) {
        final HttpMethod method = HttpMethod.parse(input).getNonNull();
        methods = methods.appended(method);
      } else {
        break;
      }
      while (input.isCont()) {
        c = input.head();
        if (Http.isSpace(c)) {
          input.step();
        } else {
          break;
        }
      }
      if (input.isCont() && c == ',') {
        input.step();
        continue;
      } else {
        break;
      }
    } while (true);
    if (input.isError()) {
      throw new ParseException(input.getError());
    } else if (!input.isDone()) {
      throw new ParseException(Diagnostic.unexpected(input));
    }
    return methods;
  }

  private static String writeValue(Iterator<HttpMethod> methods) {
    final StringOutput output = new StringOutput();
    HttpMethod method = null;
    do {
      if (method != null) {
        output.write(',').write(' ');
      }
      method = methods.next();
      method.write(output).checkDone();
    } while (methods.hasNext());
    return output.get();
  }

}

final class HttpAllowHeaderType implements HttpHeaderType<FingerTrieList<HttpMethod>>, ToSource {

  @Override
  public String name() {
    return HttpAllowHeader.NAME;
  }

  @Override
  public FingerTrieList<HttpMethod> getValue(HttpHeader header) {
    return ((HttpAllowHeader) header).methods();
  }

  @Override
  public HttpHeader of(String name, String value) {
    return HttpAllowHeader.of(name, value);
  }

  @Override
  public HttpHeader of(String name, FingerTrieList<HttpMethod> methods) {
    return HttpAllowHeader.of(name, methods);
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.append("HttpAllowHeader").append('.').append("TYPE");
  }

  @Override
  public String toString() {
    return this.toSource();
  }

}
