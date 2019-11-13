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

import swim.codec.Parser;
import swim.codec.Unicode;
import swim.collections.FingerTrieSeq;
import swim.csv.schema.CsvCol;
import swim.structure.Item;
import swim.structure.Text;
import swim.structure.Value;

public final class CsvStructure {
  private CsvStructure() {
    // static
  }

  public static CsvStructureHeader header(CsvStructureCol... cols) {
    return new HeaderStructure(FingerTrieSeq.of(cols));
  }

  public static CsvStructureHeader header() {
    return HeaderStructure.empty();
  }

  public static CsvStructureHeader array(CsvCol<? extends Item> col, int colCount) {
    return new ArrayStructure(col, colCount);
  }

  public static CsvStructureHeader array(CsvCol<? extends Item> col) {
    return new ArrayStructure(col, Integer.MAX_VALUE);
  }

  public static CsvStructureCol stringCol(Value key) {
    return new StringStructure(key, key.stringValue(""), false);
  }

  public static CsvStructureCol stringCol(String key) {
    return new StringStructure(Text.from(key), key, false);
  }

  public static CsvStructureCol stringCol() {
    return new StringStructure(Value.absent(), "", false);
  }

  public static CsvStructureCol numberCol(Value key) {
    return new NumberStructure(key, key.stringValue(""), false);
  }

  public static CsvStructureCol numberCol(String key) {
    return new NumberStructure(Text.from(key), key, false);
  }

  public static CsvStructureCol numberCol() {
    return new NumberStructure(Value.absent(), "", false);
  }

  public static CsvStructureCol nullCol(Value key) {
    return new ParsedStructure(key, key.stringValue(""), true, Unicode.nullParser());
  }

  public static CsvStructureCol nullCol(String key) {
    return new ParsedStructure(Text.from(key), key, true, Unicode.nullParser());
  }

  public static CsvStructureCol nullCol() {
    return new ParsedStructure(Value.absent(), "", true, Unicode.nullParser());
  }

  public static CsvStructureCol parsedCol(Value key, Parser<? extends Item> itemParser) {
    return new ParsedStructure(key, key.stringValue(""), false, itemParser);
  }

  public static CsvStructureCol parsedCol(String key, Parser<? extends Item> itemParser) {
    return new ParsedStructure(Text.from(key), key, false, itemParser);
  }

  public static CsvStructureCol parsedCol(Parser<? extends Item> itemParser) {
    return new ParsedStructure(Value.absent(), "", false, itemParser);
  }
}
