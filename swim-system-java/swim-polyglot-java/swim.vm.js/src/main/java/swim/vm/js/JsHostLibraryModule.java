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

package swim.vm.js;

import java.util.Collection;
import org.graalvm.polyglot.Value;
import org.graalvm.polyglot.proxy.ProxyObject;
import swim.dynamic.HostLibrary;
import swim.dynamic.HostType;
import swim.uri.UriPath;
import swim.vm.VmProxyArray;

public class JsHostLibraryModule implements JsModule, ProxyObject {
  final JsBridge bridge;
  final JsModuleSystem moduleSystem;
  final UriPath moduleId;
  final HostLibrary library;

  public JsHostLibraryModule(JsBridge bridge, JsModuleSystem moduleSystem,
                             UriPath moduleId, HostLibrary library) {
    this.bridge = bridge;
    this.moduleSystem = moduleSystem;
    this.moduleId = moduleId;
    this.library = library;
  }

  @Override
  public final JsModuleSystem moduleSystem() {
    return this.moduleSystem;
  }

  @Override
  public final UriPath moduleId() {
    return this.moduleId;
  }

  @Override
  public Value moduleExports() {
    return this.bridge.jsContext.asValue(this);
  }

  @Override
  public void evalModule() {
    // nop
  }

  @Override
  public boolean hasMember(String key) {
    return this.library.getHostType(key) != null;
  }

  @Override
  public Object getMember(String key) {
    final HostType<?> typeMember = this.library.getHostType(key);
    return typeMember != null ? this.bridge.hostTypeToGuestType(typeMember) : null;
  }

  @Override
  public void putMember(String key, Value guestValue) {
    throw new UnsupportedOperationException();
  }

  @Override
  public boolean removeMember(String key) {
    throw new UnsupportedOperationException();
  }

  @Override
  public Object getMemberKeys() {
    final Collection<HostType<?>> typeMembers = this.library.hostTypes();
    final String[] typeMemberKeys = new String[typeMembers.size()];
    int i = 0;
    for (HostType<?> typeMember : typeMembers) {
      typeMemberKeys[i] = typeMember.typeName();
      i += 1;
    }
    return new VmProxyArray(typeMemberKeys);
  }
}
