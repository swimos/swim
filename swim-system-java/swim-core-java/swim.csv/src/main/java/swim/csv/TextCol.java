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
import swim.structure.Text;
import swim.structure.Value;
import swim.util.Builder;

final class TextCol extends CsvStructureCol<Text> {
  final Value key;
  final String name;
  final boolean optional;

  TextCol(Value key, String name, boolean optional) {
    this.key = key;
    this.name = name;
    this.optional = optional;
  }

  @Override
  public Value key() {
    return this.key;
  }

  @Override
  public TextCol key(Value key) {
    return new TextCol(key, this.name, this.optional);
  }

  @Override
  public String name() {
    return this.name;
  }

  @Override
  public TextCol name(String name) {
    return new TextCol(this.key, name, this.optional);
  }

  @Override
  public boolean optional() {
    return this.optional;
  }

  @Override
  public TextCol optional(boolean optional) {
    return new TextCol(this.key, this.name, optional);
  }

  @Override
  public void addCell(Text value, Builder<Item, ?> rowBuilder) {
    if (!this.optional || value.size() != 0) {
      if (this.key.isDefined()) {
        rowBuilder.add(Slot.of(this.key, value));
      } else {
        rowBuilder.add(value);
      }
    }
  }

  @Override
  public Parser<Text> parseCell(Input input, Builder<Item, ?> rowBuilder) {
    return TextCellParser.parse(input, this, rowBuilder);
  }

  @Override
  public Writer<?, ?> writeCell(Item cell, Output<?> output) {
    throw new UnsupportedOperationException(); // TODO
  }
}
