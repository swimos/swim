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
import swim.http.HttpProtocol;
import swim.util.Notation;
import swim.util.ToSource;

@Public
@Since("5.0")
public final class HttpUpgradeHeader extends HttpHeader {

  @Nullable FingerTrieList<HttpProtocol> protocols;

  HttpUpgradeHeader(String name, String value,
                    @Nullable FingerTrieList<HttpProtocol> protocols) {
    super(name, value);
    this.protocols = protocols;
  }

  public FingerTrieList<HttpProtocol> protocols() {
    if (this.protocols == null) {
      this.protocols = HttpUpgradeHeader.parseValue(this.value);
    }
    return this.protocols;
  }

  @Override
  public HttpUpgradeHeader withValue(String newValue) {
    return HttpUpgradeHeader.of(this.name, newValue);
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("HttpUpgradeHeader", "of")
            .appendArgument(this.protocols())
            .endInvoke();
  }

  public static final String NAME = "Upgrade";

  public static final HttpHeaderType<FingerTrieList<HttpProtocol>> TYPE = new HttpUpgradeHeaderType();

  public static HttpUpgradeHeader of(String name, String value) {
    return new HttpUpgradeHeader(name, value, null);
  }

  public static HttpUpgradeHeader of(String name, FingerTrieList<HttpProtocol> protocols) {
    final String value = HttpUpgradeHeader.writeValue(protocols.iterator());
    return new HttpUpgradeHeader(name, value, protocols);
  }

  public static HttpUpgradeHeader of(FingerTrieList<HttpProtocol> protocols) {
    return HttpUpgradeHeader.of(NAME, protocols);
  }

  public static HttpUpgradeHeader of(HttpProtocol... protocols) {
    return HttpUpgradeHeader.of(NAME, FingerTrieList.of(protocols));
  }

  private static FingerTrieList<HttpProtocol> parseValue(String value) {
    FingerTrieList<HttpProtocol> protocols = FingerTrieList.empty();
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
        final HttpProtocol protocol = HttpProtocol.parse(input).getNonNull();
        protocols = protocols.appended(protocol);
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
    return protocols;
  }

  private static String writeValue(Iterator<HttpProtocol> protocols) {
    final StringOutput output = new StringOutput();
    HttpProtocol protocol = null;
    do {
      if (protocol != null) {
        output.write(',').write(' ');
      }
      protocol = protocols.next();
      protocol.write(output).checkDone();
    } while (protocols.hasNext());
    return output.get();
  }

}

final class HttpUpgradeHeaderType implements HttpHeaderType<FingerTrieList<HttpProtocol>>, ToSource {

  @Override
  public String name() {
    return HttpUpgradeHeader.NAME;
  }

  @Override
  public FingerTrieList<HttpProtocol> getValue(HttpHeader header) {
    return ((HttpUpgradeHeader) header).protocols();
  }

  @Override
  public HttpHeader of(String name, String value) {
    return HttpUpgradeHeader.of(name, value);
  }

  @Override
  public HttpHeader of(String name, FingerTrieList<HttpProtocol> protocols) {
    return HttpUpgradeHeader.of(name, protocols);
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.append("HttpUpgradeHeader").append('.').append("TYPE");
  }

  @Override
  public String toString() {
    return this.toSource();
  }

}
