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

import swim.annotations.Public;
import swim.annotations.Since;
import swim.codec.Base10;
import swim.codec.Diagnostic;
import swim.codec.ParseException;
import swim.codec.StringInput;
import swim.http.HttpHeader;
import swim.http.HttpHeaderType;
import swim.util.Notation;
import swim.util.ToSource;

@Public
@Since("5.0")
public final class ContentLengthHeader extends HttpHeader {

  long length;

  ContentLengthHeader(String name, String value, long length) {
    super(name, value);
    this.length = length;
  }

  public long length() {
    if (this.length < 0L) {
      this.length = ContentLengthHeader.parseValue(this.value);
    }
    return this.length;
  }

  @Override
  public ContentLengthHeader withValue(String newValue) {
    return ContentLengthHeader.of(this.name, newValue);
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("ContentLengthHeader", "of")
            .appendArgument(this.length())
            .endInvoke();
  }

  public static final String NAME = "Content-Length";

  public static final HttpHeaderType<Long> TYPE = new ContentLengthHeaderType();

  public static ContentLengthHeader of(String name, String value) {
    return new ContentLengthHeader(name, value, -1L);
  }

  public static ContentLengthHeader of(String name, long length) {
    final String value = Long.toString(length);
    if (length < 0L) {
      throw new IllegalArgumentException(value);
    }
    return new ContentLengthHeader(name, value, length);
  }

  public static ContentLengthHeader of(long length) {
    return ContentLengthHeader.of(NAME, length);
  }

  private static long parseValue(String value) {
    final StringInput input = new StringInput(value);
    long length = 0L;
    int c = 0;
    if (input.isCont()) {
      c = input.head();
      if (Base10.isDigit(c)) {
        input.step();
        length = (long) Base10.decodeDigit(c);
      } else {
        throw new ParseException(Diagnostic.expected("digit", input));
      }
    } else if (input.isDone()) {
      throw new ParseException(Diagnostic.expected("digit", input));
    }
    while (input.isCont()) {
      c = input.head();
      if (Base10.isDigit(c)) {
        input.step();
        length = 10L * length + (long) Base10.decodeDigit(c);
        if (length < 0L) {
          throw new ParseException(Diagnostic.message("content length overflow", input));
        }
      } else {
        break;
      }
    }
    if (input.isError()) {
      throw new ParseException(input.getError());
    } else if (!input.isDone()) {
      throw new ParseException(Diagnostic.unexpected(input));
    }
    return length;
  }

}

final class ContentLengthHeaderType implements HttpHeaderType<Long>, ToSource {

  @Override
  public String name() {
    return ContentLengthHeader.NAME;
  }

  @Override
  public Long getValue(HttpHeader header) {
    return ((ContentLengthHeader) header).length();
  }

  @Override
  public HttpHeader of(String name, String value) {
    return ContentLengthHeader.of(name, value);
  }

  @Override
  public HttpHeader of(String name, Long length) {
    return ContentLengthHeader.of(name, length);
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.append("ContentLengthHeader").append('.').append("TYPE");
  }

  @Override
  public String toString() {
    return this.toSource();
  }

}
