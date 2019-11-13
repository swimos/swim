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

package swim.csv.structure;

import swim.codec.Input;
import swim.codec.Parser;
import swim.structure.Item;
import swim.structure.Record;
import swim.structure.Slot;
import swim.structure.Value;
import swim.util.Builder;

final class ParsedStructure implements CsvStructureCol {
  final Value key;
  final String name;
  final boolean optional;
  final Parser<? extends Item> itemParser;

  ParsedStructure(Value key, String name, boolean optional, Parser<? extends Item> itemParser) {
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
  public CsvStructureCol key(Value key) {
    return new ParsedStructure(key, this.name, this.optional, this.itemParser);
  }

  @Override
  public String name() {
    return this.name;
  }

  @Override
  public CsvStructureCol name(String name) {
    return new ParsedStructure(this.key, name, this.optional, this.itemParser);
  }

  @Override
  public boolean optional() {
    return this.optional;
  }

  @Override
  public CsvStructureCol optional(boolean optional) {
    return new ParsedStructure(this.key, this.name, optional, this.itemParser);
  }

  @Override
  public Item defaultCell() {
    return Item.extant();
  }

  @SuppressWarnings("unchecked")
  @Override
  public Parser<Item> parseCell(Input input) {
    return (Parser<Item>) this.itemParser.feed(input);
  }

  @Override
  public void addCell(Item cell, Builder<Item, ?> rowBuilder) {
    if (!this.optional || (cell instanceof Record && !((Record) cell).isEmpty())
        || (cell != null && !(cell instanceof Record) && cell.isDefined())) {
      if (cell == null) {
        cell = defaultCell();
      }
      if (this.key.isDefined() && cell instanceof Value) {
        rowBuilder.add(Slot.of(this.key, (Value) cell));
      } else {
        rowBuilder.add(cell);
      }
    }
  }
}
