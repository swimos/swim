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

package swim.uri;

import swim.codec.ParserException;
import swim.structure.Form;
import swim.structure.Item;
import swim.structure.Text;
import swim.structure.Value;

public class UriPathForm extends Form<UriPath> {

  final UriPath unit;

  UriPathForm(UriPath unit) {
    this.unit = unit;
  }

  @Override
  public UriPath unit() {
    return this.unit;
  }

  @Override
  public Form<UriPath> unit(UriPath unit) {
    return new UriPathForm(unit);
  }

  @Override
  public Class<UriPath> type() {
    return UriPath.class;
  }

  @Override
  public Item mold(UriPath value) {
    if (value != null) {
      return Text.from(value.toString());
    } else {
      return Item.extant();
    }
  }

  @Override
  public UriPath cast(Item item) {
    final Value value = item.target();
    try {
      final String string = value.stringValue();
      if (string != null) {
        return UriPath.parse(string);
      }
    } catch (UnsupportedOperationException | ParserException | UriException e) {
      // swallow
    }
    return null;
  }

}
