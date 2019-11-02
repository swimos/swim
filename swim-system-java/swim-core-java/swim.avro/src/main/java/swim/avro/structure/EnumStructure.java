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

package swim.avro.structure;

import swim.avro.AvroName;
import swim.avro.schema.AvroEnumType;
import swim.collections.FingerTrieSeq;
import swim.structure.Text;
import swim.structure.Value;

final class EnumStructure extends AvroEnumType<Value> {
  final AvroName fullName;
  final String doc;
  final FingerTrieSeq<AvroName> aliases;
  final FingerTrieSeq<Text> symbols;

  EnumStructure(AvroName fullName, String doc, FingerTrieSeq<AvroName> aliases,
                FingerTrieSeq<Text> symbols) {
    this.fullName = fullName;
    this.doc = doc;
    this.aliases = aliases;
    this.symbols = symbols;
  }

  EnumStructure(AvroName fullName, FingerTrieSeq<Text> symbols) {
    this(fullName, null, FingerTrieSeq.empty(), symbols);
  }

  EnumStructure(AvroName fullName) {
    this(fullName, null, FingerTrieSeq.empty(), FingerTrieSeq.empty());
  }

  @Override
  public AvroName fullName() {
    return this.fullName;
  }

  @Override
  public String doc() {
    return this.doc;
  }

  @Override
  public AvroEnumType<Value> doc(String doc) {
    return new EnumStructure(this.fullName, doc, this.aliases, this.symbols);
  }

  @Override
  public int aliasCount() {
    return this.aliases.size();
  }

  @Override
  public AvroName getAlias(int index) {
    return this.aliases.get(index);
  }

  @Override
  public AvroEnumType<Value> alias(AvroName alias) {
    return new EnumStructure(this.fullName, this.doc, this.aliases.appended(alias), this.symbols);
  }

  @Override
  public int symbolCount() {
    return this.symbols.size();
  }

  @Override
  public String getSymbol(int ordinal) {
    return this.symbols.get(ordinal).stringValue();
  }

  @Override
  public AvroEnumType<Value> symbol(String symbol) {
    return new EnumStructure(this.fullName, this.doc, this.aliases, this.symbols.appended(Text.from(symbol).commit()));
  }

  @Override
  public Value cast(int ordinal) {
    return this.symbols.get(ordinal);
  }
}
