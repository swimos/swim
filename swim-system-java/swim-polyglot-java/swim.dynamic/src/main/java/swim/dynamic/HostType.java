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

package swim.dynamic;

import java.util.Collection;
import java.util.List;

/**
 * A dynamic type descriptor for a host type.
 */
public interface HostType<T> {
  String typeName();

  Class<?> hostClass();

  boolean isBuiltin();

  HostType<? super T> superType();

  List<HostType<? super T>> baseTypes();

  boolean inheritsType(HostType<?> superType);

  HostStaticMember getOwnStaticMember(Bridge bridge, String key);

  Collection<HostStaticMember> ownStaticMembers(Bridge bridge);

  HostStaticMember getStaticMember(Bridge bridge, String key);

  Collection<HostStaticMember> staticMembers(Bridge bridge);
}
