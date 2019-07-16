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
import swim.http.TransferCoding;
import swim.util.Builder;

final class TransferEncodingParser extends Parser<TransferEncoding> {
  final HttpParser http;
  final Parser<TransferCoding> coding;
  final Builder<TransferCoding, FingerTrieSeq<TransferCoding>> codings;
  final int step;

  TransferEncodingParser(HttpParser http, Parser<TransferCoding> coding,
                         Builder<TransferCoding, FingerTrieSeq<TransferCoding>> codings, int step) {
    this.http = http;
    this.coding = coding;
    this.codings = codings;
    this.step = step;
  }

  TransferEncodingParser(HttpParser http) {
    this(http, null, null, 1);
  }

  @Override
  public Parser<TransferEncoding> feed(Input input) {
    return parse(input, this.http, this.coding, this.codings, this.step);
  }

  static Parser<TransferEncoding> parse(Input input, HttpParser http, Parser<TransferCoding> coding,
                                        Builder<TransferCoding, FingerTrieSeq<TransferCoding>> codings, int step) {
    int c = 0;
    if (step == 1) {
      if (coding == null) {
        coding = http.parseTransferCoding(input);
      } else {
        coding = coding.feed(input);
      }
      if (coding.isDone()) {
        if (codings == null) {
          codings = FingerTrieSeq.builder();
        }
        codings.add(coding.bind());
        coding = null;
        step = 2;
      } else if (coding.isError()) {
        return coding.asError();
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
          return done(TransferEncoding.from(codings.bind()));
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
        if (coding == null) {
          coding = http.parseTransferCoding(input);
        } else {
          coding = coding.feed(input);
        }
        if (coding.isDone()) {
          codings.add(coding.bind());
          coding = null;
          step = 2;
          continue;
        } else if (coding.isError()) {
          return coding.asError();
        }
      }
      break;
    } while (true);
    if (input.isError()) {
      return error(input.trap());
    }
    return new TransferEncodingParser(http, coding, codings, step);
  }

  static Parser<TransferEncoding> parse(Input input, HttpParser http) {
    return parse(input, http, null, null, 1);
  }
}
