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

package swim.runtime.reflect;

import swim.runtime.LaneBinding;
import swim.structure.Form;
import swim.structure.Item;
import swim.structure.Kind;
import swim.structure.Record;
import swim.structure.Value;
import swim.uri.Uri;

public class LaneInfo {
  protected final Uri laneUri;
  protected final String laneType;

  public LaneInfo(Uri laneUri, String laneType) {
    this.laneUri = laneUri;
    this.laneType = laneType;
  }

  public final Uri laneUri() {
    return this.laneUri;
  }

  public final String laneType() {
    return this.laneType;
  }

  public Value toValue() {
    return form().mold(this).toValue();
  }

  public static LaneInfo from(LaneBinding laneBinding) {
    return new LaneInfo(laneBinding.laneUri(), laneBinding.laneType());
  }

  private static Form<LaneInfo> form;

  @Kind
  public static Form<LaneInfo> form() {
    if (form == null) {
      form = new LaneInfoForm();
    }
    return form;
  }
}

final class LaneInfoForm extends Form<LaneInfo> {
  @Override
  public Class<?> type() {
    return LaneInfo.class;
  }

  @Override
  public Item mold(LaneInfo info) {
    if (info != null) {
      final Record record = Record.create(2);
      record.slot("laneUri", info.laneUri.toString());
      record.slot("laneType", info.laneType);
      return record;
    } else {
      return Item.extant();
    }
  }

  @Override
  public LaneInfo cast(Item item) {
    final Value value = item.toValue();
    final Uri laneUri = Uri.form().cast(value.get("laneUri"));
    final String laneType = value.get("laneType").stringValue(null);
    if (laneUri != null && laneType != null) {
      return new LaneInfo(laneUri, laneType);
    }
    return null;
  }
}
