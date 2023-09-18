// Copyright 2015-2023 Nstream, inc.
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
import swim.structure.Record;

final class RecordStructure extends AvroRecordType<Record, Record> {

  final AvroName fullName;
  final String doc;
  final FingerTrieSeq<AvroName> aliases;
  final FingerTrieSeq<AvroFieldType<?, Record>> fields;

  RecordStructure(AvroName fullName, String doc, FingerTrieSeq<AvroName> aliases,
                  FingerTrieSeq<AvroFieldType<?, Record>> fields) {
    this.fullName = fullName;
    this.doc = doc;
    this.aliases = aliases;
    this.fields = fields;
  }

  RecordStructure(AvroName fullName) {
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
  public AvroRecordType<Record, Record> doc(String doc) {
    return new RecordStructure(this.fullName, doc, this.aliases, this.fields);
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
  public AvroRecordType<Record, Record> alias(AvroName alias) {
    return new RecordStructure(this.fullName, this.doc, this.aliases.appended(alias), this.fields);
  }

  @Override
  public int fieldCount() {
    return this.fields.size();
  }

  @Override
  public AvroFieldType<?, Record> getField(int index) {
    return this.fields.get(index);
  }

  @Override
  public AvroRecordType<Record, Record> field(AvroFieldType<?, Record> field) {
    return new RecordStructure(this.fullName, this.doc, this.aliases, this.fields.appended(field));
  }

  @Override
  public Record create() {
    return Record.create();
  }

  @Override
  public Record cast(Record record) {
    return record;
  }

}
