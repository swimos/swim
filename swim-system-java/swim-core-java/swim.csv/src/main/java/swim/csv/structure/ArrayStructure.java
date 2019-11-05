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

import swim.csv.schema.CsvCol;
import swim.structure.Item;
import swim.structure.Record;
import swim.structure.Value;
import swim.util.Builder;

final class ArrayStructure extends CsvStructureHeader {
  final CsvCol<? extends Item> col;
  final int colCount;

  ArrayStructure(CsvCol<? extends Item> col, int colCount) {
    this.col = col;
    this.colCount = colCount;
  }

  @Override
  public int colCount() {
    return this.colCount;
  }

  @Override
  public CsvCol<? extends Item> getCol(int index) {
    return this.col;
  }

  @Override
  public CsvCol<? extends Item> overflowCol() {
    return this.col;
  }

  @Override
  public CsvStructureHeader col(int index, CsvCol<? extends Item> col) {
    throw new UnsupportedOperationException();
  }

  @Override
  public CsvStructureHeader col(int index, String name) {
    throw new UnsupportedOperationException();
  }

  @Override
  public CsvStructureHeader col(CsvCol<? extends Item> col) {
    throw new UnsupportedOperationException();
  }

  @Override
  public CsvStructureHeader col(String name) {
    throw new UnsupportedOperationException();
  }

  @Override
  public CsvStructureHeader cols(CsvStructureCol... cols) {
    throw new UnsupportedOperationException();
  }

  @SuppressWarnings("unchecked")
  @Override
  public Builder<Item, Value> rowBuilder() {
    return (Builder<Item, Value>) (Builder<?, ?>) Record.create();
  }

  @SuppressWarnings("unchecked")
  @Override
  public Builder<Value, Record> tableBuilder() {
    return (Builder<Value, Record>) (Builder<?, ?>) Record.create();
  }
}
