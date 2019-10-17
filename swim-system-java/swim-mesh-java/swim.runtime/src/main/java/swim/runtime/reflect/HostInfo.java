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

import swim.runtime.HostBinding;
import swim.structure.Form;
import swim.structure.Item;
import swim.structure.Kind;
import swim.structure.Record;
import swim.structure.Value;
import swim.uri.Uri;

public class HostInfo {
  protected final Uri hostUri;
  protected final boolean connected;
  protected final boolean remote;
  protected final boolean secure;
  protected final boolean primary;
  protected final boolean replica;
  protected final boolean master;
  protected final boolean slave;
  protected final long nodeCount;

  public HostInfo(Uri hostUri, boolean connected, boolean remote, boolean secure,
                  boolean primary, boolean replica, boolean master, boolean slave,
                  long nodeCount) {
    this.hostUri = hostUri;
    this.connected = connected;
    this.remote = remote;
    this.secure = secure;
    this.primary = primary;
    this.replica = replica;
    this.master = master;
    this.slave = slave;
    this.nodeCount = nodeCount;
  }

  public final Uri hostUri() {
    return this.hostUri;
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

  public final boolean primary() {
    return this.primary;
  }

  public final boolean replica() {
    return this.replica;
  }

  public final boolean master() {
    return this.master;
  }

  public final boolean slave() {
    return this.slave;
  }

  public final long nodeCount() {
    return this.nodeCount;
  }

  public Value toValue() {
    return form().mold(this).toValue();
  }

  public static HostInfo from(HostBinding hostBinding) {
    return new HostInfo(hostBinding.hostUri(), hostBinding.isConnected(), hostBinding.isRemote(),
                        hostBinding.isSecure(), hostBinding.isPrimary(), hostBinding.isReplica(),
                        hostBinding.isMaster(), hostBinding.isSlave(), (long) hostBinding.nodes().size());
  }

  private static Form<HostInfo> form;

  @Kind
  public static Form<HostInfo> form() {
    if (form == null) {
      form = new HostInfoForm();
    }
    return form;
  }
}

final class HostInfoForm extends Form<HostInfo> {
  @Override
  public Class<?> type() {
    return HostInfo.class;
  }

  @Override
  public Item mold(HostInfo info) {
    if (info != null) {
      final Record record = Record.create(9);
      record.slot("hostUri", info.hostUri.toString());
      record.slot("connected", info.connected);
      if (info.remote) {
        record.slot("remote", info.remote);
      }
      if (info.secure) {
        record.slot("secure", info.secure);
      }
      if (info.primary) {
        record.slot("primary", info.primary);
      }
      if (info.replica) {
        record.slot("replica", info.replica);
      }
      if (info.master) {
        record.slot("master", info.master);
      }
      if (info.slave) {
        record.slot("slave", info.slave);
      }
      if (info.nodeCount != 0L) {
        record.slot("nodeCount", info.nodeCount);
      }
      return record;
    } else {
      return Item.extant();
    }
  }

  @Override
  public HostInfo cast(Item item) {
    final Value value = item.toValue();
    final Uri hostUri = Uri.form().cast(value.get("hostUri"));
    if (hostUri != null) {
      final boolean connected = value.get("connected").booleanValue(false);
      final boolean remote = value.get("remote").booleanValue(false);
      final boolean secure = value.get("secure").booleanValue(false);
      final boolean primary = value.get("primary").booleanValue(false);
      final boolean replica = value.get("replica").booleanValue(false);
      final boolean master = value.get("master").booleanValue(false);
      final boolean slave = value.get("slave").booleanValue(false);
      final long nodeCount = value.get("nodeCount").longValue(0L);
      return new HostInfo(hostUri, connected, remote, secure, primary, replica, master, slave, nodeCount);
    }
    return null;
  }
}
