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
import swim.codec.MediaRange;
import swim.codec.ParseException;
import swim.codec.StringInput;
import swim.codec.StringOutput;
import swim.collections.FingerTrieList;
import swim.http.Http;
import swim.http.HttpHeader;
import swim.http.HttpHeaderType;
import swim.util.Notation;
import swim.util.ToSource;

@Public
@Since("5.0")
public final class HttpAcceptHeader extends HttpHeader {

  @Nullable FingerTrieList<MediaRange> mediaRanges;

  HttpAcceptHeader(String name, String value,
                   @Nullable FingerTrieList<MediaRange> mediaRanges) {
    super(name, value);
    this.mediaRanges = mediaRanges;
  }

  public FingerTrieList<MediaRange> mediaRanges() {
    if (this.mediaRanges == null) {
      this.mediaRanges = HttpAcceptHeader.parseValue(this.value);
    }
    return this.mediaRanges;
  }

  @Override
  public HttpAcceptHeader withValue(String newValue) {
    return HttpAcceptHeader.of(this.name, newValue);
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("HttpAcceptHeader", "create")
            .appendArgument(this.mediaRanges())
            .endInvoke();
  }

  public static final String NAME = "Accept";

  public static final HttpHeaderType<FingerTrieList<MediaRange>> TYPE = new HttpAcceptHeaderType();

  public static HttpAcceptHeader of(String name, String value) {
    return new HttpAcceptHeader(name, value, null);
  }

  public static HttpAcceptHeader create(String name, FingerTrieList<MediaRange> mediaRanges) {
    final String value = HttpAcceptHeader.writeValue(mediaRanges.iterator());
    return new HttpAcceptHeader(name, value, mediaRanges);
  }

  public static HttpAcceptHeader create(FingerTrieList<MediaRange> mediaRanges) {
    return HttpAcceptHeader.create(NAME, mediaRanges);
  }

  public static HttpAcceptHeader create(MediaRange... mediaRanges) {
    return HttpAcceptHeader.create(NAME, FingerTrieList.of(mediaRanges));
  }

  private static FingerTrieList<MediaRange> parseValue(String value) {
    FingerTrieList<MediaRange> mediaRanges = FingerTrieList.empty();
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
        final MediaRange mediaRange = MediaRange.parse(input).getNonNull();
        mediaRanges = mediaRanges.appended(mediaRange);
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
    return mediaRanges;
  }

  private static String writeValue(Iterator<MediaRange> mediaRanges) {
    final StringOutput output = new StringOutput();
    MediaRange mediaRange = null;
    do {
      if (mediaRange != null) {
        output.write(',').write(' ');
      }
      mediaRange = mediaRanges.next();
      mediaRange.write(output).checkDone();
    } while (mediaRanges.hasNext());
    return output.get();
  }

}

final class HttpAcceptHeaderType implements HttpHeaderType<FingerTrieList<MediaRange>>, ToSource {

  @Override
  public String name() {
    return HttpAcceptHeader.NAME;
  }

  @Override
  public FingerTrieList<MediaRange> getValue(HttpHeader header) {
    return ((HttpAcceptHeader) header).mediaRanges();
  }

  @Override
  public HttpHeader of(String name, String value) {
    return HttpAcceptHeader.of(name, value);
  }

  @Override
  public HttpHeader create(String name, FingerTrieList<MediaRange> mediaRanges) {
    return HttpAcceptHeader.create(name, mediaRanges);
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.append("HttpAcceptHeader").append('.').append("TYPE");
  }

  @Override
  public String toString() {
    return this.toSource();
  }

}
