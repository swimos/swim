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

package swim.api.space;

import java.util.Collection;
import swim.api.plane.Plane;
import swim.api.plane.PlaneFactory;
import swim.api.policy.PlanePolicy;
import swim.api.ref.SwimRef;
import swim.concurrent.Schedule;
import swim.concurrent.Stage;
import swim.util.Log;

public interface Space extends SwimRef, Log {
  Schedule schedule();

  Stage stage();

  PlanePolicy policy();

  <P extends Plane> P openPlane(String planeName, PlaneFactory<P> planeFactory);

  <P extends Plane> P openPlane(String planeName, Class<? extends P> planeClass);

  Plane getPlane(String planeName);

  <P extends Plane> P getPlane(Class<? extends P> planeClass);

  Collection<? extends Plane> planes();
}
