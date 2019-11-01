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
import swim.avro.schema.AvroFieldType;
import swim.avro.schema.AvroRecordType;
import swim.collections.FingerTrieSeq;
import swim.structure.Item;
import swim.structure.Record;
import swim.structure.Value;
import swim.util.Builder;

final class RecordStructureType extends AvroRecordType<Item, Value> {
  final AvroName fullName;
  final String doc;
  final FingerTrieSeq<AvroName> aliases;
  final FingerTrieSeq<AvroFieldType<?, ? extends Item>> fields;

  RecordStructureType(AvroName fullName, String doc, FingerTrieSeq<AvroName> aliases,
                      FingerTrieSeq<AvroFieldType<?, ? extends Item>> fields) {
    this.fullName = fullName;
    this.doc = doc;
    this.aliases = aliases;
    this.fields = fields;
  }

  RecordStructureType(AvroName fullName) {
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
  public AvroRecordType<Item, Value> doc(String doc) {
    return new RecordStructureType(this.fullName, doc, this.aliases, this.fields);
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
  public AvroRecordType<Item, Value> alias(AvroName alias) {
    return new RecordStructureType(this.fullName, this.doc, this.aliases.appended(alias), this.fields);
  }

  @Override
  public int fieldCount() {
    return this.fields.size();
  }

  @Override
  public AvroFieldType<?, ? extends Item> getField(int index) {
    return this.fields.get(index);
  }

  @Override
  public AvroRecordType<Item, Value> field(AvroFieldType<?, ? extends Item> field) {
    return new RecordStructureType(this.fullName, this.doc, this.aliases, this.fields.appended(field));
  }

  @Override
  public Builder<Item, Value> recordBuilder() {
    return Record.builder();
  }
}
