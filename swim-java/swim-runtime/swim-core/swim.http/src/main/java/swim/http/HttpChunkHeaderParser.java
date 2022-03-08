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

package swim.http;

import swim.codec.Base16;
import swim.codec.Diagnostic;
import swim.codec.Input;
import swim.codec.Parser;
import swim.collections.FingerTrieSeq;
import swim.util.Builder;

final class HttpChunkHeaderParser extends Parser<HttpChunkHeader> {

  final HttpParser http;
  final long size;
  final Parser<ChunkExtension> extensionParser;
  final Builder<ChunkExtension, FingerTrieSeq<ChunkExtension>> extensions;
  final int step;

  HttpChunkHeaderParser(HttpParser http, long size, Parser<ChunkExtension> extensionParser,
                        Builder<ChunkExtension, FingerTrieSeq<ChunkExtension>> extensions, int step) {
    this.http = http;
    this.size = size;
    this.extensionParser = extensionParser;
    this.extensions = extensions;
    this.step = step;
  }

  HttpChunkHeaderParser(HttpParser http) {
    this(http, 0L, null, null, 1);
  }

  @Override
  public Parser<HttpChunkHeader> feed(Input input) {
    return HttpChunkHeaderParser.parse(input, this.http, this.size, this.extensionParser, this.extensions, this.step);
  }

  static Parser<HttpChunkHeader> parse(Input input, HttpParser http, long size, Parser<ChunkExtension> extensionParser,
                                       Builder<ChunkExtension, FingerTrieSeq<ChunkExtension>> extensions, int step) {
    int c = 0;
    if (step == 1) {
      if (input.isCont()) {
        c = input.head();
        if (Base16.isDigit(c)) {
          input = input.step();
          size = Base16.decodeDigit(c);
          step = 2;
        } else {
          return Parser.error(Diagnostic.expected("chunk size", input));
        }
      } else if (input.isDone()) {
        return Parser.error(Diagnostic.expected("chunk size", input));
      }
    }
    if (step == 2) {
      while (input.isCont()) {
        c = input.head();
        if (Base16.isDigit(c)) {
          input = input.step();
          size = (size << 4) | Base16.decodeDigit(c);
          if (size < 0L) {
            return Parser.error(Diagnostic.message("chunk size overflow", input));
          }
        } else {
          break;
        }
      }
      if (!input.isEmpty()) {
        step = 3;
      }
    }
    do {
      if (step == 3) {
        if (input.isCont()) {
          c = input.head();
          if (c == ';') {
            step = 4;
          } else {
            step = 5;
            break;
          }
        } else if (input.isDone()) {
          return Parser.error(Diagnostic.unexpected(input));
        }
      }
      if (step == 4) {
        if (extensionParser == null) {
          extensionParser = http.parseChunkExtension(input);
        } else {
          extensionParser = extensionParser.feed(input);
        }
        if (extensionParser.isDone()) {
          if (extensions == null) {
            extensions = FingerTrieSeq.builder();
          }
          extensions.add(extensionParser.bind());
          extensionParser = null;
          step = 3;
          continue;
        } else if (extensionParser.isError()) {
          return extensionParser.asError();
        }
      }
      break;
    } while (true);
    if (step == 5) {
      if (input.isCont()) {
        c = input.head();
        if (c == '\r') {
          input = input.step();
          step = 6;
        } else {
          return Parser.error(Diagnostic.expected("carriage return", input));
        }
      } else if (input.isDone()) {
        return Parser.error(Diagnostic.expected("carriage return", input));
      }
    }
    if (step == 6) {
      if (input.isCont()) {
        c = input.head();
        if (c == '\n') {
          input = input.step();
          if (extensions == null) {
            return Parser.done(http.chunkHeader(size, FingerTrieSeq.<ChunkExtension>empty()));
          } else {
            return Parser.done(http.chunkHeader(size, extensions.bind()));
          }
        } else {
          return Parser.error(Diagnostic.expected("line feed", input));
        }
      } else if (input.isDone()) {
        return Parser.error(Diagnostic.expected("line feed", input));
      }
    }
    if (input.isError()) {
      return Parser.error(input.trap());
    }
    return new HttpChunkHeaderParser(http, size, extensionParser, extensions, step);
  }

  static Parser<HttpChunkHeader> parse(Input input, HttpParser http) {
    return HttpChunkHeaderParser.parse(input, http, 0L, null, null, 1);
  }

}
