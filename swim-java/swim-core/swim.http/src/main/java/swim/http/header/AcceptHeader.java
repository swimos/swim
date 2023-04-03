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
import swim.codec.MediaRange;
import swim.codec.Parse;
import swim.codec.StringInput;
import swim.codec.StringOutput;
import swim.collections.FingerTrieList;
import swim.http.Http;
import swim.http.HttpException;
import swim.http.HttpHeader;
import swim.http.HttpHeaderType;
import swim.http.HttpStatus;
import swim.util.Notation;
import swim.util.ToSource;

@Public
@Since("5.0")
public final class AcceptHeader extends HttpHeader {

  @Nullable FingerTrieList<MediaRange> mediaRanges;

  AcceptHeader(String name, String value,
               @Nullable FingerTrieList<MediaRange> mediaRanges) {
    super(name, value);
    this.mediaRanges = mediaRanges;
  }

  public FingerTrieList<MediaRange> mediaRanges() throws HttpException {
    if (this.mediaRanges == null) {
      this.mediaRanges = AcceptHeader.parseValue(this.value);
    }
    return this.mediaRanges;
  }

  @Override
  public AcceptHeader withValue(String newValue) {
    return AcceptHeader.of(this.name, newValue);
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("AcceptHeader", "of")
            .appendArgument(this.value)
            .endInvoke();
  }

  public static final String NAME = "Accept";

  public static final HttpHeaderType<AcceptHeader, FingerTrieList<MediaRange>> TYPE = new AcceptHeaderType();

  public static AcceptHeader of(String name, String value) {
    return new AcceptHeader(name, value, null);
  }

  public static AcceptHeader of(String name, FingerTrieList<MediaRange> mediaRanges) {
    final String value = AcceptHeader.writeValue(mediaRanges.iterator());
    return new AcceptHeader(name, value, mediaRanges);
  }

  public static AcceptHeader of(FingerTrieList<MediaRange> mediaRanges) {
    return AcceptHeader.of(NAME, mediaRanges);
  }

  public static AcceptHeader of(MediaRange... mediaRanges) {
    return AcceptHeader.of(NAME, FingerTrieList.of(mediaRanges));
  }

  public static AcceptHeader of(String value) {
    return AcceptHeader.of(NAME, value);
  }

  private static FingerTrieList<MediaRange> parseValue(String value) throws HttpException {
    final StringInput input = new StringInput(value);
    int c = 0;
    FingerTrieList<MediaRange> mediaRanges = FingerTrieList.empty();
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
        final Parse<MediaRange> parseMediaRange = MediaRange.parse(input);
        if (parseMediaRange.isDone()) {
          mediaRanges = mediaRanges.appended(parseMediaRange.getNonNullUnchecked());
        } else if (parseMediaRange.isError()) {
          throw new HttpException(HttpStatus.BAD_REQUEST, "malformed Accept: " + value, parseMediaRange.getError());
        } else {
          throw new HttpException(HttpStatus.BAD_REQUEST, "malformed Accept: " + value);
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
      throw new HttpException(HttpStatus.BAD_REQUEST, "malformed Accept: " + value, input.getError());
    } else if (!input.isDone()) {
      throw new HttpException(HttpStatus.BAD_REQUEST, "malformed Accept: " + value);
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
      mediaRange.write(output).assertDone();
    } while (mediaRanges.hasNext());
    return output.get();
  }

}

final class AcceptHeaderType implements HttpHeaderType<AcceptHeader, FingerTrieList<MediaRange>>, ToSource {

  @Override
  public String name() {
    return AcceptHeader.NAME;
  }

  @Override
  public FingerTrieList<MediaRange> getValue(AcceptHeader header) throws HttpException {
    return header.mediaRanges();
  }

  @Override
  public AcceptHeader of(String name, String value) {
    return AcceptHeader.of(name, value);
  }

  @Override
  public AcceptHeader of(String name, FingerTrieList<MediaRange> mediaRanges) {
    return AcceptHeader.of(name, mediaRanges);
  }

  @Override
  public @Nullable AcceptHeader cast(HttpHeader header) {
    if (header instanceof AcceptHeader) {
      return (AcceptHeader) header;
    } else {
      return null;
    }
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.append("AcceptHeader").append('.').append("TYPE");
  }

  @Override
  public String toString() {
    return this.toSource();
  }

}
