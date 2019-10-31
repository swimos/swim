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
import swim.structure.Text;
import swim.util.Builder;

final class TextCellParser extends Parser<Text> {
  final TextCol col;
  final Builder<Item, ?> rowBuilder;
  final Output<Text> output;

  TextCellParser(TextCol col, Builder<Item, ?> rowBuilder, Output<Text> output) {
    this.col = col;
    this.rowBuilder = rowBuilder;
    this.output = output;
  }

  TextCellParser(TextCol col, Builder<Item, ?> rowBuilder) {
    this(col, rowBuilder, null);
  }

  @Override
  public Parser<Text> feed(Input input) {
    return parse(input, this.col, this.rowBuilder, this.output);
  }

  static Parser<Text> parse(Input input, TextCol col, Builder<Item, ?> rowBuilder, Output<Text> output) {
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
      final Text text = output != null ? output.bind() : Text.empty();
      col.addCell(text, rowBuilder);
      return done(text);
    } else if (input.isError()) {
      return error(input.trap());
    }
    return new TextCellParser(col, rowBuilder, output);
  }

  static Parser<Text> parse(Input input, TextCol col, Builder<Item, ?> rowBuilder) {
    return parse(input, col, rowBuilder, null);
  }
}
