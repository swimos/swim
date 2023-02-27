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
import swim.codec.Diagnostic;
import swim.codec.ParseException;
import swim.codec.StringInput;
import swim.codec.StringOutput;
import swim.collections.FingerTrieList;
import swim.http.Http;
import swim.http.HttpHeader;
import swim.http.HttpHeaderType;
import swim.util.Notation;
import swim.util.ToSource;
import swim.ws.WsExtension;

@Public
@Since("5.0")
public final class SecWebSocketExtensionsHeader extends HttpHeader {

  @Nullable FingerTrieList<WsExtension> extensions;

  SecWebSocketExtensionsHeader(String name, String value,
                               @Nullable FingerTrieList<WsExtension> extensions) {
    super(name, value);
    this.extensions = extensions;
  }

  public FingerTrieList<WsExtension> extensions() {
    if (this.extensions == null) {
      this.extensions = SecWebSocketExtensionsHeader.parseValue(this.value);
    }
    return this.extensions;
  }

  @Override
  public SecWebSocketExtensionsHeader withValue(String newValue) {
    return SecWebSocketExtensionsHeader.of(this.name, newValue);
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("SecWebSocketExtensionsHeader", "of")
            .appendArgument(this.extensions())
            .endInvoke();
  }

  public static final String NAME = "Sec-WebSocket-Extensions";

  public static final HttpHeaderType<FingerTrieList<WsExtension>> TYPE = new SecWebSocketExtensionsHeaderType();

  public static SecWebSocketExtensionsHeader of(String name, String value) {
    return new SecWebSocketExtensionsHeader(name, value, null);
  }

  public static SecWebSocketExtensionsHeader of(String name, FingerTrieList<WsExtension> extensions) {
    final String value = SecWebSocketExtensionsHeader.writeValue(extensions.iterator());
    return new SecWebSocketExtensionsHeader(name, value, extensions);
  }

  public static SecWebSocketExtensionsHeader of(FingerTrieList<WsExtension> extensions) {
    return SecWebSocketExtensionsHeader.of(NAME, extensions);
  }

  public static SecWebSocketExtensionsHeader of(WsExtension... extensions) {
    return SecWebSocketExtensionsHeader.of(NAME, FingerTrieList.of(extensions));
  }

  private static FingerTrieList<WsExtension> parseValue(String value) {
    FingerTrieList<WsExtension> extensions = FingerTrieList.empty();
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
        final WsExtension extension = WsExtension.parse(input).getNonNull();
        extensions = extensions.appended(extension);
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
    return extensions;
  }

  private static String writeValue(Iterator<WsExtension> extensions) {
    final StringOutput output = new StringOutput();
    WsExtension extension = null;
    do {
      if (extension != null) {
        output.write(',').write(' ');
      }
      extension = extensions.next();
      extension.write(output).checkDone();
    } while (extensions.hasNext());
    return output.get();
  }

}

final class SecWebSocketExtensionsHeaderType implements HttpHeaderType<FingerTrieList<WsExtension>>, ToSource {

  @Override
  public String name() {
    return SecWebSocketExtensionsHeader.NAME;
  }

  @Override
  public FingerTrieList<WsExtension> getValue(HttpHeader header) {
    return ((SecWebSocketExtensionsHeader) header).extensions();
  }

  @Override
  public HttpHeader of(String name, String value) {
    return SecWebSocketExtensionsHeader.of(name, value);
  }

  @Override
  public HttpHeader of(String name, FingerTrieList<WsExtension> extensions) {
    return SecWebSocketExtensionsHeader.of(name, extensions);
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.append("SecWebSocketExtensionsHeader").append('.').append("TYPE");
  }

  @Override
  public String toString() {
    return this.toSource();
  }

}
