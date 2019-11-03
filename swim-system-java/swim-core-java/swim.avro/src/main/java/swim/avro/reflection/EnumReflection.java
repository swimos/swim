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

package swim.avro.reflection;

import swim.avro.AvroName;
import swim.avro.schema.AvroEnumType;
import swim.collections.FingerTrieSeq;

final class EnumReflection<T extends Enum<T>> extends AvroEnumType<T> {
  final AvroName fullName;
  final String doc;
  final FingerTrieSeq<AvroName> aliases;
  final FingerTrieSeq<T> symbols;

  EnumReflection(AvroName fullName, String doc, FingerTrieSeq<AvroName> aliases,
                 FingerTrieSeq<T> symbols) {
    this.fullName = fullName;
    this.doc = doc;
    this.aliases = aliases;
    this.symbols = symbols;
  }

  EnumReflection(AvroName fullName, FingerTrieSeq<T> symbols) {
    this(fullName, null, FingerTrieSeq.empty(), symbols);
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
  public AvroEnumType<T> doc(String doc) {
    return new EnumReflection<T>(this.fullName, doc, this.aliases, this.symbols);
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
  public AvroEnumType<T> alias(AvroName alias) {
    return new EnumReflection<T>(this.fullName, this.doc, this.aliases.appended(alias), this.symbols);
  }

  @Override
  public int symbolCount() {
    return this.symbols.size();
  }

  @Override
  public String getSymbol(int ordinal) {
    return this.symbols.get(ordinal).name();
  }

  @Override
  public AvroEnumType<T> symbol(String symbol) {
    throw new UnsupportedOperationException();
  }

  @Override
  public T cast(int ordinal) {
    return this.symbols.get(ordinal);
  }
}
