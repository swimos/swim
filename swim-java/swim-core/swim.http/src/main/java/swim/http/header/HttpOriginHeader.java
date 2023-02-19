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
import java.util.Iterator;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.codec.Diagnostic;
import swim.codec.ParseException;
import swim.codec.StringInput;
import swim.collections.FingerTrieList;
import swim.http.Http;
import swim.http.HttpHeader;
import swim.http.HttpHeaderType;
import swim.uri.Uri;
import swim.uri.UriAuthority;
import swim.uri.UriHost;
import swim.uri.UriPort;
import swim.uri.UriScheme;
import swim.util.Notation;
import swim.util.ToSource;

@Public
@Since("5.0")
public final class HttpOriginHeader extends HttpHeader {

  @Nullable FingerTrieList<Uri> origins;

  HttpOriginHeader(String name, String value,
                   @Nullable FingerTrieList<Uri> origins) {
    super(name, value);
    this.origins = origins;
  }

  public FingerTrieList<Uri> origins() {
    if (this.origins == null) {
      this.origins = HttpOriginHeader.parseValue(this.value);
    }
    return this.origins;
  }

  @Override
  public HttpOriginHeader withValue(String newValue) {
    return HttpOriginHeader.of(this.name, newValue);
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("HttpOriginHeader", "of")
            .appendArgument(this.origins())
            .endInvoke();
  }

  public static final String NAME = "Origin";

  public static final HttpHeaderType<FingerTrieList<Uri>> TYPE = new HttpOriginHeaderType();

  public static HttpOriginHeader empty() {
    return new HttpOriginHeader(NAME, "null", FingerTrieList.empty());
  }

  public static HttpOriginHeader of(String name, String value) {
    return new HttpOriginHeader(name, value, null);
  }

  public static HttpOriginHeader of(String name, FingerTrieList<Uri> origins) {
    final String value = HttpOriginHeader.writeValue(origins.iterator());
    return new HttpOriginHeader(name, value, origins);
  }

  public static HttpOriginHeader of(FingerTrieList<Uri> origins) {
    return HttpOriginHeader.of(NAME, origins);
  }

  public static HttpOriginHeader of(Uri... origins) {
    return HttpOriginHeader.of(NAME, FingerTrieList.of(origins));
  }

  private static FingerTrieList<Uri> parseValue(String value) {
    FingerTrieList<Uri> origins = FingerTrieList.empty();
    if (!"null".equals(value)) {
      final StringInput input = new StringInput(value);
      do {
        final UriScheme scheme = UriScheme.parse(input);
        if (input.isCont() && input.head() == ':') {
          input.step();
        } else if (input.isReady()) {
          throw new ParseException(Diagnostic.expected(':', input));
        }
        if (input.isCont() && input.head() == '/') {
          input.step();
        } else if (input.isReady()) {
          throw new ParseException(Diagnostic.expected('/', input));
        }
        if (input.isCont() && input.head() == '/') {
          input.step();
        } else if (input.isReady()) {
          throw new ParseException(Diagnostic.expected('/', input));
        }
        final UriHost host = UriHost.parse(input);
        UriPort port = null;
        if (input.isCont() && input.head() == ':') {
          input.step();
          port = UriPort.parse(input);
        }
        final UriAuthority authority = UriAuthority.of(null, host, port);
        final Uri origin = Uri.of(scheme, authority, null, null, null);
        origins = origins.appended(origin);
        if (input.isCont() && Http.isSpace(input.head())) {
          input.step();
          while (input.isCont()) {
            if (Http.isSpace(input.head())) {
              input.step();
            } else {
              break;
            }
          }
          if (input.isCont()) {
            continue;
          }
        }
        break;
      } while (true);
      if (input.isError()) {
        throw new ParseException(input.getError());
      } else if (!input.isDone()) {
        throw new ParseException(Diagnostic.unexpected(input));
      }
    }
    return origins;
  }

  private static String writeValue(Iterator<Uri> origins) {
    if (origins.hasNext()) {
      final StringBuilder output = new StringBuilder();
      Uri origin = null;
      try {
        do {
          if (origin != null) {
            output.append(' ');
          }
          origin = origins.next();
          origin.scheme().writeString(output);
          output.append(':').append('/').append('/');
          origin.host().writeString(output);
          if (origin.port().isDefined()) {
            output.append(':');
            origin.port().writeString(output);
          }
        } while (origins.hasNext());
        return output.toString();
      } catch (IOException cause) {
        throw new RuntimeException(cause); // never actually throws
      }
    } else {
      return "null";
    }
  }

}

final class HttpOriginHeaderType implements HttpHeaderType<FingerTrieList<Uri>>, ToSource {

  @Override
  public String name() {
    return HttpOriginHeader.NAME;
  }

  @Override
  public FingerTrieList<Uri> getValue(HttpHeader header) {
    return ((HttpOriginHeader) header).origins();
  }

  @Override
  public HttpHeader of(String name, String value) {
    return HttpOriginHeader.of(name, value);
  }

  @Override
  public HttpHeader of(String name, FingerTrieList<Uri> origins) {
    return HttpOriginHeader.of(name, origins);
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.append("HttpOriginHeader").append('.').append("TYPE");
  }

  @Override
  public String toString() {
    return this.toSource();
  }

}
