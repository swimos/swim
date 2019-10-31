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
import swim.codec.Writer;
import swim.structure.Item;
import swim.structure.Slot;
import swim.structure.Value;
import swim.util.Builder;

final class ItemCol extends CsvStructureCol<Item> {
  final Value key;
  final String name;
  final boolean optional;
  final Parser<? extends Item> itemParser;

  ItemCol(Value key, String name, boolean optional, Parser<? extends Item> itemParser) {
    this.key = key;
    this.name = name;
    this.optional = optional;
    this.itemParser = itemParser;
  }

  @Override
  public Value key() {
    return this.key;
  }

  @Override
  public ItemCol key(Value key) {
    return new ItemCol(key, this.name, this.optional, this.itemParser);
  }

  @Override
  public String name() {
    return this.name;
  }

  @Override
  public ItemCol name(String name) {
    return new ItemCol(this.key, name, this.optional, this.itemParser);
  }

  @Override
  public boolean optional() {
    return this.optional;
  }

  @Override
  public ItemCol optional(boolean optional) {
    return new ItemCol(this.key, this.name, optional, this.itemParser);
  }

  @Override
  public void addCell(Item value, Builder<Item, ?> rowBuilder) {
    if (!this.optional || value != null || value.isDefined()) {
      if (value == null) {
        value = Item.extant();
      }
      if (this.key.isDefined() && value instanceof Value) {
        rowBuilder.add(Slot.of(this.key, (Value) value));
      } else {
        rowBuilder.add(value);
      }
    }
  }

  @Override
  public Parser<Item> parseCell(Input input, Builder<Item, ?> rowBuilder) {
    return ItemCellParser.parse(input, this, rowBuilder, this.itemParser);
  }

  @Override
  public Writer<?, ?> writeCell(Item cell, Output<?> output) {
    throw new UnsupportedOperationException(); // TODO
  }
}
