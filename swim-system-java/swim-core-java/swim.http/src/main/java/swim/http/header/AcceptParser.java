// Copyright 2015-2019 SWIM.AI inc.
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

final class AcceptParser extends Parser<Accept> {
  final HttpParser http;
  final Parser<MediaRange> mediaRange;
  final Builder<MediaRange, FingerTrieSeq<MediaRange>> mediaRanges;
  final int step;

  AcceptParser(HttpParser http, Parser<MediaRange> mediaRange,
               Builder<MediaRange, FingerTrieSeq<MediaRange>> mediaRanges, int step) {
    this.http = http;
    this.mediaRange = mediaRange;
    this.mediaRanges = mediaRanges;
    this.step = step;
  }

  AcceptParser(HttpParser http) {
    this(http, null, null, 1);
  }

  @Override
  public Parser<Accept> feed(Input input) {
    return parse(input, this.http, this.mediaRange, this.mediaRanges, this.step);
  }

  static Parser<Accept> parse(Input input, HttpParser http, Parser<MediaRange> mediaRange,
                              Builder<MediaRange, FingerTrieSeq<MediaRange>> mediaRanges, int step) {
    int c = 0;
    if (step == 1) {
      if (mediaRange == null) {
        mediaRange = http.parseMediaRange(input);
      } else {
        mediaRange = mediaRange.feed(input);
      }
      if (mediaRange.isDone()) {
        if (mediaRanges == null) {
          mediaRanges = FingerTrieSeq.builder();
        }
        mediaRanges.add(mediaRange.bind());
        mediaRange = null;
        step = 2;
      } else if (mediaRange.isError()) {
        return mediaRange.asError();
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
          return done(Accept.from(mediaRanges.bind()));
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
          return error(Diagnostic.unexpected(input));
        }
      }
      if (step == 4) {
        if (mediaRange == null) {
          mediaRange = http.parseMediaRange(input);
        } else {
          mediaRange = mediaRange.feed(input);
        }
        if (mediaRange.isDone()) {
          mediaRanges.add(mediaRange.bind());
          mediaRange = null;
          step = 2;
          continue;
        } else if (mediaRange.isError()) {
          return mediaRange.asError();
        }
      }
      break;
    } while (true);
    if (input.isError()) {
      return error(input.trap());
    }
    return new AcceptParser(http, mediaRange, mediaRanges, step);
  }

  static Parser<Accept> parse(Input input, HttpParser http) {
    return parse(input, http, null, null, 1);
  }
}
