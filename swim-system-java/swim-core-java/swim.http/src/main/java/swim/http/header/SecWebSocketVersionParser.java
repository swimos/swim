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

import swim.codec.Base10;
import swim.codec.Diagnostic;
import swim.codec.Input;
import swim.codec.Parser;
import swim.collections.FingerTrieSeq;
import swim.http.Http;
import swim.util.Builder;

final class SecWebSocketVersionParser extends Parser<SecWebSocketVersion> {
  final int version;
  final Builder<Integer, FingerTrieSeq<Integer>> versions;
  final int step;

  SecWebSocketVersionParser(int version, Builder<Integer, FingerTrieSeq<Integer>> versions, int step) {
    this.version = version;
    this.versions = versions;
    this.step = step;
  }

  SecWebSocketVersionParser() {
    this(0, null, 1);
  }

  @Override
  public Parser<SecWebSocketVersion> feed(Input input) {
    return parse(input, this.version, this.versions, this.step);
  }

  static Parser<SecWebSocketVersion> parse(Input input, int version,
                                           Builder<Integer, FingerTrieSeq<Integer>> versions, int step) {
    int c = 0;
    if (step == 1) {
      if (input.isCont()) {
        c = input.head();
        if (c == '0') {
          input = input.step();
          if (versions == null) {
            versions = FingerTrieSeq.builder();
          }
          versions.add(0);
          version = 0;
          step = 3;
        } else if (c >= '1' && c <= '9') {
          input = input.step();
          version = Base10.decodeDigit(c);
          step = 2;
        } else {
          return error(Diagnostic.expected("websocket version", input));
        }
      } else if (input.isDone()) {
        return error(Diagnostic.expected("websocket version", input));
      }
    }
    if (step == 2) {
      while (input.isCont()) {
        c = input.head();
        if (Base10.isDigit(c)) {
          input = input.step();
          version = 10 * version + Base10.decodeDigit(c);
          if (version < 0) {
            return error(Diagnostic.message("websocket version overflow", input));
          }
        } else {
          break;
        }
      }
      if (!input.isEmpty()) {
        if (versions == null) {
          versions = FingerTrieSeq.builder();
        }
        versions.add(version);
        version = 0;
        step = 3;
      }
    }
    do {
      if (step == 3) {
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
          step = 4;
        } else if (!input.isEmpty()) {
          return done(SecWebSocketVersion.from(versions.bind()));
        }
      }
      if (step == 4) {
        while (input.isCont()) {
          c = input.head();
          if (Http.isSpace(c)) {
            input = input.step();
          } else {
            break;
          }
        }
        if (input.isCont()) {
          step = 5;
        } else if (input.isDone()) {
          return error(Diagnostic.unexpected(input));
        }
      }
      if (step == 5) {
        if (input.isCont()) {
          c = input.head();
          if (c == '0') {
            input = input.step();
            versions.add(0);
            version = 0;
            step = 3;
            continue;
          } else if (c >= '1' && c <= '9') {
            input = input.step();
            version = Base10.decodeDigit(c);
            step = 6;
          } else {
            return error(Diagnostic.expected("websocket version", input));
          }
        } else if (input.isDone()) {
          return error(Diagnostic.expected("websocket version", input));
        }
      }
      if (step == 6) {
        while (input.isCont()) {
          c = input.head();
          if (Base10.isDigit(c)) {
            input = input.step();
            version = 10 * version + Base10.decodeDigit(c);
            if (version < 0) {
              return error(Diagnostic.message("websocket version overflow", input));
            }
          } else {
            break;
          }
        }
        if (!input.isEmpty()) {
          versions.add(version);
          version = 0;
          step = 3;
          continue;
        }
      }
      break;
    } while (true);
    if (input.isError()) {
      return error(input.trap());
    }
    return new SecWebSocketVersionParser(version, versions, step);
  }

  static Parser<SecWebSocketVersion> parse(Input input) {
    return parse(input, 0, null, 1);
  }
}
