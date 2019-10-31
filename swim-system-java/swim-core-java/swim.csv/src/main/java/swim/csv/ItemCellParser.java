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
import swim.codec.Parser;
import swim.structure.Item;
import swim.util.Builder;

final class ItemCellParser extends Parser<Item> {
  final ItemCol col;
  final Builder<Item, ?> rowBuilder;
  final Parser<? extends Item> itemParser;

  ItemCellParser(ItemCol col, Builder<Item, ?> rowBuilder,
                 Parser<? extends Item> itemParser) {
    this.col = col;
    this.rowBuilder = rowBuilder;
    this.itemParser = itemParser;
  }

  @Override
  public Parser<Item> feed(Input input) {
    return parse(input, this.col, this.rowBuilder, this.itemParser);
  }

  static Parser<Item> parse(Input input, ItemCol col, Builder<Item, ?> rowBuilder,
                            Parser<? extends Item> itemParser) {
    while (itemParser.isCont() && !input.isEmpty()) {
      itemParser = itemParser.feed(input);
    }
    if (itemParser.isDone()) {
      final Item item = itemParser.bind();
      col.addCell(item, rowBuilder);
      return done(item);
    } else if (itemParser.isError()) {
      return itemParser.asError();
    } else if (input.isError()) {
      return error(input.trap());
    }
    return new ItemCellParser(col, rowBuilder, itemParser);
  }
}
