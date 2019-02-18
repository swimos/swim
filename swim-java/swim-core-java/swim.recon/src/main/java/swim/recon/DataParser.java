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

package swim.recon;

import swim.codec.Base64;
import swim.codec.Diagnostic;
import swim.codec.Input;
import swim.codec.Parser;

final class DataParser<I, V> extends Parser<V> {
  final ReconParser<I, V> recon;
  final Parser<V> base64Parser;
  final int step;

  DataParser(ReconParser<I, V> recon, Parser<V> base64Parser, int step) {
    this.recon = recon;
    this.base64Parser = base64Parser;
    this.step = step;
  }

  @Override
  public Parser<V> feed(Input input) {
    return parse(input, this.recon, this.base64Parser, this.step);
  }

  static <I, V> Parser<V> parse(Input input, ReconParser<I, V> recon, Parser<V> base64Parser, int step) {
    int c = 0;
    if (step == 1) {
      if (input.isCont()) {
        c = input.head();
        if (c == '%') {
          input = input.step();
          step = 2;
        } else {
          return error(Diagnostic.expected('%', input));
        }
      } else if (input.isDone()) {
        return error(Diagnostic.expected('%', input));
      }
    }
    if (step == 2) {
      if (base64Parser == null) {
        base64Parser = Base64.standard().parse(input, recon.dataOutput());
      }
      while (base64Parser.isCont() && !input.isEmpty()) {
        base64Parser = base64Parser.feed(input);
      }
      if (base64Parser.isDone()) {
        return base64Parser;
      } else if (base64Parser.isError()) {
        return base64Parser;
      }
    }
    if (input.isError()) {
      return error(input.trap());
    }
    return new DataParser<I, V>(recon, base64Parser, step);
  }

  static <I, V> Parser<V> parse(Input input, ReconParser<I, V> recon) {
    return parse(input, recon, null, 1);
  }
}
