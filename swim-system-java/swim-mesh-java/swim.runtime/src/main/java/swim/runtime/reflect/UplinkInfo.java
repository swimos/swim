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

import swim.runtime.LinkContext;
import swim.runtime.WarpContext;
import swim.structure.Form;
import swim.structure.Item;
import swim.structure.Kind;

public abstract class UplinkInfo extends LinkInfo {
  public static UplinkInfo from(LinkContext linkContext) {
    if (linkContext instanceof WarpContext) {
      return WarpUplinkInfo.from((WarpContext) linkContext);
    } else {
      return null;
    }
  }

  private static Form<UplinkInfo> uplinkForm;

  @Kind
  public static Form<UplinkInfo> uplinkForm() {
    if (uplinkForm == null) {
      uplinkForm = new UplinkInfoForm();
    }
    return uplinkForm;
  }
}

final class UplinkInfoForm extends Form<UplinkInfo> {
  @Override
  public Class<?> type() {
    return UplinkInfo.class;
  }

  @Override
  public Item mold(UplinkInfo info) {
    return info.toValue();
  }

  @Override
  public UplinkInfo cast(Item item) {
    final WarpUplinkInfo warpUplinkInfo = WarpUplinkInfo.warpUplinkForm().cast(item);
    if (warpUplinkInfo != null) {
      return warpUplinkInfo;
    }
    return null;
  }
}
