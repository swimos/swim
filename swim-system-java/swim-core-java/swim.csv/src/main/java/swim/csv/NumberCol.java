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
import swim.structure.Num;
import swim.structure.Slot;
import swim.structure.Value;
import swim.util.Builder;

final class NumberCol extends CsvStructureCol<Num> {
  final Value key;
  final String name;
  final boolean optional;

  NumberCol(Value key, String name, boolean optional) {
    this.key = key;
    this.name = name;
    this.optional = optional;
  }

  @Override
  public Value key() {
    return this.key;
  }

  @Override
  public NumberCol key(Value key) {
    return new NumberCol(key, this.name, this.optional);
  }

  @Override
  public String name() {
    return this.name;
  }

  @Override
  public NumberCol name(String name) {
    return new NumberCol(this.key, name, this.optional);
  }

  @Override
  public boolean optional() {
    return this.optional;
  }

  @Override
  public NumberCol optional(boolean optional) {
    return new NumberCol(this.key, this.name, optional);
  }

  @Override
  public void addCell(Num value, Builder<Item, ?> rowBuilder) {
    if (!this.optional || value != null) {
      if (value == null) {
        value = Num.from(0);
      }
      if (this.key.isDefined()) {
        rowBuilder.add(Slot.of(this.key, value));
      } else {
        rowBuilder.add(value);
      }
    }
  }

  @Override
  public Parser<Num> parseCell(Input input, Builder<Item, ?> rowBuilder) {
    return NumberCellParser.parse(input, this, rowBuilder);
  }

  @Override
  public Writer<?, ?> writeCell(Item cell, Output<?> output) {
    throw new UnsupportedOperationException(); // TODO
  }
}
