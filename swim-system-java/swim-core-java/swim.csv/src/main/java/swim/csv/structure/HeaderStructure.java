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

import swim.collections.FingerTrieSeq;
import swim.csv.schema.CsvCol;
import swim.structure.Item;
import swim.structure.Record;
import swim.structure.Text;
import swim.structure.Value;
import swim.util.Builder;

final class HeaderStructure extends CsvStructureHeader {
  final FingerTrieSeq<CsvCol<? extends Item>> cols;

  HeaderStructure(FingerTrieSeq<CsvCol<? extends Item>> cols) {
    this.cols = cols;
  }

  @Override
  public int colCount() {
    return this.cols.size();
  }

  @Override
  public CsvCol<? extends Item> getCol(int index) {
    return this.cols.get(index);
  }

  @Override
  public CsvCol<? extends Item> overflowCol() {
    return CsvStructure.nullCol();
  }

  @Override
  public CsvStructureHeader col(int index, CsvCol<? extends Item> col) {
    final FingerTrieSeq<CsvCol<? extends Item>> cols = this.cols;
    if (index < 0) {
      return new HeaderStructure(cols.prepended(col));
    } else if (index >= cols.size()) {
      return new HeaderStructure(cols.appended(col));
    } else {
      return new HeaderStructure(cols.updated(index, col));
    }
  }

  @Override
  public CsvStructureHeader col(int index, String name) {
    final FingerTrieSeq<CsvCol<? extends Item>> cols = this.cols;
    if (index < 0) {
      return new HeaderStructure(cols.prepended(new StringStructure(Text.from(name), name, false)));
    } else if (index >= cols.size()) {
      return new HeaderStructure(cols.appended(new StringStructure(Text.from(name), name, false)));
    } else {
      return new HeaderStructure(cols.updated(index, cols.get(index).name(name)));
    }
  }

  @Override
  public CsvStructureHeader col(CsvCol<? extends Item> col) {
    return new HeaderStructure(this.cols.appended(col));
  }

  @Override
  public CsvStructureHeader col(String name) {
    return new HeaderStructure(this.cols.appended(new StringStructure(Text.from(name), name, false)));
  }

  @Override
  public CsvStructureHeader cols(CsvStructureCol... cols) {
    return new HeaderStructure(this.cols.appended(FingerTrieSeq.of(cols)));
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

  public static HeaderStructure empty() {
    return new HeaderStructure(FingerTrieSeq.empty());
  }
}
