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

import swim.codec.Parser;
import swim.structure.Item;
import swim.structure.Record;
import swim.structure.Text;
import swim.structure.Value;
import swim.util.Builder;

public class CsvStructureParser extends CsvParser<Value, Item, Item> {
  final int delimiter;

  public CsvStructureParser(int delimiter) {
    this.delimiter = delimiter;
  }

  @Override
  public boolean isDelimiter(int c) {
    return c == delimiter;
  }

  @SuppressWarnings("unchecked")
  @Override
  public Builder<Item, Value> tableBuilder() {
    return (Builder<Item, Value>) (Builder<?, ?>) Record.create();
  }

  @SuppressWarnings("unchecked")
  @Override
  public Builder<Item, Item> rowBuilder() {
    return (Builder<Item, Item>) (Builder<?, ?>) Record.create();
  }

  @Override
  public Parser<Item> cellParser(String name, int index) {
    return new TextCellParser(Text.from(name));
  }
}
