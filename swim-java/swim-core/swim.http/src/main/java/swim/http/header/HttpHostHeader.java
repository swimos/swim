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

import java.io.IOException;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.codec.Diagnostic;
import swim.codec.ParseException;
import swim.codec.StringInput;
import swim.http.HttpHeader;
import swim.http.HttpHeaderType;
import swim.uri.UriAuthority;
import swim.uri.UriHost;
import swim.uri.UriPort;
import swim.util.Notation;
import swim.util.ToSource;

@Public
@Since("5.0")
public final class HttpHostHeader extends HttpHeader {

  @Nullable UriAuthority authority;

  HttpHostHeader(String name, String value, @Nullable UriAuthority authority) {
    super(name, value);
    this.authority = authority;
  }

  public UriAuthority authority() {
    if (this.authority == null) {
      this.authority = HttpHostHeader.parseValue(this.value);
    }
    return this.authority;
  }

  @Override
  public HttpHostHeader withValue(String newValue) {
    return HttpHostHeader.of(this.name, newValue);
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("HttpHostHeader", "of")
            .appendArgument(this.authority())
            .endInvoke();
  }

  public static final String NAME = "Host";

  public static final HttpHeaderType<UriAuthority> TYPE = new HttpHostHeaderType();

  public static HttpHostHeader of(String name, String value) {
    return new HttpHostHeader(name, value, null);
  }

  public static HttpHostHeader of(String name, UriAuthority authority) {
    final String value = HttpHostHeader.writeValue(authority);
    return new HttpHostHeader(name, value, authority);
  }

  public static HttpHostHeader of(UriAuthority authority) {
    return HttpHostHeader.of(NAME, authority);
  }

  public static HttpHostHeader of(String value) {
    return HttpHostHeader.of(NAME, value);
  }

  private static UriAuthority parseValue(String value) {
    final StringInput input = new StringInput(value);
    final UriHost host = UriHost.parse(input);
    UriPort port = null;
    if (input.isCont() && input.head() == ':') {
      input.step();
      port = UriPort.parse(input);
    }
    if (input.isError()) {
      throw new ParseException(input.getError());
    } else if (!input.isDone()) {
      throw new ParseException(Diagnostic.unexpected(input));
    }
    return UriAuthority.of(null, host, port);
  }

  private static String writeValue(UriAuthority authority) {
    final StringBuilder output = new StringBuilder();
    try {
      authority.host().writeString(output);
      if (authority.port().isDefined()) {
        output.append(':');
        authority.port().writeString(output);
      }
      return output.toString();
    } catch (IOException cause) {
      throw new RuntimeException(cause); // never actually throws
    }
  }

}

final class HttpHostHeaderType implements HttpHeaderType<UriAuthority>, ToSource {

  @Override
  public String name() {
    return HttpHostHeader.NAME;
  }

  @Override
  public UriAuthority getValue(HttpHeader header) {
    return ((HttpHostHeader) header).authority();
  }

  @Override
  public HttpHeader of(String name, String value) {
    return HttpHostHeader.of(name, value);
  }

  @Override
  public HttpHeader of(String name, UriAuthority authority) {
    return HttpHostHeader.of(name, authority);
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.append("HttpHostHeader").append('.').append("TYPE");
  }

  @Override
  public String toString() {
    return this.toSource();
  }

}
