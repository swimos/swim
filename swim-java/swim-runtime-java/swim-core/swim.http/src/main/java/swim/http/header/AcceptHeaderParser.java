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

import swim.codec.Diagnostic;
import swim.codec.Input;
import swim.codec.Parser;
import swim.collections.FingerTrieSeq;
import swim.http.Http;
import swim.http.HttpParser;
import swim.http.MediaRange;
import swim.util.Builder;

final class AcceptHeaderParser extends Parser<AcceptHeader> {

  final HttpParser http;
  final Parser<MediaRange> mediaRangeParser;
  final Builder<MediaRange, FingerTrieSeq<MediaRange>> mediaRanges;
  final int step;

  AcceptHeaderParser(HttpParser http, Parser<MediaRange> mediaRangeParser,
                     Builder<MediaRange, FingerTrieSeq<MediaRange>> mediaRanges, int step) {
    this.http = http;
    this.mediaRangeParser = mediaRangeParser;
    this.mediaRanges = mediaRanges;
    this.step = step;
  }

  AcceptHeaderParser(HttpParser http) {
    this(http, null, null, 1);
  }

  @Override
  public Parser<AcceptHeader> feed(Input input) {
    return AcceptHeaderParser.parse(input, this.http, this.mediaRangeParser, this.mediaRanges, this.step);
  }

  static Parser<AcceptHeader> parse(Input input, HttpParser http, Parser<MediaRange> mediaRangeParser,
                                    Builder<MediaRange, FingerTrieSeq<MediaRange>> mediaRanges, int step) {
    int c = 0;
    if (step == 1) {
      if (mediaRangeParser == null) {
        mediaRangeParser = http.parseMediaRange(input);
      } else {
        mediaRangeParser = mediaRangeParser.feed(input);
      }
      if (mediaRangeParser.isDone()) {
        if (mediaRanges == null) {
          mediaRanges = FingerTrieSeq.builder();
        }
        mediaRanges.add(mediaRangeParser.bind());
        mediaRangeParser = null;
        step = 2;
      } else if (mediaRangeParser.isError()) {
        return mediaRangeParser.asError();
      }
    }
    do {
      if (step == 2) {
        while (input.isCont()) {
          c = input.head();
          if (Http.isSpace(c)) {
            input = input.step();
          } else {
            break;
          }
        }
        if (input.isCont() && c == ',') {
          input = input.step();
          step = 3;
        } else if (!input.isEmpty()) {
          return Parser.done(AcceptHeader.create(mediaRanges.bind()));
        }
      }
      if (step == 3) {
        while (input.isCont()) {
          c = input.head();
          if (Http.isSpace(c)) {
            input = input.step();
          } else {
            break;
          }
        }
        if (input.isCont()) {
          step = 4;
        } else if (input.isDone()) {
          return Parser.error(Diagnostic.unexpected(input));
        }
      }
      if (step == 4) {
        if (mediaRangeParser == null) {
          mediaRangeParser = http.parseMediaRange(input);
        } else {
          mediaRangeParser = mediaRangeParser.feed(input);
        }
        if (mediaRangeParser.isDone()) {
          mediaRanges.add(mediaRangeParser.bind());
          mediaRangeParser = null;
          step = 2;
          continue;
        } else if (mediaRangeParser.isError()) {
          return mediaRangeParser.asError();
        }
      }
      break;
    } while (true);
    if (input.isError()) {
      return Parser.error(input.trap());
    }
    return new AcceptHeaderParser(http, mediaRangeParser, mediaRanges, step);
  }

  static Parser<AcceptHeader> parse(Input input, HttpParser http) {
    return AcceptHeaderParser.parse(input, http, null, null, 1);
  }

}
