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
import swim.codec.StringInput;
import swim.codec.StringOutput;
import swim.collections.FingerTrieList;
import swim.http.Http;
import swim.http.HttpException;
import swim.http.HttpHeader;
import swim.http.HttpHeaderType;
import swim.http.HttpStatus;
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

  public FingerTrieList<String> options() throws HttpException {
    if (this.options == null) {
      this.options = ConnectionHeader.parseValue(this.value);
    }
    return this.options;
  }

  public boolean contains(String option) {
    try {
      final FingerTrieList<String> options = this.options();
      for (int i = 0, n = options.size(); i < n; i += 1) {
        if (option.equalsIgnoreCase(options.get(i))) {
          return true;
        }
      }
    } catch (HttpException cause) {
      // ignore
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
            .appendArgument(this.value)
            .endInvoke();
  }

  public static final String NAME = "Connection";

  public static final HttpHeaderType<ConnectionHeader, FingerTrieList<String>> TYPE = new ConnectionHeaderType();

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

  public static ConnectionHeader of(String value) {
    return ConnectionHeader.of(NAME, value);
  }

  private static FingerTrieList<String> parseValue(String value) throws HttpException {
    final StringInput input = new StringInput(value);
    int c = 0;
    FingerTrieList<String> options = FingerTrieList.empty();
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
      throw new HttpException(HttpStatus.BAD_REQUEST, "malformed Connection: " + value, input.getError());
    } else if (!input.isDone()) {
      throw new HttpException(HttpStatus.BAD_REQUEST, "malformed Connection: " + value);
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
        throw new IllegalArgumentException("blank connection option");
      }
      for (int i = 0; i < option.length(); i = option.offsetByCodePoints(i, 1)) {
        final int c = option.codePointAt(i);
        if (Http.isTokenChar(c)) {
          output.write(c);
        } else {
          throw new IllegalArgumentException("invalid connection option: " + option);
        }
      }
    } while (options.hasNext());
    return output.get();
  }

}

final class ConnectionHeaderType implements HttpHeaderType<ConnectionHeader, FingerTrieList<String>>, ToSource {

  @Override
  public String name() {
    return ConnectionHeader.NAME;
  }

  @Override
  public FingerTrieList<String> getValue(ConnectionHeader header) throws HttpException {
    return header.options();
  }

  @Override
  public ConnectionHeader of(String name, String value) {
    return ConnectionHeader.of(name, value);
  }

  @Override
  public ConnectionHeader of(String name, FingerTrieList<String> options) {
    return ConnectionHeader.of(name, options);
  }

  @Override
  public @Nullable ConnectionHeader cast(HttpHeader header) {
    if (header instanceof ConnectionHeader) {
      return (ConnectionHeader) header;
    } else {
      return null;
    }
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
