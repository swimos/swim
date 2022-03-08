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

package swim.recon;

import swim.codec.Diagnostic;
import swim.codec.Input;
import swim.codec.Output;
import swim.codec.Parser;

final class RawStringParser<I, V> extends Parser<V> {

  final ReconParser<I, V> recon;
  final Output<V> output;
  final int count;
  final int step;

  RawStringParser(ReconParser<I, V> recon, Output<V> output, int count, int step) {
    this.recon = recon;
    this.output = output;
    this.count = count;
    this.step = step;
  }

  @Override
  public Parser<V> feed(Input input) {
    return RawStringParser.parse(input, this.recon, this.output, this.count, this.step);
  }

  static <I, V> Parser<V> parse(Input input, ReconParser<I, V> recon,
                                Output<V> output, int count, int step) {
    int c = 0;
    if (step == 1) {
      while (input.isCont()) {
        c = input.head();
        if (Recon.isWhitespace(c)) {
          input = input.step();
        } else {
          break;
        }
      }
      if (input.isCont() && c == '`') {
        input = input.step();
        count = 1;
        step = 2;
      } else if (input.isDone()) {
        return Parser.error(Diagnostic.expected("raw string", input));
      }
    }
    if (step == 2) {
      if (input.isCont()) {
        if (input.head() == '`') {
          input = input.step();
          count = 2;
          step = 3;
        } else {
          if (output == null) {
            output = recon.textOutput();
          }
          step = 4;
        }
      } else if (input.isDone()) {
        return Parser.error(Diagnostic.expected("raw string", input));
      }
    }
    if (step == 3) {
      if (input.isCont()) {
        if (input.head() == '`') {
          input = input.step();
          if (output == null) {
            output = recon.textOutput();
          }
          count = 3;
          step = 4;
        } else {
          if (output == null) {
            output = recon.textOutput();
          }
          return Parser.done(output.bind());
        }
      } else if (input.isDone()) {
        if (output == null) {
          output = recon.textOutput();
        }
        return Parser.done(output.bind());
      }
    }
    do {
      if (step == 4) {
        while (input.isCont()) {
          c = input.head();
          if ((count != 1 || c >= 0x20) && c != '`' && c != '\\') {
            input = input.step();
            output = output.write(c);
          } else {
            break;
          }
        }
        if (input.isCont()) {
          if (c == '\\') {
            input = input.step();
            step = 5;
          } else if (c == '`') {
            input = input.step();
            if (count == 1) {
              return Parser.done(output.bind());
            } else {
              step = 6;
            }
          } else {
            return Parser.error(Diagnostic.expected('`', input));
          }
        } else if (input.isDone()) {
          return Parser.error(Diagnostic.expected('`', input));
        }
      }
      if (step == 5) {
        if (input.isCont()) {
          c = input.head();
          input = input.step();
          if (c != '\\' && c != '`') {
            output = output.write('\\');
          }
          output = output.write(c);
          step = 4;
          continue;
        } else if (input.isDone()) {
          return Parser.error(Diagnostic.expected("escape character", input));
        }
      }
      if (step == 6) {
        if (input.isCont()) {
          if (input.head() == '`') {
            input = input.step();
            step = 7;
          } else {
            output = output.write('`');
            step = 4;
            continue;
          }
        } else if (input.isDone()) {
          return Parser.error(Diagnostic.message("unclosed raw string", input));
        }
      }
      if (step == 7) {
        if (input.isCont()) {
          if (input.head() == '`') {
            input = input.step();
            return done(output.bind());
          } else {
            output = output.write('`');
            output = output.write('`');
            step = 4;
            continue;
          }
        } else if (input.isDone()) {
          return Parser.error(Diagnostic.message("unclosed raw string", input));
        }
      }
      break;
    } while (true);
    if (input.isError()) {
      return Parser.error(input.trap());
    }
    return new RawStringParser<I, V>(recon, output, count, step);
  }

  static <I, V> Parser<V> parse(Input input, ReconParser<I, V> recon) {
    return RawStringParser.parse(input, recon, null, 0, 1);
  }

  static <I, V> Parser<V> parse(Input input, ReconParser<I, V> recon, Output<V> output) {
    return RawStringParser.parse(input, recon, output, 0, 1);
  }

}
