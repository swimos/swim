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

package swim.runtime;

import java.util.Collection;
import swim.uri.Uri;
import swim.uri.UriPattern;

public interface HostDef extends CellDef {
  Uri hostUri();

  UriPattern hostPattern();

  boolean isPrimary();

  boolean isReplica();

  Collection<? extends NodeDef> nodeDefs();

  NodeDef getNodeDef(Uri nodeUri);

  Collection<? extends LaneDef> laneDefs();

  LaneDef getLaneDef(Uri laneUri);
}
