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

import swim.codec.Input;
import swim.codec.Parser;
import swim.structure.Form;
import swim.structure.Item;
import swim.structure.Value;

final class ReconFormParser<T> extends Parser<T> {
  final ReconParser<Item, Value> recon;
  final Form<T> form;
  final Parser<Value> parser;

  ReconFormParser(ReconParser<Item, Value> recon, Form<T> form, Parser<Value> parser) {
    this.recon = recon;
    this.form = form;
    this.parser = parser;
  }

  ReconFormParser(ReconParser<Item, Value> recon, Form<T> form) {
    this(recon, form, null);
  }

  @Override
  public Parser<T> feed(Input input) {
    return parse(input, this.recon, this.form, this.parser);
  }

  static <T> Parser<T> parse(Input input, ReconParser<Item, Value> recon,
                             Form<T> form, Parser<Value> parser) {
    if (parser == null) {
      parser = recon.parseBlock(input);
    } else {
      parser = parser.feed(input);
    }
    if (parser.isDone()) {
      final Value value = parser.bind();
      return done(form.cast(value));
    } else if (parser.isError()) {
      return parser.asError();
    }
    return new ReconFormParser<T>(recon, form, parser);
  }

  static <T> Parser<T> parse(Input input, ReconParser<Item, Value> recon, Form<T> form) {
    return parse(input, recon, form, null);
  }
}
