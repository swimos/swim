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
public final class ConnectionHeader extends HttpHeader {

  @Nullable FingerTrieList<String> options;

  ConnectionHeader(String name, String value,
                   @Nullable FingerTrieList<String> options) {
    super(name, value);
    this.options = options;
  }

  public FingerTrieList<String> options() {
    if (this.options == null) {
      this.options = ConnectionHeader.parseValue(this.value);
    }
    return this.options;
  }

  public boolean contains(String option) {
    final FingerTrieList<String> options = this.options();
    for (int i = 0, n = options.size(); i < n; i += 1) {
      if (option.equalsIgnoreCase(options.get(i))) {
        return true;
      }
    }
    return false;
  }

  @Override
  public ConnectionHeader withValue(String newValue) {
    return ConnectionHeader.of(this.name, newValue);
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("ConnectionHeader", "of")
            .appendArgument(this.options())
            .endInvoke();
  }

  public static final String NAME = "Connection";

  public static final HttpHeaderType<FingerTrieList<String>> TYPE = new ConnectionHeaderType();

  public static final ConnectionHeader CLOSE = new ConnectionHeader(NAME, "close", FingerTrieList.of("close"));

  public static final ConnectionHeader UPGRADE = new ConnectionHeader(NAME, "Upgrade", FingerTrieList.of("Upgrade"));

  public static ConnectionHeader of(String name, String value) {
    return new ConnectionHeader(name, value, null);
  }

  public static ConnectionHeader of(String name, FingerTrieList<String> options) {
    final String value = ConnectionHeader.writeValue(options.iterator());
    return new ConnectionHeader(name, value, options);
  }

  public static ConnectionHeader of(FingerTrieList<String> options) {
    return ConnectionHeader.of(NAME, options);
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

final class ConnectionHeaderType implements HttpHeaderType<FingerTrieList<String>>, ToSource {

  @Override
  public String name() {
    return ConnectionHeader.NAME;
  }

  @Override
  public FingerTrieList<String> getValue(HttpHeader header) {
    return ((ConnectionHeader) header).options();
  }

  @Override
  public HttpHeader of(String name, String value) {
    return ConnectionHeader.of(name, value);
  }

  @Override
  public HttpHeader of(String name, FingerTrieList<String> options) {
    return ConnectionHeader.of(name, options);
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.append("ConnectionHeader").append('.').append("TYPE");
  }

  @Override
  public String toString() {
    return this.toSource();
  }

}
