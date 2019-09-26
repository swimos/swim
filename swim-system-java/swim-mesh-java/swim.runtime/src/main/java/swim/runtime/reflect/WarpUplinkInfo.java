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

import swim.runtime.WarpContext;
import swim.structure.Form;
import swim.structure.Item;
import swim.structure.Kind;
import swim.structure.Record;
import swim.structure.Value;

public class WarpUplinkInfo extends UplinkInfo implements WarpInfo {
  protected final Value linkKey;
  protected final boolean connected;
  protected final boolean remote;
  protected final boolean secure;

  public WarpUplinkInfo(Value linkKey, boolean connected, boolean remote, boolean secure) {
    this.linkKey = linkKey;
    this.connected = connected;
    this.remote = remote;
    this.secure = secure;
  }

  public final Value linkKey() {
    return this.linkKey;
  }

  public final boolean connected() {
    return this.connected;
  }

  public final boolean remote() {
    return this.remote;
  }

  public final boolean secure() {
    return this.secure;
  }

  @Override
  public Value toValue() {
    return warpUplinkForm().mold(this).toValue();
  }

  public static WarpUplinkInfo from(WarpContext warpContext) {
    return new WarpUplinkInfo(warpContext.linkKey(), warpContext.isConnectedUp(),
                              warpContext.isRemoteUp(), warpContext.isSecureUp());
  }

  private static Form<WarpUplinkInfo> warpUplinkForm;

  @Kind
  public static Form<WarpUplinkInfo> warpUplinkForm() {
    if (warpUplinkForm == null) {
      warpUplinkForm = new WarpUplinkInfoForm();
    }
    return warpUplinkForm;
  }
}

final class WarpUplinkInfoForm extends Form<WarpUplinkInfo> {
  @Override
  public Class<?> type() {
    return WarpUplinkInfo.class;
  }

  @Override
  public Item mold(WarpUplinkInfo info) {
    if (info != null) {
      final Record record = Record.create(4);
      record.slot("linkKey", info.linkKey);
      if (info.connected) {
        record.slot("connected", info.connected);
      }
      if (info.remote) {
        record.slot("remote", info.remote);
      }
      if (info.secure) {
        record.slot("secure", info.secure);
      }
      return record;
    } else {
      return Item.extant();
    }
  }

  @Override
  public WarpUplinkInfo cast(Item item) {
    final Value value = item.toValue();
    final Value linkKey = value.get("linkKey");
    if (linkKey.isDefined()) {
      final boolean connected = value.get("connected").booleanValue(false);
      final boolean remote = value.get("remote").booleanValue(false);
      final boolean secure = value.get("secure").booleanValue(false);
      return new WarpUplinkInfo(linkKey, connected, remote, secure);
    }
    return null;
  }
}
