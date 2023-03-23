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
import swim.http.HttpException;
import swim.http.HttpHeader;
import swim.http.HttpHeaderType;
import swim.http.HttpStatus;
import swim.uri.Uri;
import swim.uri.UriAuthority;
import swim.uri.UriHost;
import swim.uri.UriPort;
import swim.uri.UriScheme;
import swim.util.Notation;
import swim.util.ToSource;

@Public
@Since("5.0")
public final class OriginHeader extends HttpHeader {

  @Nullable FingerTrieList<Uri> origins;

  OriginHeader(String name, String value,
               @Nullable FingerTrieList<Uri> origins) {
    super(name, value);
    this.origins = origins;
  }

  public FingerTrieList<Uri> origins() throws HttpException {
    if (this.origins == null) {
      this.origins = OriginHeader.parseValue(this.value);
    }
    return this.origins;
  }

  @Override
  public OriginHeader withValue(String newValue) {
    return OriginHeader.of(this.name, newValue);
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("OriginHeader", "of")
            .appendArgument(this.value)
            .endInvoke();
  }

  public static final String NAME = "Origin";

  public static final HttpHeaderType<OriginHeader, FingerTrieList<Uri>> TYPE = new OriginHeaderType();

  public static OriginHeader empty() {
    return new OriginHeader(NAME, "null", FingerTrieList.empty());
  }

  public static OriginHeader of(String name, String value) {
    return new OriginHeader(name, value, null);
  }

  public static OriginHeader of(String name, FingerTrieList<Uri> origins) {
    final String value = OriginHeader.writeValue(origins.iterator());
    return new OriginHeader(name, value, origins);
  }

  public static OriginHeader of(FingerTrieList<Uri> origins) {
    return OriginHeader.of(NAME, origins);
  }

  public static OriginHeader of(Uri... origins) {
    return OriginHeader.of(NAME, FingerTrieList.of(origins));
  }

  public static OriginHeader of(String value) {
    return OriginHeader.of(NAME, value);
  }

  private static FingerTrieList<Uri> parseValue(String value) throws HttpException {
    FingerTrieList<Uri> origins = FingerTrieList.empty();
    if (!"null".equals(value)) {
      final StringInput input = new StringInput(value);
      do {
        final UriScheme scheme = UriScheme.parse(input);
        if (input.isCont() && input.head() == ':') {
          input.step();
        } else if (input.isReady()) {
          throw new HttpException(HttpStatus.BAD_REQUEST, "Malformed Origin: " + value,
                                  new ParseException(Diagnostic.expected(':', input)));
        }
        if (input.isCont() && input.head() == '/') {
          input.step();
        } else if (input.isReady()) {
          throw new HttpException(HttpStatus.BAD_REQUEST, "Malformed Origin: " + value,
                                  new ParseException(Diagnostic.expected('/', input)));
        }
        if (input.isCont() && input.head() == '/') {
          input.step();
        } else if (input.isReady()) {
          throw new HttpException(HttpStatus.BAD_REQUEST, "Malformed Origin: " + value,
                                  new ParseException(Diagnostic.expected('/', input)));
        }
        final UriHost host;
        try {
          host = UriHost.parse(input);
        } catch (ParseException cause) {
          throw new HttpException(HttpStatus.BAD_REQUEST, "Malformed Origin: " + value, cause);
        }
        UriPort port = null;
        if (input.isCont() && input.head() == ':') {
          input.step();
          try {
            port = UriPort.parse(input);
          } catch (ParseException cause) {
            throw new HttpException(HttpStatus.BAD_REQUEST, "Malformed Origin: " + value, cause);
          }
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
        throw new HttpException(HttpStatus.BAD_REQUEST, "Malformed Origin: " + value, input.getError());
      } else if (!input.isDone()) {
        throw new HttpException(HttpStatus.BAD_REQUEST, "Malformed Origin: " + value);
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

final class OriginHeaderType implements HttpHeaderType<OriginHeader, FingerTrieList<Uri>>, ToSource {

  @Override
  public String name() {
    return OriginHeader.NAME;
  }

  @Override
  public FingerTrieList<Uri> getValue(OriginHeader header) throws HttpException {
    return header.origins();
  }

  @Override
  public OriginHeader of(String name, String value) {
    return OriginHeader.of(name, value);
  }

  @Override
  public OriginHeader of(String name, FingerTrieList<Uri> origins) {
    return OriginHeader.of(name, origins);
  }

  @Override
  public @Nullable OriginHeader cast(HttpHeader header) {
    if (header instanceof OriginHeader) {
      return (OriginHeader) header;
    } else {
      return null;
    }
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.append("OriginHeader").append('.').append("TYPE");
  }

  @Override
  public String toString() {
    return this.toSource();
  }

}
