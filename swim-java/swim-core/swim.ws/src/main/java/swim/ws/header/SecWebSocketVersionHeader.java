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

package swim.ws.header;

import java.util.Iterator;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.codec.Base10;
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
public final class SecWebSocketVersionHeader extends HttpHeader {

  @Nullable FingerTrieList<Integer> versions;

  SecWebSocketVersionHeader(String name, String value,
                            @Nullable FingerTrieList<Integer> versions) {
    super(name, value);
    this.versions = versions;
  }

  public FingerTrieList<Integer> versions() {
    if (this.versions == null) {
      this.versions = SecWebSocketVersionHeader.parseValue(this.value);
    }
    return this.versions;
  }

  @Override
  public SecWebSocketVersionHeader withValue(String newValue) {
    return SecWebSocketVersionHeader.of(this.name, newValue);
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("SecWebSocketVersionHeader", "of")
            .appendArgument(this.versions())
            .endInvoke();
  }

  public static final String NAME = "Sec-WebSocket-Version";

  public static final HttpHeaderType<FingerTrieList<Integer>> TYPE = new SecWebSocketVersionHeaderType();

  public static final SecWebSocketVersionHeader VERSION_13 = new SecWebSocketVersionHeader(NAME, "13", FingerTrieList.of(13));

  public static SecWebSocketVersionHeader of(String name, String value) {
    return new SecWebSocketVersionHeader(name, value, null);
  }

  public static SecWebSocketVersionHeader of(String name, FingerTrieList<Integer> versions) {
    final String value = SecWebSocketVersionHeader.writeValue(versions.iterator());
    return new SecWebSocketVersionHeader(name, value, versions);
  }

  public static SecWebSocketVersionHeader of(FingerTrieList<Integer> versions) {
    return SecWebSocketVersionHeader.of(NAME, versions);
  }

  public static SecWebSocketVersionHeader of(Integer... versions) {
    return SecWebSocketVersionHeader.of(NAME, FingerTrieList.of(versions));
  }

  private static FingerTrieList<Integer> parseValue(String value) {
    FingerTrieList<Integer> versions = FingerTrieList.empty();
    final StringInput input = new StringInput(value);
    int version = 0;
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
      if (input.isCont()) {
        if (Base10.isDigit(c)) {
          input.step();
          version = Base10.decodeDigit(c);
        } else {
          throw new ParseException(Diagnostic.expected("websocket version", input));
        }
      } else if (input.isDone()) {
        throw new ParseException(Diagnostic.expected("websocket version", input));
      } else {
        break;
      }
      if (version != 0) {
        while (input.isCont()) {
          c = input.head();
          if (Base10.isDigit(c)) {
            input.step();
            version = 10 * version + Base10.decodeDigit(c);
            if (version > 255) {
              throw new ParseException(Diagnostic.message("websocket version overflow", input));
            }
          } else {
            break;
          }
        }
      }
      versions = versions.appended(Integer.valueOf(version));
      version = 0;
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
    return versions;
  }

  private static String writeValue(Iterator<Integer> versions) {
    final StringOutput output = new StringOutput();
    int version = -1;
    do {
      if (version >= 0) {
        output.write(',').write(' ');
      }
      version = versions.next().intValue();
      if (version < 0 || version > 255) {
        throw new WriteException("Invalid websocket version: " + version);
      }
      if (version >= 100) {
        output.write(Base10.encodeDigit(version / 100));
      }
      if (version >= 10) {
        output.write(Base10.encodeDigit((version / 10) % 10));
      }
      output.write(Base10.encodeDigit(version % 10));
    } while (versions.hasNext());
    return output.get();
  }

}

final class SecWebSocketVersionHeaderType implements HttpHeaderType<FingerTrieList<Integer>>, ToSource {

  @Override
  public String name() {
    return SecWebSocketVersionHeader.NAME;
  }

  @Override
  public FingerTrieList<Integer> getValue(HttpHeader header) {
    return ((SecWebSocketVersionHeader) header).versions();
  }

  @Override
  public HttpHeader of(String name, String value) {
    return SecWebSocketVersionHeader.of(name, value);
  }

  @Override
  public HttpHeader of(String name, FingerTrieList<Integer> versions) {
    return SecWebSocketVersionHeader.of(name, versions);
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.append("SecWebSocketVersionHeader").append('.').append("TYPE");
  }

  @Override
  public String toString() {
    return this.toSource();
  }

}
