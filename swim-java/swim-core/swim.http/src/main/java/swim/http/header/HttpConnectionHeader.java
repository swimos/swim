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
import swim.codec.WriteException;
import swim.collections.FingerTrieList;
import swim.http.Http;
import swim.http.HttpHeader;
import swim.http.HttpHeaderType;
import swim.util.Notation;
import swim.util.ToSource;

@Public
@Since("5.0")
public final class HttpConnectionHeader extends HttpHeader {

  @Nullable FingerTrieList<String> options;

  HttpConnectionHeader(String name, String value,
                       @Nullable FingerTrieList<String> options) {
    super(name, value);
    this.options = options;
  }

  public FingerTrieList<String> options() {
    if (this.options == null) {
      this.options = HttpConnectionHeader.parseValue(this.value);
    }
    return this.options;
  }

  @Override
  public HttpConnectionHeader withValue(String newValue) {
    return HttpConnectionHeader.of(this.name, newValue);
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("HttpConnectionHeader", "of")
            .appendArgument(this.options())
            .endInvoke();
  }

  public static final String NAME = "Connection";

  public static final HttpHeaderType<FingerTrieList<String>> TYPE = new HttpConnectionHeaderType();

  public static HttpConnectionHeader of(String name, String value) {
    return new HttpConnectionHeader(name, value, null);
  }

  public static HttpConnectionHeader of(String name, FingerTrieList<String> options) {
    final String value = HttpConnectionHeader.writeValue(options.iterator());
    return new HttpConnectionHeader(name, value, options);
  }

  public static HttpConnectionHeader of(FingerTrieList<String> options) {
    return HttpConnectionHeader.of(NAME, options);
  }

  private static FingerTrieList<String> parseValue(String value) {
    FingerTrieList<String> options = FingerTrieList.empty();
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
        input.step();
        final StringBuilder optionBuilder = new StringBuilder();
        optionBuilder.appendCodePoint(c);
        while (input.isCont()) {
          c = input.head();
          if (Http.isTokenChar(c)) {
            input.step();
            optionBuilder.appendCodePoint(c);
          } else {
            break;
          }
        }
        if (input.isReady()) {
          options = options.appended(optionBuilder.toString());
        } else {
          break;
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
      throw new ParseException(input.getError());
    } else if (!input.isDone()) {
      throw new ParseException(Diagnostic.unexpected(input));
    }
    return options;
  }

  private static String writeValue(Iterator<String> options) {
    final StringOutput output = new StringOutput();
    String option = null;
    do {
      if (option != null) {
        output.write(',').write(' ');
      }
      option = options.next();
      if (option.length() == 0) {
        throw new WriteException("Blank connection option");
      }
      for (int i = 0; i < option.length(); i = option.offsetByCodePoints(i, 1)) {
        final int c = option.codePointAt(i);
        if (Http.isTokenChar(c)) {
          output.write(c);
        } else {
          throw new WriteException("Invalid connection option: " + option);
        }
      }
    } while (options.hasNext());
    return output.get();
  }

}

final class HttpConnectionHeaderType implements HttpHeaderType<FingerTrieList<String>>, ToSource {

  @Override
  public String name() {
    return HttpConnectionHeader.NAME;
  }

  @Override
  public FingerTrieList<String> getValue(HttpHeader header) {
    return ((HttpConnectionHeader) header).options();
  }

  @Override
  public HttpHeader of(String name, String value) {
    return HttpConnectionHeader.of(name, value);
  }

  @Override
  public HttpHeader of(String name, FingerTrieList<String> options) {
    return HttpConnectionHeader.of(name, options);
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.append("HttpConnectionHeader").append('.').append("TYPE");
  }

  @Override
  public String toString() {
    return this.toSource();
  }

}
