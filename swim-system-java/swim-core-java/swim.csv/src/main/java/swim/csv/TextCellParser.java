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

package swim.csv;

import swim.codec.Input;
import swim.codec.Output;
import swim.codec.Parser;
import swim.structure.Item;
import swim.structure.Slot;
import swim.structure.Text;
import swim.structure.Value;

final class TextCellParser extends Parser<Item> {
  final Value key;
  final Output<Text> output;

  TextCellParser(Value key, Output<Text> output) {
    this.key = key;
    this.output = output;
  }

  TextCellParser(Value key) {
    this(key, null);
  }

  @Override
  public Parser<Item> feed(Input input) {
    return parse(input, this.key, this.output);
  }

  static Parser<Item> parse(Input input, Value key, Output<Text> output) {
    if (input.isCont()) {
      if (output == null) {
        output = Text.output();
      }
      while (input.isCont()) {
        output = output.write(input.head());
        input = input.step();
      }
    }
    if (!input.isEmpty()) {
      final Text value = output != null ? output.bind() : Text.empty();
      if (key.isDefined()) {
        return done(Slot.of(key, value));
      } else {
        return done(value);
      }
    } else if (input.isError()) {
      return error(input.trap());
    }
    return new TextCellParser(key, output);
  }

  static Parser<Item> parse(Input input, Value key) {
    return parse(input, key, null);
  }
}
