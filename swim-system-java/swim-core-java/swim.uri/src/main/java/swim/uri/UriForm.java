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

package swim.uri;

import swim.codec.ParserException;
import swim.structure.Form;
import swim.structure.Item;
import swim.structure.Text;
import swim.structure.Value;

public class UriForm extends Form<Uri> {
  final Uri unit;

  UriForm(Uri unit) {
    this.unit = unit;
  }

  @Override
  public Uri unit() {
    return this.unit;
  }

  @Override
  public Form<Uri> unit(Uri unit) {
    return new UriForm(unit);
  }

  @Override
  public Class<Uri> type() {
    return Uri.class;
  }

  @Override
  public Item mold(Uri value) {
    if (value != null) {
      return Text.from(value.toString());
    } else {
      return Item.extant();
    }
  }

  @Override
  public Uri cast(Item item) {
    final Value value = item.target();
    try {
      final String string = value.stringValue();
      if (string != null) {
        return Uri.parse(string);
      }
    } catch (UnsupportedOperationException | ParserException | UriException e) {
      // swallow
    }
    return null;
  }
}
