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

import swim.structure.Item;
import swim.structure.Record;
import swim.structure.Value;
import swim.util.Builder;

public class CsvStructureParser extends CsvParser<Value, Item, Item> {
  final CsvHeader<Item> header;
  final int delimiter;

  public CsvStructureParser(CsvHeader<Item> header, int delimiter) {
    this.header = header;
    this.delimiter = delimiter;
  }

  public CsvStructureParser(CsvHeader<Item> header) {
    this(header, ',');
  }

  public CsvStructureParser(int delimiter) {
    this(CsvStructureHeader.empty(), delimiter);
  }

  public CsvStructureParser() {
    this(CsvStructureHeader.empty(), ',');
  }

  @Override
  public boolean isDelimiter(int c) {
    return c == delimiter;
  }

  @Override
  public CsvHeader<Item> header() {
    return this.header;
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
}
