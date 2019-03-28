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

package swim.xml;

import swim.codec.Output;
import swim.codec.Unicode;
import swim.structure.Attr;
import swim.structure.Item;
import swim.structure.Record;
import swim.structure.Slot;
import swim.structure.Text;
import swim.structure.Value;
import swim.util.Builder;

public class XmlStructureParser extends XmlParser<Item, Value> {
  @Override
  public Item item(Value value) {
    return value;
  }

  @Override
  public String name(String name) {
    return name;
  }

  @Override
  public Item attribute(String name, Value value) {
    return Slot.of(name, value);
  }

  @Override
  public Value attributes() {
    return Value.extant();
  }

  @Override
  public Item xml(Value attributes) {
    return Attr.of(XML_TAG, attributes);
  }

  @Override
  public Item doctype(String name) {
    return Attr.of(XML_DOCTYPE_TAG, name);
  }

  @Override
  public Item doctype(String name, String systemId) {
    return Attr.of(XML_DOCTYPE_TAG,
                   Record.of(Slot.of("name", name),
                             Slot.of("system", systemId)));
  }

  @Override
  public Item doctype(String name, String publicId, String systemId) {
    return Attr.of(XML_DOCTYPE_TAG,
                    Record.of(Slot.of("name", name),
                              Slot.of("public", publicId),
                              Slot.of("system", systemId)));
  }

  @Override
  public Item tag(String name) {
    return Attr.of(name);
  }

  @Override
  public Item tag(String name, Value attributes) {
    return Attr.of(name, attributes);
  }

  @Override
  public Item comment(String value) {
    return Attr.of(XML_COMMENT_TAG, value);
  }

  @Override
  public Item pi(String target, String value) {
    return Attr.of(XML_PI_TAG, Record.of(target, value));
  }

  @Override
  public Output<String> nameOutput() {
    return Unicode.stringOutput();
  }

  @SuppressWarnings("unchecked")
  @Override
  public Output<Value> textOutput() {
    return (Output<Value>) (Output<?>) Text.output();
  }

  @SuppressWarnings("unchecked")
  @Override
  public Builder<Item, Value> attributesBuilder() {
    return (Builder<Item, Value>) (Builder<?, ?>) Record.create();
  }

  @SuppressWarnings("unchecked")
  @Override
  public Builder<Item, Value> tagBuilder(String name) {
    final Builder<Item, Record> builder = Record.create();
    builder.add(tag(name));
    return (Builder<Item, Value>) (Builder<?, ?>) builder;
  }

  @SuppressWarnings("unchecked")
  @Override
  public Builder<Item, Value> tagBuilder(String name, Value attributes) {
    final Builder<Item, Record> builder = Record.create();
    builder.add(tag(name, attributes));
    return (Builder<Item, Value>) (Builder<?, ?>) builder;
  }

  @SuppressWarnings("unchecked")
  @Override
  public Builder<Item, Value> documentBuilder() {
    return (Builder<Item, Value>) (Builder<?, ?>) Record.create();
  }

  @SuppressWarnings("unchecked")
  @Override
  public Builder<Item, Value> fragmentBuilder() {
    return (Builder<Item, Value>) (Builder<?, ?>) Record.create();
  }

  static final Text XML_TAG = Text.from("xml");
  static final Text XML_DOCTYPE_TAG = Text.from("xml:doctype");
  static final Text XML_COMMENT_TAG = Text.from("xml:comment");
  static final Text XML_PI_TAG = Text.from("xml:pi");
}
