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
import swim.collections.FingerTrieSeq;
import swim.structure.Item;
import swim.structure.Text;
import swim.structure.Value;

public final class CsvStructureHeader extends CsvHeader<Item> {
  final FingerTrieSeq<CsvCol<Item, ?>> cols;

  public CsvStructureHeader(FingerTrieSeq<CsvCol<Item, ?>> cols) {
    this.cols = cols;
  }

  @Override
  public int size() {
    return this.cols.size();
  }

  @Override
  public CsvCol<Item, ?> get(int index) {
    return this.cols.get(index);
  }

  public Value key(int index) {
    final CsvCol<Item, ?> col = this.cols.get(index);
    if (col instanceof CsvStructureCol<?>) {
      return ((CsvStructureCol<?>) col).key();
    } else {
      return Value.absent();
    }
  }

  public CsvStructureHeader key(int index, Value key) {
    return new CsvStructureHeader(this.cols.updated(index, ((CsvStructureCol<?>) this.cols.get(index)).key(key)));
  }

  public CsvStructureHeader key(Value key) {
    return key(this.cols.size() - 1, key);
  }

  public String name(int index) {
    return this.cols.get(index).name();
  }

  public CsvStructureHeader name(int index, String name) {
    return new CsvStructureHeader(this.cols.updated(index, this.cols.get(index).name(name)));
  }

  public CsvStructureHeader name(String name) {
    return name(this.cols.size() - 1, name);
  }

  public boolean optional(int index) {
    return this.cols.get(index).optional();
  }

  public CsvStructureHeader optional(int index, boolean optional) {
    return new CsvStructureHeader(this.cols.updated(index, this.cols.get(index).optional(optional)));
  }

  public CsvStructureHeader optional(boolean optional) {
    return optional(this.cols.size() - 1, optional);
  }

  @Override
  public CsvStructureHeader col(CsvCol<Item, ?> col) {
    return new CsvStructureHeader(this.cols.appended(col));
  }

  @Override
  public CsvStructureHeader col(String name) {
    return col(new TextCol(Text.from(name), name, false));
  }

  public CsvStructureHeader textCol(Value key) {
    return col(new TextCol(key, key.stringValue(""), false));
  }

  public CsvStructureHeader textCol(String key) {
    return col(new TextCol(Text.from(key), key, false));
  }

  public CsvStructureHeader textCol() {
    return col(new TextCol(Value.absent(), "", false));
  }

  public CsvStructureHeader numberCol(Value key) {
    return col(new NumberCol(key, key.stringValue(""), false));
  }

  public CsvStructureHeader numberCol(String key) {
    return col(new NumberCol(Text.from(key), key, false));
  }

  public CsvStructureHeader numberCol() {
    return col(new NumberCol(Value.absent(), "", false));
  }

  public CsvStructureHeader itemCol(Value key, Parser<? extends Item> itemParser) {
    return col(new ItemCol(key, key.stringValue(""), false, itemParser));
  }

  public CsvStructureHeader itemCol(String key, Parser<? extends Item> itemParser) {
    return col(new ItemCol(Text.from(key), key, false, itemParser));
  }

  public CsvStructureHeader itemCol(Parser<? extends Item> itemParser) {
    return col(new ItemCol(Value.absent(), "", false, itemParser));
  }

  public static CsvStructureHeader empty() {
    return new CsvStructureHeader(FingerTrieSeq.empty());
  }
}
