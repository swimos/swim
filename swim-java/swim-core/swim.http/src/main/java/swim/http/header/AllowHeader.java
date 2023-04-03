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
import swim.codec.Parse;
import swim.codec.StringInput;
import swim.codec.StringOutput;
import swim.collections.FingerTrieList;
import swim.http.Http;
import swim.http.HttpException;
import swim.http.HttpHeader;
import swim.http.HttpHeaderType;
import swim.http.HttpMethod;
import swim.http.HttpStatus;
import swim.util.Notation;
import swim.util.ToSource;

@Public
@Since("5.0")
public final class AllowHeader extends HttpHeader {

  @Nullable FingerTrieList<HttpMethod> methods;

  AllowHeader(String name, String value,
              @Nullable FingerTrieList<HttpMethod> methods) {
    super(name, value);
    this.methods = methods;
  }

  public FingerTrieList<HttpMethod> methods() throws HttpException {
    if (this.methods == null) {
      this.methods = AllowHeader.parseValue(this.value);
    }
    return this.methods;
  }

  @Override
  public AllowHeader withValue(String newValue) {
    return AllowHeader.of(this.name, newValue);
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("AllowHeader", "of")
            .appendArgument(this.value)
            .endInvoke();
  }

  public static final String NAME = "Allow";

  public static final HttpHeaderType<AllowHeader, FingerTrieList<HttpMethod>> TYPE = new AllowHeaderType();

  public static AllowHeader of(String name, String value) {
    return new AllowHeader(name, value, null);
  }

  public static AllowHeader of(String name, FingerTrieList<HttpMethod> methods) {
    final String value = AllowHeader.writeValue(methods.iterator());
    return new AllowHeader(name, value, methods);
  }

  public static AllowHeader of(FingerTrieList<HttpMethod> methods) {
    return AllowHeader.of(NAME, methods);
  }

  public static AllowHeader of(HttpMethod... methods) {
    return AllowHeader.of(NAME, FingerTrieList.of(methods));
  }

  public static AllowHeader of(String value) {
    return AllowHeader.of(NAME, value);
  }

  private static FingerTrieList<HttpMethod> parseValue(String value) throws HttpException {
    final StringInput input = new StringInput(value);
    int c = 0;
    FingerTrieList<HttpMethod> methods = FingerTrieList.empty();
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
        final Parse<HttpMethod> parseMethod = HttpMethod.parse(input);
        if (parseMethod.isDone()) {
          methods = methods.appended(parseMethod.getNonNullUnchecked());
        } else if (parseMethod.isError()) {
          throw new HttpException(HttpStatus.BAD_REQUEST, "malformed Allow: " + value, parseMethod.getError());
        } else {
          throw new HttpException(HttpStatus.BAD_REQUEST, "malformed Allow: " + value);
        }
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
      throw new HttpException(HttpStatus.BAD_REQUEST, "malformed Allow: " + value, input.getError());
    } else if (!input.isDone()) {
      throw new HttpException(HttpStatus.BAD_REQUEST, "malformed Allow: " + value);
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
      method.write(output).assertDone();
    } while (methods.hasNext());
    return output.get();
  }

}

final class AllowHeaderType implements HttpHeaderType<AllowHeader, FingerTrieList<HttpMethod>>, ToSource {

  @Override
  public String name() {
    return AllowHeader.NAME;
  }

  @Override
  public FingerTrieList<HttpMethod> getValue(AllowHeader header) throws HttpException {
    return header.methods();
  }

  @Override
  public AllowHeader of(String name, String value) {
    return AllowHeader.of(name, value);
  }

  @Override
  public AllowHeader of(String name, FingerTrieList<HttpMethod> methods) {
    return AllowHeader.of(name, methods);
  }

  @Override
  public @Nullable AllowHeader cast(HttpHeader header) {
    if (header instanceof AllowHeader) {
      return (AllowHeader) header;
    } else {
      return null;
    }
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.append("AllowHeader").append('.').append("TYPE");
  }

  @Override
  public String toString() {
    return this.toSource();
  }

}
