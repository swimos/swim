// Copyright 2015-2023 Nstream, inc.
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
import swim.codec.ParseException;
import swim.codec.StringInput;
import swim.http.HttpException;
import swim.http.HttpHeader;
import swim.http.HttpHeaderType;
import swim.http.HttpStatus;
import swim.uri.UriAuthority;
import swim.uri.UriHost;
import swim.uri.UriPort;
import swim.util.Notation;
import swim.util.WriteSource;

@Public
@Since("5.0")
public final class HostHeader extends HttpHeader {

  @Nullable UriAuthority authority;

  HostHeader(String name, String value, @Nullable UriAuthority authority) {
    super(name, value);
    this.authority = authority;
  }

  public UriAuthority authority() throws HttpException {
    if (this.authority == null) {
      this.authority = HostHeader.parseValue(this.value);
    }
    return this.authority;
  }

  @Override
  public HostHeader withValue(String newValue) {
    return HostHeader.of(this.name, newValue);
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("HostHeader", "of")
            .appendArgument(this.value)
            .endInvoke();
  }

  public static final String NAME = "Host";

  public static final HttpHeaderType<HostHeader, UriAuthority> TYPE = new HostHeaderType();

  public static HostHeader of(String name, String value) {
    return new HostHeader(name, value, null);
  }

  public static HostHeader of(String name, UriAuthority authority) {
    final String value = HostHeader.writeValue(authority);
    return new HostHeader(name, value, authority);
  }

  public static HostHeader of(UriAuthority authority) {
    return HostHeader.of(NAME, authority);
  }

  public static HostHeader of(String value) {
    return HostHeader.of(NAME, value);
  }

  static UriAuthority parseValue(String value) throws HttpException {
    final StringInput input = new StringInput(value);
    final UriHost host;
    try {
      host = UriHost.parse(input).getNonNull();
    } catch (ParseException cause) {
      throw new HttpException(HttpStatus.BAD_REQUEST, "malformed Host: " + value, cause);
    }
    UriPort port = null;
    if (input.isCont() && input.head() == ':') {
      input.step();
      try {
        port = UriPort.parse(input).getNonNull();
      } catch (ParseException cause) {
        throw new HttpException(HttpStatus.BAD_REQUEST, "malformed Host: " + value, cause);
      }
    }
    if (input.isError()) {
      throw new HttpException(HttpStatus.BAD_REQUEST, "malformed Host: " + value, input.getError());
    } else if (!input.isDone()) {
      throw new HttpException(HttpStatus.BAD_REQUEST, "malformed Host: " + value);
    }
    return UriAuthority.of(null, host, port);
  }

  static String writeValue(UriAuthority authority) {
    final StringBuilder output = new StringBuilder();
    try {
      authority.host().writeString(output);
      if (authority.port().isDefined()) {
        output.append(':');
        authority.port().writeString(output);
      }
      return output.toString();
    } catch (IOException cause) {
      throw new AssertionError(cause); // never actually throws
    }
  }

}

final class HostHeaderType implements HttpHeaderType<HostHeader, UriAuthority>, WriteSource {

  @Override
  public String name() {
    return HostHeader.NAME;
  }

  @Override
  public UriAuthority getValue(HostHeader header) throws HttpException {
    return header.authority();
  }

  @Override
  public HostHeader of(String name, String value) {
    return HostHeader.of(name, value);
  }

  @Override
  public HostHeader of(String name, UriAuthority authority) {
    return HostHeader.of(name, authority);
  }

  @Override
  public @Nullable HostHeader cast(HttpHeader header) {
    if (header instanceof HostHeader) {
      return (HostHeader) header;
    } else {
      return null;
    }
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.append("HostHeader").append('.').append("TYPE");
  }

  @Override
  public String toString() {
    return WriteSource.toString(this);
  }

}
