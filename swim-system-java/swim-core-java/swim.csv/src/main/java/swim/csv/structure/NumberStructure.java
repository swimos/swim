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

import swim.codec.Base10;
import swim.codec.Input;
import swim.codec.Parser;
import swim.structure.Item;
import swim.structure.Num;
import swim.structure.Slot;
import swim.structure.Value;
import swim.util.Builder;

final class NumberStructure implements CsvStructureCol {
  final Value key;
  final String name;
  final boolean optional;

  NumberStructure(Value key, String name, boolean optional) {
    this.key = key;
    this.name = name;
    this.optional = optional;
  }

  @Override
  public Value key() {
    return this.key;
  }

  @Override
  public CsvStructureCol key(Value key) {
    return new NumberStructure(key, this.name, this.optional);
  }

  @Override
  public String name() {
    return this.name;
  }

  @Override
  public CsvStructureCol name(String name) {
    return new NumberStructure(this.key, name, this.optional);
  }

  @Override
  public boolean optional() {
    return this.optional;
  }

  @Override
  public CsvStructureCol optional(boolean optional) {
    return new NumberStructure(this.key, this.name, optional);
  }

  @Override
  public Item defaultCell() {
    return Num.from(0);
  }

  @Override
  public Parser<Item> parseCell(Input input) {
    return NumberStructureParser.parse(input, null, 1);
  }

  @Override
  public void addCell(Item cell, Builder<Item, ?> rowBuilder) {
    if (!this.optional || cell != null) {
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

final class NumberStructureParser extends Parser<Item> {
  final Parser<Number> numberParser;
  final int step;

  NumberStructureParser(Parser<Number> numberParser, int step) {
    this.numberParser = numberParser;
    this.step = step;
  }

  @Override
  public Parser<Item> feed(Input input) {
    return parse(input, this.numberParser, this.step);
  }

  static Parser<Item> parse(Input input, Parser<Number> numberParser, int step) {
    int c = 0;
    if (step == 1) {
      if (input.isCont()) {
        c = input.head();
        if (c == '-' || '0' <= c && c <= '9') {
          step = 2;
        } else {
          return done();
        }
      } else if (input.isDone()) {
        return done();
      }
    }
    if (step == 2) {
      if (numberParser == null) {
        numberParser = Base10.parseNumber(input);
      }
      while (numberParser.isCont() && !input.isEmpty()) {
        numberParser = numberParser.feed(input);
      }
      if (numberParser.isDone()) {
        return done(Num.from(numberParser.bind()));
      } else if (numberParser.isError()) {
        return numberParser.asError();
      }
    }
    if (input.isError()) {
      return error(input.trap());
    }
    return new NumberStructureParser(numberParser, step);
  }
}
