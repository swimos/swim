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
import swim.codec.StringInput;
import swim.codec.StringOutput;
import swim.collections.FingerTrieList;
import swim.http.Http;
import swim.http.HttpException;
import swim.http.HttpHeader;
import swim.http.HttpHeaderType;
import swim.http.HttpStatus;
import swim.util.Notation;
import swim.util.WriteSource;

@Public
@Since("5.0")
public final class SecWebSocketProtocolHeader extends HttpHeader {

  @Nullable FingerTrieList<String> subprotocols;

  SecWebSocketProtocolHeader(String name, String value,
                             @Nullable FingerTrieList<String> subprotocols) {
    super(name, value);
    this.subprotocols = subprotocols;
  }

  public FingerTrieList<String> subprotocols() throws HttpException {
    if (this.subprotocols == null) {
      this.subprotocols = SecWebSocketProtocolHeader.parseValue(this.value);
    }
    return this.subprotocols;
  }

  @Override
  public SecWebSocketProtocolHeader withValue(String newValue) {
    return SecWebSocketProtocolHeader.of(this.name, newValue);
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("SecWebSocketProtocolHeader", "of")
            .appendArgument(this.value)
            .endInvoke();
  }

  public static final String NAME = "Sec-WebSocket-Protocol";

  public static final HttpHeaderType<SecWebSocketProtocolHeader, FingerTrieList<String>> TYPE = new SecWebSocketProtocolHeaderType();

  public static SecWebSocketProtocolHeader of(String name, String value) {
    return new SecWebSocketProtocolHeader(name, value, null);
  }

  public static SecWebSocketProtocolHeader of(String name, FingerTrieList<String> subprotocols) {
    final String value = SecWebSocketProtocolHeader.writeValue(subprotocols.iterator());
    return new SecWebSocketProtocolHeader(name, value, subprotocols);
  }

  public static SecWebSocketProtocolHeader of(FingerTrieList<String> subprotocols) {
    return SecWebSocketProtocolHeader.of(NAME, subprotocols);
  }

  public static SecWebSocketProtocolHeader of(String value) {
    return SecWebSocketProtocolHeader.of(NAME, value);
  }

  static FingerTrieList<String> parseValue(String value) throws HttpException {
    final StringInput input = new StringInput(value);
    int c = 0;
    FingerTrieList<String> subprotocols = FingerTrieList.empty();
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
        final StringBuilder protocolBuilder = new StringBuilder();
        protocolBuilder.appendCodePoint(c);
        while (input.isCont()) {
          c = input.head();
          if (Http.isTokenChar(c)) {
            input.step();
            protocolBuilder.appendCodePoint(c);
          } else {
            break;
          }
        }
        if (input.isReady()) {
          subprotocols = subprotocols.appended(protocolBuilder.toString());
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
      throw new HttpException(HttpStatus.BAD_REQUEST, "malformed Sec-WebSocket-Protocol: " + value, input.getError());
    } else if (!input.isDone()) {
      throw new HttpException(HttpStatus.BAD_REQUEST, "malformed Sec-WebSocket-Protocol: " + value);
    }
    return subprotocols;
  }

  static String writeValue(Iterator<String> subprotocols) {
    final StringOutput output = new StringOutput();
    String subprotocol = null;
    do {
      if (subprotocol != null) {
        output.write(',').write(' ');
      }
      subprotocol = subprotocols.next();
      if (subprotocol.length() == 0) {
        throw new IllegalArgumentException("blank websocket subprotocol");
      }
      for (int i = 0; i < subprotocol.length(); i = subprotocol.offsetByCodePoints(i, 1)) {
        final int c = subprotocol.codePointAt(i);
        if (Http.isTokenChar(c)) {
          output.write(c);
        } else {
          throw new IllegalArgumentException("invalid websocket subprotocol: " + subprotocol);
        }
      }
    } while (subprotocols.hasNext());
    return output.get();
  }

}

final class SecWebSocketProtocolHeaderType implements HttpHeaderType<SecWebSocketProtocolHeader, FingerTrieList<String>>, WriteSource {

  @Override
  public String name() {
    return SecWebSocketProtocolHeader.NAME;
  }

  @Override
  public FingerTrieList<String> getValue(SecWebSocketProtocolHeader header) throws HttpException {
    return header.subprotocols();
  }

  @Override
  public SecWebSocketProtocolHeader of(String name, String value) {
    return SecWebSocketProtocolHeader.of(name, value);
  }

  @Override
  public SecWebSocketProtocolHeader of(String name, FingerTrieList<String> subprotocols) {
    return SecWebSocketProtocolHeader.of(name, subprotocols);
  }

  @Override
  public @Nullable SecWebSocketProtocolHeader cast(HttpHeader header) {
    if (header instanceof SecWebSocketProtocolHeader) {
      return (SecWebSocketProtocolHeader) header;
    } else {
      return null;
    }
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.append("SecWebSocketProtocolHeader").append('.').append("TYPE");
  }

  @Override
  public String toString() {
    return WriteSource.toString(this);
  }

}
